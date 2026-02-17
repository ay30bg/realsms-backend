// controllers/fiveSimController.js
const axios = require("axios");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const FIVESIM_API_KEY = process.env.FIVESIM_API_KEY;

const headers = {
  Authorization: `Bearer ${FIVESIM_API_KEY}`,
  Accept: "application/json",
};

// ===============================
// BUY NUMBER
// ===============================
exports.buyNumber = async (req, res) => {
  const { country, service, price } = req.body;
  const userId = req.user.id;

  if (!country || !service || !price)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.balance < price)
      return res.status(400).json({ message: "Insufficient balance" });

    // Create pending transaction
    const transaction = await Transaction.create({
      userId,
      type: "DEBIT",
      amount: price,
      reference: "5SIM-" + Date.now(),
      status: "PENDING",
    });

    // Call 5sim
    const response = await axios.get(
      `https://5sim.net/v1/user/buy/activation/${country}/any/${service}`,
      { headers }
    );

    const numberData = response.data;

    // Deduct balance
    user.balance -= price;
    await user.save();

    transaction.status = "SUCCESS";
    await transaction.save();

    res.json({
      message: "Number purchased successfully",
      numberData,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to buy number",
      error: error.response?.data || error.message,
    });
  }
};

// ===============================
// CHECK OTP
// ===============================
exports.checkOtp = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId)
    return res.status(400).json({ message: "Order ID required" });

  try {
    const response = await axios.get(
      `https://5sim.net/v1/user/check/${orderId}`,
      { headers }
    );

    const data = response.data;

    if (data.sms && data.sms.length > 0) {
      return res.json({
        otp: data.sms[0].code,
        fullData: data,
      });
    }

    res.json({ message: "Waiting for OTP..." });
  } catch (error) {
    res.status(500).json({
      message: "OTP check failed",
      error: error.response?.data || error.message,
    });
  }
};

// ===============================
// CANCEL ORDER
// ===============================
exports.cancelOrder = async (req, res) => {
  const { orderId, price } = req.body;
  const userId = req.user.id;

  try {
    await axios.get(
      `https://5sim.net/v1/user/cancel/${orderId}`,
      { headers }
    );

    const user = await User.findById(userId);
    user.balance += price;
    await user.save();

    await Transaction.create({
      userId,
      type: "CREDIT",
      amount: price,
      reference: "REFUND-" + Date.now(),
      status: "SUCCESS",
    });

    res.json({ message: "Order cancelled & refunded" });
  } catch (error) {
    res.status(500).json({
      message: "Cancel failed",
      error: error.response?.data || error.message,
    });
  }
};
