const axios = require("axios");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const crypto = require("crypto");

// ===============================
// 1️⃣ INITIALIZE PAYMENT
// ===============================
exports.initializePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const tx_ref = "FLW_" + Date.now() + "_" + req.user._id;

    // Save transaction as PENDING
    await Transaction.create({
      user: req.user._id,
      reference: tx_ref,
      amount,
      currency: "NGN",
      status: "PENDING",
      provider: "FLUTTERWAVE",
    });

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref,
        amount,
        currency: "NGN",
        redirect_url: `${process.env.FRONTEND_URL}/payment-success`,
        customer: {
          email: req.user.email,
          name: req.user.name,
        },
        customizations: {
          title: "Wallet Funding",
          description: "Fund your wallet",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      paymentUrl: response.data.data.link,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Flutterwave init failed" });
  }
};

// ===============================
// 2️⃣ VERIFY PAYMENT
// ===============================
exports.verifyPayment = async (req, res) => {
  try {
    const { transaction_id } = req.query;

    if (!transaction_id) {
      return res.status(400).json({ message: "No transaction ID" });
    }

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "successful") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    const transaction = await Transaction.findOne({
      reference: data.tx_ref,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status === "SUCCESS") {
      return res.json({ message: "Already credited" });
    }

    // Update transaction
    transaction.status = "SUCCESS";
    await transaction.save();

    // Credit user wallet
    const user = await User.findById(transaction.user);
    user.balance += transaction.amount;
    await user.save();

    res.json({ message: "Wallet funded successfully" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Verification failed" });
  }
};
