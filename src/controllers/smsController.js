const axios = require("axios");

const SMSPOOL_BASE_URL = "https://api.smspool.net";
const API_KEY = process.env.SMS_POOL_API_KEY;

// Change this when rate changes
const USD_TO_NGN = 1000;

/* =====================================================
   GET ALL COUNTRIES
===================================================== */
const getServers = async (req, res) => {
  try {
    const response = await axios.get(
      `${SMSPOOL_BASE_URL}/country/retrieve_all`,
      {
        params: { key: API_KEY },
      }
    );

    const countries = response.data.map((c) => ({
      ID: c.ID,
      name: c.name,
      short_name: c.short_name,
    }));

    res.json(countries);
  } catch (err) {
    console.error("Country Error:", err.response?.data || err.message);
    res.status(500).json([]);
  }
};

/* =====================================================
   GET SERVICES + PRICE (CONVERTED TO NAIRA)
===================================================== */
const getServices = async (req, res) => {
  try {
    const servicesRes = await axios.get(
      `${SMSPOOL_BASE_URL}/service/retrieve_all`,
      {
        params: { key: API_KEY },
      }
    );

    const pricingRes = await axios.get(
      `${SMSPOOL_BASE_URL}/request/pricing`,
      {
        params: { key: API_KEY },
      }
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
        price: priceInNaira, // converted to NGN
        pool: priceInfo?.pool || "default",
        countryID: priceInfo?.country || null,
        countryShort: priceInfo?.short_name || null,
      };
    });

    res.json(services);
  } catch (err) {
    console.error("Service Error:", err.response?.data || err.message);
    res.status(500).json([]);
  }
};

/* =====================================================
   BUY NUMBER
===================================================== */
const buyNumber = async (req, res) => {
  const { country, service, pool, max_price } = req.body;

  // Validation
  if (!country || !service) {
    return res.status(400).json({
      success: 0,
      message: "Country and service are required",
    });
  }

  try {
    const response = await axios.post(
      `${SMSPOOL_BASE_URL}/purchase/sms`,
      null,
      {
        params: {
          key: API_KEY,
          country,
          service,
          quantity: 1,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(
      "Failed to buy number:",
      err.response?.data || err.message
    );

    res.status(500).json(
      err.response?.data || {
        success: 0,
        message: "Purchase failed",
      }
    );
  }
};

/* =====================================================
   CHECK OTP
===================================================== */
const getOtp = async (req, res) => {
  const { orderid } = req.body;

  if (!orderid) {
    return res.status(400).json({
      success: 0,
      message: "Order ID is required",
    });
  }

  try {
    const response = await axios.post(
      `${SMSPOOL_BASE_URL}/sms/check`,
      null,
      {
        params: {
          key: API_KEY,
          orderid,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("OTP Error:", err.response?.data || err.message);

    res.status(500).json({
      success: 0,
      message: "Failed to check OTP",
    });
  }
};

module.exports = {
  getServers,
  getServices,
  buyNumber,
  getOtp,
};


