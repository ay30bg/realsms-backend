const axios = require("axios");
const User = require("../models/User"); // Make sure your User model exists

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Initialize USDT/TRC20 Payment
exports.initUSDTPayment = async (req, res) => {
  const { amount } = req.body;
  const user = req.user; // Comes from protect middleware

  if (!amount) {
    return res.status(400).json({ message: "Amount is required" });
  }

  if (Number(amount) < 3) {
    return res.status(400).json({ message: "Minimum funding amount is 10 USDT" });
  }

  try {
    // ✅ Create an invoice via NowPayments API
    const response = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      {
        price_amount: Number(amount),                 // Amount user wants to fund
        price_currency: "usd",                        // Base currency
        pay_currency: "usdttrc20",                    // Target crypto
        order_id: `${user._id}-${Date.now()}`,        // Unique order ID
        order_description: `Funding wallet for ${user.email}`,
        success_url: `${FRONTEND_URL}/fund-success`,
        cancel_url: `${FRONTEND_URL}/fund-cancel`,
      },
      {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("NowPayments invoice response:", response.data);

    // Return invoice_url to frontend
    res.json({
      invoice_url: response.data.invoice_url, // frontend will redirect here
    });
  } catch (err) {
    console.error("NowPayments error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

// Webhook to confirm payment
exports.usdtWebhook = async (req, res) => {
  const payload = req.body;

  try {
    if (payload.payment_status === "finished") {
      console.log("Payment completed for order:", payload.order_id);

      // Extract userId from order_id: "userId-timestamp"
      const [userId] = payload.order_id.split("-");

      // Update user's wallet in DB
      await User.findByIdAndUpdate(
        userId,
        { $inc: { wallet: payload.price_amount } },
        { new: true }
      );

      console.log(`Wallet credited for user: ${userId}`);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ ok: false });
  }
};
