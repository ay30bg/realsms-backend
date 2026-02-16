const axios = require("axios");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

// =============================
// Initialize Payment
// =============================
exports.initializePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
        amount: amount * 100,
        callback_url: `${BACKEND_URL}/api/paystack/verify`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = response.data.data;

    await Transaction.create({
      user: req.user._id,
      reference: paymentData.reference,
      amount,
      currency: "NGN",
      provider: "PAYSTACK",
      status: "PENDING",
    });

    res.json({
      paymentUrl: paymentData.authorization_url,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

// =============================
// Verify Payment
// =============================
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.redirect(`${FRONTEND_URL}/fund-cancel`);
    }

    const transaction = await Transaction.findOne({ reference });

    if (!transaction) {
      return res.redirect(`${FRONTEND_URL}/fund-cancel`);
    }

    if (transaction.status === "SUCCESS") {
      return res.redirect(`${FRONTEND_URL}/fund-success`);
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status !== "success") {
      transaction.status = "FAILED";
      await transaction.save();
      return res.redirect(`${FRONTEND_URL}/fund-cancel`);
    }

    const user = await User.findById(transaction.user);

    user.walletBalanceNGN += transaction.amount;
    await user.save();

    transaction.status = "SUCCESS";
    await transaction.save();

    res.redirect(`${FRONTEND_URL}/fund-success`);
  } catch (error) {
    console.error(error);
    res.redirect(`${FRONTEND_URL}/fund-cancel`);
  }
};
