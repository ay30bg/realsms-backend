const axios = require("axios");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const KORAPAY_SECRET_KEY = process.env.KORAPAY_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Korapay live limits
const MIN_AMOUNT = 200;      // NGN
const MAX_AMOUNT = 500000;   // NGN

// =============================
// Initialize Korapay Payment
// =============================
exports.initializePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < MIN_AMOUNT) {
      return res.status(400).json({
        message: `Amount must be at least ₦${MIN_AMOUNT.toLocaleString()}`,
      });
    }
    if (amount > MAX_AMOUNT) {
      return res.status(400).json({
        message: `Amount cannot exceed ₦${MAX_AMOUNT.toLocaleString()}`,
      });
    }

    const amountInKobo = Number(amount) * 100;
    const reference = `rsms-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Initialize payment via Korapay API
    const response = await axios.post(
      "https://api.korapay.com/merchant/api/v1/charges/initialize",
      {
        amount: amountInKobo,
        currency: "NGN",
        reference,
        customer: {
          email: req.user.email,
          name: req.user.name || req.user.email,
        },
        metadata: { source: "RealSMS Wallet" },
        notification_url: `${process.env.BACKEND_URL}/api/korapay/webhook`, // optional
      },
      {
        headers: {
          Authorization: `Bearer ${KORAPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const chargeData = response.data.data;

    // Save transaction in DB
    await Transaction.create({
      user: req.user._id,
      reference: chargeData.reference,
      amount,
      currency: "NGN",
      provider: "KORAPAY",
      status: "PENDING",
    });

    res.json({
      reference: chargeData.reference,
      amount: chargeData.amount,
      currency: chargeData.currency,
      checkout_url: chargeData.checkout_url,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Korapay payment initialization failed" });
  }
};

// =============================
// Verify Korapay Payment
// =============================
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) return res.redirect(`${FRONTEND_URL}/fund-cancel`);

    const transaction = await Transaction.findOne({ reference });
    if (!transaction) return res.redirect(`${FRONTEND_URL}/fund-cancel`);

    if (transaction.status === "SUCCESS") {
      return res.redirect(`${FRONTEND_URL}/fund-success`);
    }

    // Verify via Korapay API
    const response = await axios.get(
      `https://api.korapay.com/merchant/api/v1/charges/${reference}`,
      {
        headers: { Authorization: `Bearer ${KORAPAY_SECRET_KEY}` },
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status !== "success") {
      transaction.status = "FAILED";
      await transaction.save();
      return res.redirect(`${FRONTEND_URL}/fund-cancel`);
    }

    // Update user wallet
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
