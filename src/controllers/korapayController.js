const axios = require("axios");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const KORAPAY_SECRET_KEY = process.env.KORAPAY_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Korapay live limits per channel
const MIN_AMOUNT = 200;      // NGN, Card & USSD minimum
const MAX_AMOUNT = 500000;   // NGN

// =============================
// Initialize Korapay Payment
// =============================
exports.initializePayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < MIN_AMOUNT) {
      return res.status(400).json({
        message: `Minimum amount is ₦${MIN_AMOUNT.toLocaleString()}`,
      });
    }
    if (numericAmount > MAX_AMOUNT) {
      return res.status(400).json({
        message: `Maximum amount is ₦${MAX_AMOUNT.toLocaleString()}`,
      });
    }

    const amountInKobo = numericAmount * 100;
    const reference = `rsms-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Initialize Korapay charge
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
        notification_url: `${process.env.BACKEND_URL}/api/korapay/webhook`,
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
      amount: numericAmount,
      currency: "NGN",
      provider: "KORAPAY",
      status: "PENDING",
    });

    res.json({
      reference: chargeData.reference,
      amount: numericAmount,
      currency: "NGN",
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

    // Verify payment
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
