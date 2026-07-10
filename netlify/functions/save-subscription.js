// netlify/functions/save-subscription.js
// Called after successful M-Pesa STK push confirmation
// POST { userId, plan: "monthly" | "sixmonth" | "annual", phone }
// Inserts subscription row with correct expiry

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_DAYS = {
  monthly: 30,
  sixmonth: 180,
  annual: 365,
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { userId, plan, phone } = body;

  if (!userId || !plan || !PLAN_DAYS[plan]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "userId and valid plan (monthly/sixmonth/annual) required" }),
    };
  }

  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PLAN_DAYS[plan] * 24 * 60 * 60 * 1000);

    // Expire any existing active subscriptions first
    await supabase
      .from("subscriptions")
      .update({ status: "superseded" })
      .eq("user_id", userId)
      .eq("status", "active");

    // Insert new subscription
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: userId,
          plan,
          phone,
          status: "active",
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        plan: sub.plan,
        expiresAt: sub.expires_at,
        daysLeft: PLAN_DAYS[plan],
      }),
    };
  } catch (err) {
    console.error("save-subscription error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
