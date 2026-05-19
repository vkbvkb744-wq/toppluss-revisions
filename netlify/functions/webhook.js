const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_DAYS = { weekly: 7, monthly: 30 };

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

    const phone = body.phone_number;
    const amount = parseFloat(body.net_amount || body.amount || 0);
    const plan = amount >= 200 ? "monthly" : "weekly";
    const days = PLAN_DAYS[plan];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .single();

    if (!profile) {
      console.error("User not found:", phone);
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
    }]);

    console.log("Activated:", phone, plan);
    return { statusCode: 200, body: "OK" };

  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, body: err.message };
  }
};
