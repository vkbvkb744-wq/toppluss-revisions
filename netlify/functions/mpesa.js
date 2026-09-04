const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { phone, amount, userId } = JSON.parse(event.body);

  try {
    const res = await fetch("https://payment.intasend.com/api/v1/payment/mpesa-stk-push/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-IntaSend-Public-API-Key": process.env.INSTASEND_PUBLIC_KEY,
        "Authorization": `Bearer ${process.env.INSTASEND_PRIVATE_KEY}`
      },
      body: JSON.stringify({
        phone_number: phone,
        amount: amount,
        currency: "KES",
        api_ref: userId,
        narrative: "Toppluss Revisions Payment"
      })
    });

    const data = await res.json();
    console.log("IntaSend response:", JSON.stringify(data));

    if (res.ok) {
      const invoiceId = data.invoice?.invoice_id || data.id;
      if (invoiceId) {
        const { error: insertErr } = await supabase
          .from("pending_payments")
          .insert([{
            invoice_id: invoiceId,
            user_id: userId,
            phone: phone,
            amount: amount,
            status: "pending",
          }]);
        if (insertErr) {
          console.error("Failed to save pending_payment:", insertErr);
        }
      } else {
        console.error("No invoice_id found in IntaSend response:", data);
      }

      return { statusCode: 200, body: JSON.stringify({ success: true, ...data }) };
    } else {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: data.detail || JSON.stringify(data) }) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
