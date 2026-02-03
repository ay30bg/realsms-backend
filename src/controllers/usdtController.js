// // import axios from "axios";

// // // Environment variables
// // const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
// // const FRONTEND_URL = process.env.FRONTEND_URL;

// // // Initialize USDT/TRX Payment
// // export const initUSDTPayment = async (req, res) => {
// //   const { amount, userId, currency = "usdt_trx" } = req.body;

// //   if (!amount || !userId) {
// //     return res.status(400).json({ message: "Amount and userId are required" });
// //   }

// //   try {
// //     // Create a payment via NowPayments API
// //     const response = await axios.post(
// //       "https://api.nowpayments.io/v1/payment",
// //       {
// //         price_amount: amount,           // Amount user wants to fund
// //         price_currency: "usd",          // Base currency
// //         pay_currency: currency,         // Target crypto: USDT on TRX
// //         order_id: `${userId}-${Date.now()}`, // Unique order ID
// //         order_description: "Funding wallet on RealSMS",
// //         success_url: `${FRONTEND_URL}/fund-success`,
// //         cancel_url: `${FRONTEND_URL}/fund-cancel`,
// //       },
// //       {
// //         headers: {
// //           "x-api-key": NOWPAYMENTS_API_KEY,
// //           "Content-Type": "application/json",
// //         },
// //       }
// //     );

// //     // Return payment info to frontend
// //     res.json(response.data);
// //   } catch (err) {
// //     console.error(err.response?.data || err.message);
// //     res.status(500).json({ message: "Payment initialization failed" });
// //   }
// // };

// // // Webhook to confirm payment
// // export const usdtWebhook = async (req, res) => {
// //   const payload = req.body;

// //   try {
// //     // Check payment status
// //     if (payload.payment_status === "finished") {
// //       console.log("Payment completed for order:", payload.order_id);

// //       // TODO: Update user's wallet in DB
// //       // Example:
// //       // await User.findById(userId).updateOne({ $inc: { wallet: payload.price_amount } });
// //     }

// //     res.status(200).json({ ok: true });
// //   } catch (err) {
// //     console.error(err.message);
// //     res.status(500).json({ ok: false });
// //   }
// // };

// const axios = require("axios");
// const User = require("../models/User"); // Make sure your User model exists

// const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
// const FRONTEND_URL = process.env.FRONTEND_URL;

// // Initialize USDT/TRX Payment
// exports.initUSDTPayment = async (req, res) => {
//   const { amount } = req.body;
//   const user = req.user; // Comes from protect middleware

//   if (!amount) {
//     return res.status(400).json({ message: "Amount is required" });
//   }

//   if (amount < 10) {
//     return res.status(400).json({ message: "Minimum funding amount is 10 USDT" });
//   }

//   try {
//     // Create a payment via NowPayments API
//     const response = await axios.post(
//       "https://api.nowpayments.io/v1/payment",
//       {
//         price_amount: Number(amount),           // Amount user wants to fund
//         price_currency: "usd",                  // Base currency
//         pay_currency: "usdttrc20",               // Target crypto: USDT on TRX
//         order_id: `${user._id}-${Date.now()}`,  // Unique order ID
//         order_description: `Funding wallet for ${user.email}`,
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

//     // Return invoice/payment info to frontend
//     res.json(response.data);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ message: "Payment initialization failed" });
//   }
// };

// // Webhook to confirm payment
// exports.usdtWebhook = async (req, res) => {
//   const payload = req.body;

//   try {
//     if (payload.payment_status === "finished") {
//       console.log("Payment completed for order:", payload.order_id);

//       // Extract userId from order_id: "userId-timestamp"
//       const [userId] = payload.order_id.split("-");

//       // Update user's wallet in DB
//       await User.findByIdAndUpdate(
//         userId,
//         { $inc: { wallet: payload.price_amount } },
//         { new: true }
//       );

//       console.log(`Wallet credited for user: ${userId}`);
//     }

//     res.status(200).json({ ok: true });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ ok: false });
//   }
// };

const axios = require("axios");
const User = require("../models/User"); // Make sure your User model exists

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Initialize USDT/TRC20 Payment
exports.initUSDTPayment = async (req, res) => {
  const { amount } = req.body;
  const user = req.user; // Comes from your protect middleware

  if (!amount) {
    return res.status(400).json({ message: "Amount is required" });
  }

  if (Number(amount) < 10) {
    return res.status(400).json({ message: "Minimum funding amount is 10 USDT" });
  }

  try {
    // Create a payment via NowPayments API
    const response = await axios.post(
      "https://api.nowpayments.io/v1/payment",
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

    // ✅ Return payment URL to frontend mapped as invoice_url
    res.json({
      invoice_url: response.data.payment_url, // maps NowPayments payment_url
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
