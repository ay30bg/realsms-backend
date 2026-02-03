import axios from "axios";
import crypto from "crypto";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const initOpayPayment = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    if (!amount || amount < 100) return res.status(400).json({ message: "Invalid amount" });

    // Create transaction in DB
    const reference = `OPAY_${Date.now()}`;
    const transaction = await Transaction.create({
      userId,
      reference,
      amount,
      status: "PENDING",
    });

    // Payload to Opay
    const payload = {
      country: "NG",
      reference,
      amount: { total: amount, currency: "NGN" },
      returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment-cancel`,
      callbackUrl: `${process.env.FRONTEND_URL}/api/opay/webhook`,
      userInfo: { userId, userName: "RealSMS User" },
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

    return res.json({ paymentUrl: response.data.data.cashierUrl, reference });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

export const opayWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const { reference, status } = payload;

    // Find transaction
    const transaction = await Transaction.findOne({ reference });
    if (!transaction) return res.sendStatus(404);

    // Prevent double credit
    if (transaction.status === "SUCCESS") return res.sendStatus(200);

    if (status === "SUCCESS") {
      // Update user wallet
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
