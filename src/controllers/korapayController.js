const axios = require("axios");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const KORAPAY_SECRET_KEY = process.env.KORAPAY_SECRET_KEY;
const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const MIN_AMOUNT = 200;      // NGN
const MAX_AMOUNT = 500000;   // NGN

// =====================================================
// 1️⃣ INITIALIZE PAYMENT (Create Korapay Charge)
// =====================================================
exports.initializePayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);

    // Validate amount
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

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Generate unique reference
    const reference = `rsms-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Call Korapay API
    const response = await axios.post(
      "https://api.korapay.com/merchant/api/v1/charges/initialize",
      {
        amount: numericAmount * 100, // convert to kobo
        currency: "NGN",
        reference,
        redirect_url: `${BACKEND_URL}/api/korapay/verify?reference=${reference}`,
        customer: {
          email: req.user.email,
          name: req.user.name || req.user.email,
        },
        metadata: {
          userId: req.user._id,
          source: "RealSMS Wallet Funding",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${KORAPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const checkoutUrl = response.data.data.checkout_url;

    // Save transaction
    await Transaction.create({
      user: req.user._id,
      reference,
      amount: numericAmount,
      currency: "NGN",
      provider: "KORAPAY",
      status: "PENDING",
    });

    return res.status(200).json({
      checkout_url: checkoutUrl,
    });

  } catch (error) {
    console.error("Korapay Init Error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Korapay payment initialization failed",
    });
  }
};


// =====================================================
// 2️⃣ VERIFY PAYMENT (After Redirect)
// =====================================================
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

    // Prevent double processing
    if (transaction.status === "SUCCESS") {
      return res.redirect(`${FRONTEND_URL}/fund-success`);
    }

    // Verify with Korapay
    const response = await axios.get(
      `https://api.korapay.com/merchant/api/v1/charges/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${KORAPAY_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    // If not successful
    if (!paymentData || paymentData.status !== "success") {
      transaction.status = "FAILED";
      await transaction.save();

      return res.redirect(`${FRONTEND_URL}/fund-cancel`);
    }

    // =============================
    // CREDIT USER WALLET (ONCE)
    // =============================
    const user = await User.findById(transaction.user);

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/fund-cancel`);
    }

    user.walletBalanceNGN += transaction.amount;
    await user.save();

    transaction.status = "SUCCESS";
    transaction.processedAt = new Date();
    await transaction.save();

    return res.redirect(`${FRONTEND_URL}/fund-success`);

  } catch (error) {
    console.error("Korapay Verify Error:", error.response?.data || error.message);
    return res.redirect(`${FRONTEND_URL}/fund-cancel`);
  }
};
