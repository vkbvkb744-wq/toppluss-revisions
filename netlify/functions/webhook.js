const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_DAYS = { monthly: 30, sixmonth: 180, annual: 365 };

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    console.log("Webhook received:", JSON.stringify(body));

    if (body.challenge !== process.env.INTASEND_CHALLENGE) {
      return { statusCode: 401, body: "Unauthorized" };
    }

    if (body.state !== "COMPLETE") {
      return { statusCode: 200, body: "Not complete" };
    }

    // FIX 1: Read phone from account field if phone_number is missing
    let phone = body.phone_number || body.account;

    // FIX 2: Convert 254XXXXXXXXX → 07XXXXXXXXX to match profiles table
    if (phone && phone.startsWith("254")) {
      phone = "0" + phone.slice(3);
    }

    const amount = parseFloat(body.net_amount || body.value || body.amount || 0);

    // Determine plan from amount paid (highest tier first)
    // Monthly = KSh 200, 6 Months = KSh 800, 12 Months = KSh 1,200
    const plan = amount >= 1200 ? "annual" : amount >= 800 ? "sixmonth" : "monthly";

    const days = PLAN_DAYS[plan];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const checkoutRequestId = body.checkout_request_id || body.id || body.invoice_id || null;

    // FIX 3: Identify the user by api_ref (the userId we attached when starting
    // the STK push) instead of relying only on phone number matching.
    // This means the account gets activated even if the person pays using a
    // different phone number than the one they registered with.
    let profile = null;
    const apiRefUserId = body.api_ref;

    if (apiRefUserId) {
      const { data: byId } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", apiRefUserId)
        .single();
      if (byId) profile = byId;
    }

    // Fallback: match by phone number if api_ref lookup didn't find anyone
    if (!profile) {
      const { data: byPhone } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .single();
      if (byPhone) profile = byPhone;
    }

    if (!profile) {
      console.error("User not found. api_ref:", apiRefUserId, "phone:", phone);
      return { statusCode: 200, body: "User not found" };
    }

    await supabase
      .from("subscriptions")
      .update({ status: "superseded" })
      .eq("user_id", profile.id)
      .eq("status", "active");

    await supabase.from("subscriptions").insert([{
      user_id: profile.id,
      plan,
      phone,
      status: "active",
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      checkout_request_id: checkoutRequestId,
    }]);

    console.log("Activated:", profile.id, phone, plan, checkoutRequestId);
    return { statusCode: 200, body: "OK" };

  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, body: err.message };
  }
};
