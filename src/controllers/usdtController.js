// // // const axios = require("axios");
// // // const crypto = require("crypto");
// // // const User = require("../models/User");

// // // const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
// // // const FRONTEND_URL = process.env.FRONTEND_URL;
// // // const BACKEND_URL = process.env.BACKEND_URL;

// // // // ===============================
// // // // INITIATE USDT (TRC20) PAYMENT
// // // // ===============================
// // // exports.initUSDTPayment = async (req, res) => {
// // //   const { amount } = req.body;
// // //   const user = req.user;

// // //   if (!amount) {
// // //     return res.status(400).json({ message: "Amount is required" });
// // //   }

// // //   // 🔒 Realistic minimum for NowPayments
// // //   if (Number(amount) < 10) {
// // //     return res
// // //       .status(400)
// // //       .json({ message: "Minimum funding amount is 10 USDT" });
// // //   }

// // //   try {
// // //     const response = await axios.post(
// // //       "https://api.nowpayments.io/v1/invoice",
// // //       {
// // //         price_amount: Number(amount),
// // //         price_currency: "usd",           // USD pricing
// // //         pay_currency: "usdttrc20",       // User pays in USDT TRC20

// // //         order_id: `${user._id}-${Date.now()}`,
// // //         order_description: `Funding wallet for ${user.email}`,

// // //         success_url: `${FRONTEND_URL}/fund-success`,
// // //         cancel_url: `${FRONTEND_URL}/fund-cancel`,

// // //         // ✅ REQUIRED FOR BALANCE UPDATE
// // //         ipn_callback_url: `${BACKEND_URL}/api/usdt/webhook`,
// // //       },
// // //       {
// // //         headers: {
// // //           "x-api-key": NOWPAYMENTS_API_KEY,
// // //           "Content-Type": "application/json",
// // //         },
// // //       }
// // //     );

// // //     return res.json({
// // //       invoice_url: response.data.invoice_url,
// // //     });
// // //   } catch (err) {
// // //     console.error("NowPayments init error:", err.response?.data || err.message);
// // //     return res.status(500).json({
// // //       message: "Payment initialization failed",
// // //     });
// // //   }
// // // };

// // // // ===============================
// // // // NOWPAYMENTS WEBHOOK
// // // // ===============================
// // // exports.usdtWebhook = async (req, res) => {
// // //   const payload = req.body;

// // //   try {
// // //     // ===============================
// // //     // 🔐 VERIFY SIGNATURE
// // //     // ===============================
// // //     const receivedSig = req.headers["x-nowpayments-sig"];
// // //     const expectedSig = crypto
// // //       .createHmac("sha512", NOWPAYMENTS_API_KEY)
// // //       .update(JSON.stringify(payload))
// // //       .digest("hex");

// // //     if (receivedSig !== expectedSig) {
// // //       console.warn("Invalid NowPayments signature");
// // //       return res.status(401).json({ ok: false });
// // //     }

// // //     // ===============================
// // //     // ✅ PROCESS COMPLETED PAYMENT
// // //     // ===============================
// // //     if (payload.payment_status === "finished") {
// // //       const [userId] = payload.order_id.split("-");

// // //       // 🛑 Prevent double-credit
// // //       if (payload.already_paid === false) {
// // //         await User.findByIdAndUpdate(
// // //           userId,
// // //           {
// // //             $inc: { wallet: payload.pay_amount }, // ✅ CREDIT ACTUAL USDT PAID
// // //           },
// // //           { new: true }
// // //         );

// // //         console.log(
// // //           `Wallet credited: ${payload.pay_amount} USDT → User ${userId}`
// // //         );
// // //       }
// // //     }

// // //     return res.status(200).json({ ok: true });
// // //   } catch (err) {
// // //     console.error("Webhook error:", err.message);
// // //     return res.status(500).json({ ok: false });
// // //   }
// // // };

// // // controllers/usdtController.js

// // import axios from "axios";
// // import crypto from "crypto";
// // import User from "../models/User.js";
// // import Transaction from "../models/Transaction.js";

