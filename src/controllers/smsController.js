const axios = require("axios");

const SMSPOOL_BASE_URL = "https://api.smspool.net";
const API_KEY = process.env.SMS_POOL_API_KEY;

// Change this to current rate when needed
const USD_TO_NGN = 1000;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ---------------- GET COUNTRIES ----------------
const getServers = async (req, res) => {
  try {
    const response = await axios.get(
      `${SMSPOOL_BASE_URL}/country/retrieve_all`,
      { headers }
    );

    const countries = response.data.map((c) => ({
      ID: c.ID,
      name: c.name,
      short_name: c.short_name,
    }));

    res.json(countries);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json([]);
  }
};

// ---------------- GET SERVICES + PRICE (NGN) ----------------
const getServices = async (req, res) => {
  try {
    const servicesRes = await axios.get(
      `${SMSPOOL_BASE_URL}/service/retrieve_all`,
      { headers }
    );

    const pricingRes = await axios.get(
      `${SMSPOOL_BASE_URL}/request/pricing`,
      { headers }
    );

    const servicesList = servicesRes.data;
    const pricingList = pricingRes.data;

    const services = servicesList.map((s) => {
      const priceInfo = pricingList.find(
        (p) => p.service === s.ID
      );

      let priceInNaira = null;

      if (priceInfo) {
        priceInNaira = Number(priceInfo.price) * USD_TO_NGN;
      }

      return {
        ID: s.ID,
        name: s.name,
        price: priceInNaira, // NGN
        pool: priceInfo?.pool || "default",
        countryID: priceInfo?.country || null,
        countryShort: priceInfo?.short_name || null,
      };
    });

    res.json(services);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json([]);
  }
};

// ---------------- BUY NUMBER ----------------
const buyNumber = async (req, res) => {
  const { country, service, pool, max_price } = req.body;

  try {
    const response = await axios.post(
      `${SMSPOOL_BASE_URL}/purchase/sms`,
      {
        country,
        service,
        pool,
        max_price, // must be USD
        quantity: 1,
      },
      { headers }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Failed to buy number:", err.response?.data || err.message);
    res.status(500).json(err.response?.data || { message: "Purchase failed" });
  }
};

// ---------------- GET OTP ----------------
const getOtp = async (req, res) => {
  const { orderid } = req.body;

  try {
    const response = await axios.post(
      `${SMSPOOL_BASE_URL}/sms/check`,
      { orderid },
      { headers }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ otp: null });
  }
};

module.exports = {
  getServers,
  getServices,
  buyNumber,
  getOtp,
};

