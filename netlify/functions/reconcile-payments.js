const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_DAYS = { biweekly: 14, monthly: 30, sixmonth: 180, annual: 365 };

exports.handler = async () => {
  try {
    // Only check payments older than 5 minutes, giving the webhook
    // a fair chance to process them normally first.
    const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: pending, error: fetchErr } = await supabase
      .from("pending_payments")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", cutoff);

    if (fetchErr) {
      console.error("Failed to fetch pending_payments:", fetchErr);
      return { statusCode: 500, body: "Failed to fetch pending payments" };
    }

    if (!pending || pending.length === 0) {
      console.log("No pending payments to reconcile.");
      return { statusCode: 200, body: "Nothing to reconcile" };
    }

    console.log(`Reconciling ${pending.length} pending payment(s)...`);

    for (const payment of pending) {
      try {
        // Check status directly with IntaSend (POST with invoice_id in body)
        const res = await fetch(
          "https://payment.intasend.com/api/v1/payment/status/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-IntaSend-Public-API-Key": process.env.INSTASEND_PUBLIC_KEY,
              "Authorization": `Bearer ${process.env.INSTASEND_PRIVATE_KEY}`
            },
            body: JSON.stringify({ invoice_id: payment.invoice_id })
          }
        );

        if (!res.ok) {
          const text = await res.text();
          console.error(`Status check failed for invoice ${payment.invoice_id}: HTTP ${res.status} — ${text.slice(0, 200)}`);
          continue;
        }

        const data = await res.json();
        const state = data.invoice?.state;

        if (state !== "COMPLETE") {
          console.log(`Invoice ${payment.invoice_id} still ${state || "unknown"}, skipping.`);
          continue;
        }

        // Already activated by the webhook? Check subscriptions table.
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("checkout_request_id", payment.invoice_id)
          .maybeSingle();

        if (existingSub) {
          console.log(`Invoice ${payment.invoice_id} already activated by webhook. Marking reconciled.`);
          await supabase
            .from("pending_payments")
            .update({ status: "reconciled", reconciled_at: new Date().toISOString() })
            .eq("id", payment.id);
          continue;
        }

        // Not activated yet — do it now, same logic as the webhook.
        const amount = Math.round(parseFloat(data.invoice?.value || payment.amount || 0));
        const plan =
          amount >= 1200 ? "annual" :
          amount >= 800 ? "sixmonth" :
          amount >= 200 ? "monthly" :
          "biweekly";
        const days = PLAN_DAYS[plan];
        const now = new Date();
        const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        await supabase
          .from("subscriptions")
          .update({ status: "superseded" })
          .eq("user_id", payment.user_id)
          .eq("status", "active");

        const { error: insertErr } = await supabase
          .from("subscriptions")
          .insert([{
            user_id: payment.user_id,
            plan,
            phone: payment.phone,
            status: "active",
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            checkout_request_id: payment.invoice_id,
          }]);

        if (insertErr) {
          console.error(`Failed to activate subscription for invoice ${payment.invoice_id}:`, insertErr);
          continue;
        }

        console.log(`Activated missed payment: invoice ${payment.invoice_id}, user ${payment.user_id}, plan ${plan}`);

        await supabase
          .from("pending_payments")
          .update({ status: "reconciled", reconciled_at: new Date().toISOString() })
          .eq("id", payment.id);

      } catch (innerErr) {
        console.error(`Error processing invoice ${payment.invoice_id}:`, innerErr);
      }
    }

    return { statusCode: 200, body: "Reconciliation complete" };
  } catch (err) {
    console.error("Reconciliation error:", err);
    return { statusCode: 500, body: err.message };
  }
};