// // const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
// // const FRONTEND_URL = process.env.FRONTEND_URL;
// // const BACKEND_URL = process.env.BACKEND_URL;

// // // ===============================
// // // INITIATE USDT (TRC20) PAYMENT
// // // ===============================
// // export const initUSDTPayment = async (req, res) => {
// //   const { amount } = req.body;
// //   const user = req.user;

// //   if (!amount) {
// //     return res.status(400).json({ message: "Amount is required" });
// //   }

// //   if (Number(amount) < 10) {
// //     return res
// //       .status(400)
// //       .json({ message: "Minimum funding amount is 10 USDT" });
// //   }

// //   try {
// //     const response = await axios.post(
// //       "https://api.nowpayments.io/v1/invoice",
// //       {
// //         price_amount: Number(amount),
// //         price_currency: "usd",
// //         pay_currency: "usdttrc20",

// //         order_id: `${user._id}-${Date.now()}`,
// //         order_description: `Funding wallet for ${user.email}`,

// //         success_url: `${FRONTEND_URL}/fund-success`,
// //         cancel_url: `${FRONTEND_URL}/fund-cancel`,
// //         ipn_callback_url: `${BACKEND_URL}/api/usdt/webhook`,
// //       },
// //       {
// //         headers: {
// //           "x-api-key": NOWPAYMENTS_API_KEY,
// //           "Content-Type": "application/json",
// //         },
// //       }
// //     );

// //     // 📝 Store transaction as PENDING
// //     await Transaction.create({
// //       userId: user._id,
// //       reference: response.data.id,  // NowPayments invoice ID
// //       amount: Number(amount),
// //       status: "PENDING",
// //       provider: "NOWPAYMENTS",
// //     });

// //     return res.json({
// //       invoice_url: response.data.invoice_url,
// //       reference: response.data.id,
// //       pay_currency: response.data.pay_currency,
// //       price_amount: response.data.price_amount,
// //     });
// //   } catch (err) {
// //     console.error("NowPayments init error:", err.response?.data || err.message);
// //     return res.status(500).json({ message: "Payment initialization failed" });
// //   }
// // };

// // // ===============================
// // // NOWPAYMENTS WEBHOOK
// // // ===============================
// // export const usdtWebhook = async (req, res) => {
// //   const payload = req.body;

// //   try {
// //     const receivedSig = req.headers["x-nowpayments-sig"];
// //     const expectedSig = crypto
// //       .createHmac("sha512", NOWPAYMENTS_API_KEY)
// //       .update(JSON.stringify(payload))
// //       .digest("hex");

// //     if (receivedSig !== expectedSig) {
// //       console.warn("Invalid NowPayments signature");
// //       return res.status(401).json({ ok: false });
// //     }

// //     // Only process completed payments
// //     if (payload.payment_status === "finished") {
// //       const [userId] = payload.order_id.split("-");

// //       // Prevent double-credit
// //       if (!payload.already_paid) {
// //         const user = await User.findByIdAndUpdate(
// //           userId,
// //           { $inc: { walletBalance: payload.pay_amount } },
// //           { new: true }
// //         );

// //         if (user) {
// //           console.log(`✅ Wallet credited: ${payload.pay_amount} USDT → User ${userId}`);

// //           // ✅ Update transaction status
// //           await Transaction.findOneAndUpdate(
// //             { reference: payload.id },   // match invoice ID
// //             { status: "SUCCESS" },
// //             { new: true }
// //           );
// //         } else {
// //           console.warn(`⚠️ User not found: ${userId}`);
// //         }
// //       } else {
// //         console.log(`⚠️ Payment already processed for order ${payload.order_id}`);
// //       }
// //     } else {
// //       // Optionally mark failed payments
// //       await Transaction.findOneAndUpdate(
// //         { reference: payload.id },
// //         { status: payload.payment_status.toUpperCase() || "FAILED" }
// //       );
// //     }

