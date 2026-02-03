// // import axios from "axios";
// // import crypto from "crypto";
// // import Transaction from "../models/Transaction.js";
// // import User from "../models/User.js";

// // export const initOpayPayment = async (req, res) => {
// //   try {
// //     const { amount, userId } = req.body;
// //     if (!amount || amount < 100) return res.status(400).json({ message: "Invalid amount" });

// //     // Create transaction in DB
// //     const reference = `OPAY_${Date.now()}`;
// //     const transaction = await Transaction.create({
// //       userId,
// //       reference,
// //       amount,
// //       status: "PENDING",
// //     });

// //     // Payload to Opay
// //     const payload = {
// //       country: "NG",
// //       reference,
// //       amount: { total: amount, currency: "NGN" },
// //       returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
// //       cancelUrl: `${process.env.FRONTEND_URL}/payment-cancel`,
// //       callbackUrl: `${process.env.FRONTEND_URL}/api/opay/webhook`,
// //       userInfo: { userId, userName: "RealSMS User" },
// //     };

// //     const sign = crypto
// //       .createHmac("sha512", process.env.OPAY_SECRET_KEY)
// //       .update(JSON.stringify(payload))
// //       .digest("hex");

// //     const response = await axios.post(
// //       "https://api.opaycheckout.com/api/v1/international/cashier/create",
// //       payload,
// //       {
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${process.env.OPAY_PUBLIC_KEY}`,
// //           MerchantId: process.env.OPAY_MERCHANT_ID,
// //           Sign: sign,
// //         },
// //       }
// //     );

// //     return res.json({ paymentUrl: response.data.data.cashierUrl, reference });
// //   } catch (err) {
// //     console.error(err.response?.data || err.message);
// //     res.status(500).json({ message: "Payment initialization failed" });
// //   }
// // };

// // export const opayWebhook = async (req, res) => {
// //   try {
// //     const payload = req.body;
// //     const { reference, status } = payload;

// //     // Find transaction
// //     const transaction = await Transaction.findOne({ reference });
// //     if (!transaction) return res.sendStatus(404);

// //     // Prevent double credit
// //     if (transaction.status === "SUCCESS") return res.sendStatus(200);

// //     if (status === "SUCCESS") {
// //       // Update user wallet
// //       const user = await User.findById(transaction.userId);
// //       if (user) {
// //         user.walletBalance += transaction.amount;
// //         await user.save();
// //       }

// //       transaction.status = "SUCCESS";
// //     } else {
// //       transaction.status = "FAILED";
// //     }

// //     await transaction.save();
// //     res.sendStatus(200);
// //   } catch (err) {
// //     console.error(err);
// //     res.sendStatus(500);
// //   }
// // };

// // controllers/opayController.js
// import axios from "axios";
// import crypto from "crypto";
// import Transaction from "../models/Transaction.js";
// import User from "../models/User.js";

// // =======================
// // INIT OPay PAYMENT
// // =======================
// export const initOpayPayment = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     // 1️⃣ Validate input
//     if (!amount || amount < 100) {
//       return res.status(400).json({ message: "Invalid amount. Minimum is 100 NGN." });
//     }

//     // 2️⃣ Ensure user is authenticated
//     const userId = req.user?._id; // req.user should be set by your auth middleware
//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized. User not logged in." });
//     }

//     // 3️⃣ Create a unique transaction reference
//     const reference = `OPAY_${Date.now()}`;

//     // 4️⃣ Create transaction in DB with PENDING status
//     const transaction = await Transaction.create({
//       userId,
//       reference,
//       amount,
//       status: "PENDING",
//     });

//     // 5️⃣ Prepare payload for Opay
//     const payload = {
//       country: "NG",
//       reference,
//       amount: { total: amount, currency: "NGN" },
//       returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
//       cancelUrl: `${process.env.FRONTEND_URL}/payment-cancel`,
//       callbackUrl: `${process.env.FRONTEND_URL}/api/opay/webhook`,
//       userInfo: { userId, userName: req.user.name || "RealSMS User" },
//     };

//     // 6️⃣ Sign the payload
//     const sign = crypto
//       .createHmac("sha512", process.env.OPAY_SECRET_KEY)
//       .update(JSON.stringify(payload))
//       .digest("hex");

//     // 7️⃣ Call Opay API
//     const response = await axios.post(
//       "https://api.opaycheckout.com/api/v1/international/cashier/create",
//       payload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.OPAY_PUBLIC_KEY}`,
//           MerchantId: process.env.OPAY_MERCHANT_ID,
//           Sign: sign,
//         },
//       }
//     );

//     // 8️⃣ Return cashier URL and reference
//     return res.status(201).json({
//       paymentUrl: response.data.data.cashierUrl,
//       reference,
//     });

//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ message: "Payment initialization failed", error: err.message });
//   }
// };

// // =======================
// // OPay WEBHOOK
// // =======================
// export const opayWebhook = async (req, res) => {
//   try {
//     const payload = req.body;
//     const { reference, status } = payload;

//     // Find the transaction
//     const transaction = await Transaction.findOne({ reference });
//     if (!transaction) return res.sendStatus(404);

//     // Prevent double credit
//     if (transaction.status === "SUCCESS") return res.sendStatus(200);

//     // Update transaction and user wallet
//     if (status === "SUCCESS") {
//       const user = await User.findById(transaction.userId);
//       if (user) {
//         user.walletBalance += transaction.amount;
//         await user.save();
//       }
//       transaction.status = "SUCCESS";
//     } else {
//       transaction.status = "FAILED";
//     }

//     await transaction.save();
//     res.sendStatus(200);

//   } catch (err) {
//     console.error(err);
//     res.sendStatus(500);
//   }
// };

import axios from "axios";
import crypto from "crypto";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const initOpayPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Invalid amount. Minimum is 100 NGN." });
    }

    const userId = req.user._id; // ✅ comes from protect middleware

    // Create unique reference
    const reference = `OPAY_${Date.now()}`;

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      reference,
      amount,
      status: "PENDING",
    });

    // Prepare Opay payload
    const payload = {
      country: "NG",
      reference,
      amount: { total: amount, currency: "NGN" },
      returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment-cancel`,
      callbackUrl: `${process.env.BACKEND_URL}/api/opay/webhook`,
      userInfo: { userId, userName: req.user.name || "RealSMS User" },
    };

    const sign = crypto
      .createHmac("sha512", process.env.OPAY_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest("hex");

    const response = await axios.post(
      "https://api.opaycheckout.com/api/v1/international/cashier/create",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPAY_PUBLIC_KEY}`,
          MerchantId: process.env.OPAY_MERCHANT_ID,
          Sign: sign,
        },
      }
    );

    res.status(201).json({
      paymentUrl: response.data.data.cashierUrl,
      reference,
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Payment initialization failed", error: err.message });
  }
};

export const opayWebhook = async (req, res) => {
  try {
    const { reference, status } = req.body;

    const transaction = await Transaction.findOne({ reference });
    if (!transaction) return res.sendStatus(404);

    // Prevent double credit
    if (transaction.status === "SUCCESS") return res.sendStatus(200);

    if (status === "SUCCESS") {
      const user = await User.findById(transaction.userId);
      if (user) {
        user.walletBalance += transaction.amount;
        await user.save();
      }
      transaction.status = "SUCCESS";
    } else {
      transaction.status = "FAILED";
    }

    await transaction.save();
    res.sendStatus(200);

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

