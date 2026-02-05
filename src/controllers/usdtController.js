// const axios = require("axios");
// const crypto = require("crypto");
// const User = require("../models/User");

// const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
// const FRONTEND_URL = process.env.FRONTEND_URL;
// const BACKEND_URL = process.env.BACKEND_URL;

// // ===============================
// // INITIATE USDT (TRC20) PAYMENT
// // ===============================
// exports.initUSDTPayment = async (req, res) => {
//   const { amount } = req.body;
//   const user = req.user;

//   if (!amount) {
//     return res.status(400).json({ message: "Amount is required" });
//   }

//   // 🔒 Realistic minimum for NowPayments
//   if (Number(amount) < 10) {
//     return res
//       .status(400)
//       .json({ message: "Minimum funding amount is 10 USDT" });
//   }

//   try {
//     const response = await axios.post(
//       "https://api.nowpayments.io/v1/invoice",
//       {
//         price_amount: Number(amount),
//         price_currency: "usd",           // USD pricing
//         pay_currency: "usdttrc20",       // User pays in USDT TRC20

//         order_id: `${user._id}-${Date.now()}`,
//         order_description: `Funding wallet for ${user.email}`,

//         success_url: `${FRONTEND_URL}/fund-success`,
//         cancel_url: `${FRONTEND_URL}/fund-cancel`,

//         // ✅ REQUIRED FOR BALANCE UPDATE
//         ipn_callback_url: `${BACKEND_URL}/api/usdt/webhook`,
//       },
//       {
//         headers: {
//           "x-api-key": NOWPAYMENTS_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return res.json({
//       invoice_url: response.data.invoice_url,
//     });
//   } catch (err) {
//     console.error("NowPayments init error:", err.response?.data || err.message);
//     return res.status(500).json({
//       message: "Payment initialization failed",
//     });
//   }
// };

// // ===============================
// // NOWPAYMENTS WEBHOOK
// // ===============================
// exports.usdtWebhook = async (req, res) => {
//   const payload = req.body;

//   try {
//     // ===============================
//     // 🔐 VERIFY SIGNATURE
//     // ===============================
//     const receivedSig = req.headers["x-nowpayments-sig"];
//     const expectedSig = crypto
//       .createHmac("sha512", NOWPAYMENTS_API_KEY)
//       .update(JSON.stringify(payload))
//       .digest("hex");

//     if (receivedSig !== expectedSig) {
//       console.warn("Invalid NowPayments signature");
//       return res.status(401).json({ ok: false });
//     }

//     // ===============================
//     // ✅ PROCESS COMPLETED PAYMENT
//     // ===============================
//     if (payload.payment_status === "finished") {
//       const [userId] = payload.order_id.split("-");

//       // 🛑 Prevent double-credit
//       if (payload.already_paid === false) {
//         await User.findByIdAndUpdate(
//           userId,
//           {
//             $inc: { wallet: payload.pay_amount }, // ✅ CREDIT ACTUAL USDT PAID
//           },
//           { new: true }
//         );

//         console.log(
//           `Wallet credited: ${payload.pay_amount} USDT → User ${userId}`
//         );
//       }
//     }

//     return res.status(200).json({ ok: true });
//   } catch (err) {
//     console.error("Webhook error:", err.message);
//     return res.status(500).json({ ok: false });
//   }
// };

// controllers/usdtController.js

import axios from "axios";
import crypto from "crypto";
import User from "../models/User.js";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

// ===============================
// INITIATE USDT (TRC20) PAYMENT
// ===============================
export const initUSDTPayment = async (req, res) => {
  const { amount } = req.body;
  const user = req.user;

  if (!amount) {
    return res.status(400).json({ message: "Amount is required" });
  }

  // 🔒 Minimum amount enforced by your business logic
  if (Number(amount) < 10) {
    return res
      .status(400)
      .json({ message: "Minimum funding amount is 10 USDT" });
  }

  try {
    const response = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      {
        price_amount: Number(amount),       // USD pricing
        price_currency: "usd",
        pay_currency: "usdttrc20",          // TRC20 USDT

        order_id: `${user._id}-${Date.now()}`,
        order_description: `Funding wallet for ${user.email}`,

        success_url: `${FRONTEND_URL}/fund-success`,
        cancel_url: `${FRONTEND_URL}/fund-cancel`,

        // ✅ REQUIRED TO UPDATE BALANCE
        ipn_callback_url: `${BACKEND_URL}/api/usdt/webhook`,
      },
      {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      invoice_url: response.data.invoice_url,
      price_amount: response.data.price_amount,   // Optional: show exact amount
      pay_currency: response.data.pay_currency,
    });
  } catch (err) {
    console.error("NowPayments init error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Payment initialization failed",
    });
  }
};

// ===============================
// NOWPAYMENTS WEBHOOK
// ===============================
export const usdtWebhook = async (req, res) => {
  const payload = req.body;

  try {
    // 🔐 VERIFY SIGNATURE
    const receivedSig = req.headers["x-nowpayments-sig"];
    const expectedSig = crypto
      .createHmac("sha512", NOWPAYMENTS_API_KEY)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (receivedSig !== expectedSig) {
      console.warn("Invalid NowPayments signature");
      return res.status(401).json({ ok: false });
    }

    // ✅ PROCESS COMPLETED PAYMENTS ONLY
    if (payload.payment_status === "finished") {
      const [userId] = payload.order_id.split("-");

      // 🛑 Prevent double-credit
      if (!payload.already_paid) {
        const user = await User.findByIdAndUpdate(
          userId,
          {
            $inc: { walletBalance: payload.pay_amount }, // credit wallet
          },
          { new: true }
        );

        if (user) {
          console.log(
            `✅ Wallet credited: ${payload.pay_amount} USDT → User ${userId}`
          );
        } else {
          console.warn(`⚠️ User not found: ${userId}`);
        }
      } else {
        console.log(`⚠️ Payment already processed for order ${payload.order_id}`);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(500).json({ ok: false });
  }
};