// //     return res.status(200).json({ ok: true });
// //   } catch (err) {
// //     console.error("Webhook error:", err.message);
// //     return res.status(500).json({ ok: false });
// //   }
// // };


// import axios from "axios";
// import crypto from "crypto";
// import User from "../models/User.js";
// import Transaction from "../models/Transaction.js";

// const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
// const FRONTEND_URL = process.env.FRONTEND_URL;
// const BACKEND_URL = process.env.BACKEND_URL;
// const USDT_NGN_RATE = Number(process.env.USDT_NGN_RATE || 1500);

// // ===============================
// // INITIATE USDT (TRC20) PAYMENT
// // ===============================
// export const initUSDTPayment = async (req, res) => {
//   const { amount } = req.body;
//   const user = req.user;

//   if (!amount || Number(amount) < 10) {
//     return res
//       .status(400)
//       .json({ message: "Minimum funding amount is 10 USDT" });
//   }

//   try {
//     const response = await axios.post(
//       "https://api.nowpayments.io/v1/invoice",
//       {
//         price_amount: Number(amount),
//         price_currency: "usd",
//         pay_currency: "usdttrc20",

//         order_id: `${user._id}-${Date.now()}`,
//         order_description: `Wallet funding for ${user.email}`,

//         success_url: `${FRONTEND_URL}/fund-success`,
//         cancel_url: `${FRONTEND_URL}/fund-cancel`,
//         ipn_callback_url: `${BACKEND_URL}/api/usdt/webhook`,
//       },
//       {
//         headers: {
//           "x-api-key": NOWPAYMENTS_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // 📝 Save transaction as PENDING
//     await Transaction.create({
//       userId: user._id,
//       reference: response.data.id, // NowPayments invoice ID
//       usdtAmount: Number(amount),
//       ngnAmount: 0,
//       exchangeRate: USDT_NGN_RATE,
//       status: "PENDING",
//       provider: "NOWPAYMENTS",
//     });

//     return res.json({
//       invoice_url: response.data.invoice_url,
//       reference: response.data.id,
//     });
//   } catch (err) {
//     console.error("NowPayments init error:", err.response?.data || err.message);
//     return res.status(500).json({ message: "Payment initialization failed" });
//   }
// };

// // ===============================
// // NOWPAYMENTS WEBHOOK
// // ===============================
// export const usdtWebhook = async (req, res) => {
//   const payload = req.body;

//   try {
//     // 🔐 Verify webhook signature
//     const receivedSig = req.headers["x-nowpayments-sig"];
//     const expectedSig = crypto
//       .createHmac("sha512", NOWPAYMENTS_API_KEY)
//       .update(JSON.stringify(payload))
//       .digest("hex");

//     if (receivedSig !== expectedSig) {
//       console.warn("❌ Invalid NowPayments signature");
//       return res.status(401).json({ ok: false });
//     }

//     // ✅ Only handle successful payments
//     if (payload.payment_status === "finished") {
//       const [userId] = payload.order_id.split("-");

//       // 🛑 Prevent double credit
//       const alreadyProcessed = await Transaction.findOne({
//         reference: payload.id,
//         status: "SUCCESS",
//       });

//       if (alreadyProcessed) {
//         console.log("⚠️ Payment already processed");
//         return res.status(200).json({ ok: true });
//       }

//       const usdtAmount = Number(payload.pay_amount);
//       const ngnAmount = usdtAmount * USDT_NGN_RATE;

//       // 💰 Credit user wallet (NAIRA)
//       const user = await User.findByIdAndUpdate(
//         userId,
//         { $inc: { walletBalanceNGN: ngnAmount } },
//         { new: true }
//       );

//       if (!user) {
//         console.warn("⚠️ User not found");
//         return res.status(200).json({ ok: true });
//       }

//       // 🧾 Update transaction
//       await Transaction.findOneAndUpdate(
//         { reference: payload.id },
//         {
//           status: "SUCCESS",
//           usdtAmount,
//           ngnAmount,
//           exchangeRate: USDT_NGN_RATE,
//         },
//         { new: true }
//       );

