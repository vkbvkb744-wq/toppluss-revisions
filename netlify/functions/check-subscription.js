// netlify/functions/check-subscription.js
// Called on every login to verify/expire subscriptions
// POST { userId }
// Returns { active, plan, expiresAt, daysLeft } or { active: false, reason: "expired" }

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

  const { userId } = body;
  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: "userId required" }) };
  }

  try {
    // Fetch the active subscription for this user
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // FIX: maybeSingle() returns null (not an error) when there are simply
    // no rows. A real `error` here means something actually went wrong
    // (network, RLS, timeout) — previously that was treated identically to
    // "no subscription", which could tell a paying subscriber they're
    // unsubscribed during a transient DB hiccup, since this runs on every
    // login. Surface real errors as a 500 instead of masking them.
    if (error) {
      console.error("check-subscription query error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Could not verify subscription, please retry" }),
      };
    }

    if (!sub) {
      // Genuinely no active subscription found
      return {
        statusCode: 200,
        body: JSON.stringify({ active: false, reason: "no_subscription" }),
      };
    }

    const now = new Date();
    const expiresAt = new Date(sub.expires_at);
    const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    if (now > expiresAt) {
      // Mark as expired in DB
      await supabase
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("id", sub.id);

      return {
        statusCode: 200,
        body: JSON.stringify({
          active: false,
          reason: "expired",
          plan: sub.plan,
          expiredAt: sub.expires_at,
        }),
      };
    }

    // Still active
    return {
      statusCode: 200,
      body: JSON.stringify({
        active: true,
        plan: sub.plan,
        expiresAt: sub.expires_at,
        daysLeft,
        subscriptionId: sub.id,
      }),
    };
  } catch (err) {
    console.error("check-subscription error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
