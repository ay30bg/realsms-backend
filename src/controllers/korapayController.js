const axios = require("axios");

// Create a new Korapay charge
const initKorapayCharge = async (req, res) => {
  try {
    const { amount, email, name } = req.body;

    if (!amount || !email || !name) {
      return res.status(400).json({ message: "Amount, name and email are required" });
    }

    // ✅ Convert amount to kobo (if NGN)
    const amountInKobo = Number(amount) * 100;

    // Create unique reference
    const reference = `rsms-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Call Korapay API
    const response = await axios.post(
      "https://api.korapay.com/merchant/charges",
      {
        amount: amountInKobo,
        currency: "NGN",
        reference,
        customer_email: email,
        customer_name: name,
        // optional: add metadata
        metadata: {
          source: "RealSMS Wallet",
        },
        // optional: webhook URL for verification
        notification_url: process.env.KORAPAY_NOTIFICATION_URL || "",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return the reference & charge details to frontend
    return res.status(200).json({
      reference: response.data.data.reference,
      amount: response.data.data.amount,
      currency: response.data.data.currency,
      checkout_url: response.data.data.checkout_url,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res
      .status(err.response?.status || 500)
      .json({ message: err.response?.data?.message || err.message });
  }
};

module.exports = { initKorapayCharge };
