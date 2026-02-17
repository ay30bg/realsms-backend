const axios = require("axios");

exports.getServices = async (req, res) => {
  const { serverId } = req.params;

  try {
    const response = await axios.get(`${process.env.SMS_POOL_BASE_URL}/services`, {
      params: { serverId },
      headers: { "Authorization": `Bearer ${process.env.SMS_POOL_API_KEY}` },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

exports.buyNumber = async (req, res) => {
  const { serviceId } = req.body;
  const user = req.user; // ✅ Comes from auth middleware

  try {
    if (!user || user.balance < 0) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const response = await axios.post(
      `${process.env.SMS_POOL_BASE_URL}/buy`,
      { serviceId },
      { headers: { "Authorization": `Bearer ${process.env.SMS_POOL_API_KEY}` } }
    );

    const data = response.data;

    // Deduct balance
    user.balance -= data.price || 0;
    await user.save();

    res.json({ number: data.number, otp: data.otp || null });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.message || "Failed to buy number" });
  }
};

exports.getOtp = async (req, res) => {
  const { number } = req.params;

  try {
    const response = await axios.get(`${process.env.SMS_POOL_BASE_URL}/otp`, {
      params: { number },
      headers: { "Authorization": `Bearer ${process.env.SMS_POOL_API_KEY}` },
    });

    const data = response.data;

    if (!data.otp) return res.status(404).json({ error: "OTP not yet received" });

    res.json({ otp: data.otp });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch OTP" });
  }
};
