exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { phone, amount } = JSON.parse(event.body);

  try {
    const authRes = await fetch("https://api.instasend.io/api/v1/auth/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        public_key: process.env.INSTASEND_PUBLIC_KEY,
        secret_key: process.env.INSTASEND_SECRET_KEY
      })
    });
    const authData = await authRes.json();
    const token = authData.token;

    const res = await fetch("https://api.instasend.io/api/v1/payment/mpesa-stk-push/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        phone_number: phone,
        amount: amount,
        currency: "KES",
        narrative: "Toppluss Payment"
      })
    });

    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
