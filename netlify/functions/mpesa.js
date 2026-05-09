exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { phone, amount } = JSON.parse(event.body);

  try {
    const res = await fetch("https://payment.intasend.com/api/v1/payment/mpesa-stk-push/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-IntaSend-Public-API-Key": process.env.INSTASEND_PUBLIC_KEY,
        "Authorization": `Bearer ${process.env.INSTASEND_SECRET_KEY}`
      },
      body: JSON.stringify({
        phone_number: phone,
        amount: amount,
        currency: "KES",
        narrative: "Toppluss Payment"
      })
    });

    const data = await res.json();
    console.log("IntaSend response:", JSON.stringify(data));
    
    if (res.ok) {
      return { statusCode: 200, body: JSON.stringify({ success: true, ...data }) };
    } else {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: data.detail || JSON.stringify(data) }) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