//       console.log(
//         `✅ Credited ₦${ngnAmount} (${usdtAmount} USDT) to user ${userId}`
//       );
//     }

//     return res.status(200).json({ ok: true });
//   } catch (err) {
//     console.error("Webhook error:", err.message);
//     return res.status(500).json({ ok: false });
//   }
// };

import axios from "axios";
import crypto from "crypto";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;
const USDT_NGN_RATE = Number(process.env.USDT_NGN_RATE || 1500);

// ===============================
// INITIATE USDT (TRC20) PAYMENT
// ===============================
export const initUSDTPayment = async (req, res) => {
  const { amount } = req.body;
  const user = req.user;

  if (!amount || Number(amount) < 10) {
    return res
      .status(400)
      .json({ message: "Minimum funding amount is 10 USDT" });
  }

  try {
    // 1️⃣ Create invoice with NowPayments
    const response = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      {
        price_amount: Number(amount),
        price_currency: "usd",
        pay_currency: "usdttrc20",
        order_id: `${user._id}-${Date.now()}`,
        order_description: `Wallet funding for ${user.email}`,
        success_url: `${FRONTEND_URL}/fund-success`,
        cancel_url: `${FRONTEND_URL}/fund-cancel`,
        ipn_callback_url: `${BACKEND_URL}/api/usdt/webhook`,
      },
      {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // 2️⃣ Save transaction with correct schema fields
    await Transaction.create({
      user: user._id,                     // matches schema
      reference: response.data.id,        // NowPayments invoice ID
      amount: Number(amount),             // required by schema
      currency: "USDT",                   // required by schema
      exchangeRate: USDT_NGN_RATE,        // optional, only for USDT
      ngnAmount: Number(amount) * USDT_NGN_RATE, // optional field for convenience
      status: "PENDING",
      provider: "NOWPAYMENTS",
    });

    return res.json({
      invoice_url: response.data.invoice_url,
      reference: response.data.id,
    });
  } catch (err) {
    console.error("NowPayments init error:", err.response?.data || err.message);
    return res.status(500).json({ message: "Payment initialization failed" });
  }
};

// ===============================
// NOWPAYMENTS WEBHOOK
// ===============================
export const usdtWebhook = async (req, res) => {
  const payload = req.body;

  try {
    // 1️⃣ Verify webhook signature
    const receivedSig = req.headers["x-nowpayments-sig"];
    const expectedSig = crypto
      .createHmac("sha512", NOWPAYMENTS_API_KEY)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (receivedSig !== expectedSig) {
      console.warn("❌ Invalid NowPayments signature");
      return res.status(401).json({ ok: false });
    }

    // 2️⃣ Only handle finished payments
    if (payload.payment_status === "finished") {
      const [userId] = payload.order_id.split("-");

      // Prevent double processing
      const alreadyProcessed = await Transaction.findOne({
        reference: payload.id,
        status: "SUCCESS",
      });

      if (alreadyProcessed) {
        console.log("⚠️ Payment already processed");
        return res.status(200).json({ ok: true });
      }

      const usdtAmount = Number(payload.pay_amount);
      const ngnAmount = usdtAmount * USDT_NGN_RATE;

      // 3️⃣ Credit user wallet
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { walletBalanceNGN: ngnAmount } },
        { new: true }
      );

      if (!user) {
        console.warn("⚠️ User not found");
        return res.status(200).json({ ok: true });
      }

      // 4️⃣ Update transaction
      await Transaction.findOneAndUpdate(
        { reference: payload.id },
        {
          status: "SUCCESS",
          amount: usdtAmount,          // USDT amount
          ngnAmount,
          exchangeRate: USDT_NGN_RATE,
        },
        { new: true }
      );

      console.log(
        `✅ Credited ₦${ngnAmount} (${usdtAmount} USDT) to user ${userId}`
      );
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(500).json({ ok: false });
  }
};
