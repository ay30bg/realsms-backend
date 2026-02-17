const axios = require("axios");
const Order = require("../models/Order");
const User = require("../models/User");

const FIVE_SIM_API_KEY = process.env.FIVE_SIM_API_KEY;
const FIVE_SIM_BASE = "https://5sim.net/v1/user/buy/activation";

// Buy number from 5sim
exports.buyNumber = async (req, res) => {
  const { userId, service } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || user.balance < service.price) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct balance
    user.balance -= service.price;
    await user.save();

    // Request number from 5sim
    const response = await axios.get(`${FIVE_SIM_BASE}?service=${service.apiCode}&country=NG`, {
      headers: { Authorization: `Bearer ${FIVE_SIM_API_KEY}` },
    });

    const { id, phone } = response.data;

    const order = await Order.create({
      userId,
      service,
      number: phone,
      status: "waiting",
      price: service.price,
    });

    res.json({ orderId: order._id, number: phone, orderStatus: order.status, fiveSimId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to buy number" });
  }
};

// Get OTP
exports.getOtp = async (req, res) => {
  const { orderId, fiveSimId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Fetch messages from 5sim
    const response = await axios.get(`https://5sim.net/v1/user/check/${fiveSimId}`, {
      headers: { Authorization: `Bearer ${FIVE_SIM_API_KEY}` },
    });

    if (response.data.sms && response.data.sms.length > 0) {
      const otp = response.data.sms[0].code || response.data.sms[0].msg;
      order.otp = otp;
      order.status = "received";
      await order.save();

      return res.json({ otp });
    }

    res.json({ otp: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch OTP" });
  }
};
