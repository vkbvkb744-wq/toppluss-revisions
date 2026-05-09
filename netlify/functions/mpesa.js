exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { phone, amount } = JSON.parse(event.body);

  try {
    const response = await fetch("https://api.instasend.io/api/v1/payment-links/stk-push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INSTASEND_KEY}`
      },
      body: JSON.stringify({
        phone_number: phone,
        amount: amount,
        currency: "KES",
        narrative: "Toppluss Payment"
      })
    });

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
