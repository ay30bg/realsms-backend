// src/controllers/paystackController.js (CommonJS)
const axios = require("axios");
const crypto = require("crypto");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

// -----------------------------
// Initialize Paystack payment
// -----------------------------
const initPaystackPayment = async (req, res) => {
  const { amount } = req.body;
  const user = req.user;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: amount * 100, // Paystack expects amount in kobo
        callback_url: `${FRONTEND_URL}/fund-success`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Save transaction as PENDING
    await Transaction.create({
      userId: user._id,
      reference: response.data.data.reference,
      usdtAmount: 0,
      ngnAmount: amount,
      exchangeRate: 1,
      status: "PENDING",
      provider: "PAYSTACK",
    });

    res.json({
      paymentUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (err) {
    console.error("Paystack init error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

// -----------------------------
// Paystack webhook
// -----------------------------
const paystackWebhook = async (req, res) => {
  try {
    const secret = PAYSTACK_SECRET_KEY;

    // Paystack sends signature in headers
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("❌ Invalid Paystack signature");
      return res.status(401).send("Unauthorized");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { reference, amount } = event.data; // amount in kobo
      const transaction = await Transaction.findOne({ reference });

      if (!transaction || transaction.status === "SUCCESS") {
        return res.status(200).send("Already processed");
      }

      // Convert kobo → Naira
      const ngnAmount = amount / 100;

      // Credit user wallet
      const user = await User.findByIdAndUpdate(
        transaction.userId,
        { $inc: { walletBalanceNGN: ngnAmount } },
        { new: true }
      );

      if (!user) {
        console.warn("⚠️ User not found for transaction:", reference);
        return res.status(200).send("User not found");
      }

      // Update transaction
      transaction.status = "SUCCESS";
      transaction.ngnAmount = ngnAmount;
      await transaction.save();

      console.log(`✅ Credited ₦${ngnAmount} to user ${user._id}`);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Paystack webhook error:", err.message);
    res.status(500).send("Webhook error");
  }
};

// Export as CommonJS
module.exports = {
  initPaystackPayment,
  paystackWebhook,
};
