// import axios from "axios";

// // Environment variables
// const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
// const FRONTEND_URL = process.env.FRONTEND_URL;

// // Initialize USDT/TRX Payment
// export const initUSDTPayment = async (req, res) => {
//   const { amount, userId, currency = "usdt_trx" } = req.body;

//   if (!amount || !userId) {
//     return res.status(400).json({ message: "Amount and userId are required" });
//   }

//   try {
//     // Create a payment via NowPayments API
//     const response = await axios.post(
//       "https://api.nowpayments.io/v1/payment",
//       {
//         price_amount: amount,           // Amount user wants to fund
//         price_currency: "usd",          // Base currency
//         pay_currency: currency,         // Target crypto: USDT on TRX
//         order_id: `${userId}-${Date.now()}`, // Unique order ID
//         order_description: "Funding wallet on RealSMS",
//         success_url: `${FRONTEND_URL}/fund-success`,
//         cancel_url: `${FRONTEND_URL}/fund-cancel`,
//       },
//       {
//         headers: {
//           "x-api-key": NOWPAYMENTS_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // Return payment info to frontend
//     res.json(response.data);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ message: "Payment initialization failed" });
//   }
// };

// // Webhook to confirm payment
// export const usdtWebhook = async (req, res) => {
//   const payload = req.body;

//   try {
//     // Check payment status
//     if (payload.payment_status === "finished") {
//       console.log("Payment completed for order:", payload.order_id);

//       // TODO: Update user's wallet in DB
//       // Example:
//       // await User.findById(userId).updateOne({ $inc: { wallet: payload.price_amount } });
//     }

//     res.status(200).json({ ok: true });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ ok: false });
//   }
// };


const axios = require("axios");

exports.initUSDTPayment = async (req, res) => {
  const { amount } = req.body;
  const user = req.user; // 👈 from JWT middleware

  if (!amount) {
    return res.status(400).json({ message: "Amount is required" });
  }

  try {
    const response = await axios.post(
      "https://api.nowpayments.io/v1/payment",
      {
        price_amount: amount,
        price_currency: "usd",
        pay_currency: "usdt_trx",
        order_id: `${user._id}-${Date.now()}`,
        order_description: `Wallet funding for ${user.email}`,
        success_url: `${process.env.FRONTEND_URL}/fund-success`,
        cancel_url: `${process.env.FRONTEND_URL}/fund-cancel`,
      },
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};
