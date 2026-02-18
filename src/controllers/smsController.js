// const axios = require("axios");

// // Base API URL
// const SMSPOOL_BASE_URL = process.env.SMS_POOL_BASE_URL || "https://api.smspool.net";
// const API_KEY = process.env.SMS_POOL_API_KEY;

// const headers = {
//   Authorization: `Bearer ${API_KEY}`,
//   "Content-Type": "application/json",
// };

// // ---------------- GET COUNTRIES ----------------
// const getServers = async (req, res) => {
//   try {
//     const response = await axios.get(`${SMSPOOL_BASE_URL}/country/retrieve_all`, { headers });

//     // Map to ensure { ID, name, short_name } for frontend
//     const countries = (Array.isArray(response.data) ? response.data : []).map((c) => ({
//       ID: c.ID || c.id,
//       name: c.name || c.country,
//       short_name: c.short_name || c.code,
//     }));

//     res.json(countries);
//   } catch (err) {
//     console.error("Failed to fetch countries:", err.response?.data || err.message);
//     res.status(500).json([]);
//   }
// };

// // ---------------- GET SERVICES ----------------
// const getServices = async (req, res) => {
//   try {
//     const response = await axios.get(`${SMSPOOL_BASE_URL}/service/retrieve_all`, { headers });

//     const services = (Array.isArray(response.data) ? response.data : []).map((s) => ({
//       ID: s.ID || s.id,
//       name: s.name,
//       price: s.price || 0,
//       countryID: s.countryID || null, // optional, if API supports country filtering
//     }));

//     res.json(services);
//   } catch (err) {
//     console.error("Failed to fetch services:", err.response?.data || err.message);
//     res.status(500).json([]);
//   }
// };

// // ---------------- BUY NUMBER ----------------
// const buyNumber = async (req, res) => {
//   const { country, service, pool = "default", max_price = 100, quantity = 1 } = req.body;

//   try {
//     const response = await axios.post(
//       `${SMSPOOL_BASE_URL}/purchase/sms`,
//       { country, service, pool, max_price, quantity },
//       { headers }
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error("Failed to buy number:", err.response?.data || err.message);
//     res.status(500).json({ message: "Failed to buy number" });
//   }
// };

// // ---------------- GET OTP ----------------
// const getOtp = async (req, res) => {
//   const { orderid } = req.params;

//   try {
//     const response = await axios.post(
//       `${SMSPOOL_BASE_URL}/sms/check`,
//       { orderid },
//       { headers }
//     );

//     const otp = response.data?.otp || null;
//     res.json({ otp });
//   } catch (err) {
//     console.error("Failed to fetch OTP:", err.response?.data || err.message);
//     res.status(500).json({ otp: null });
//   }
// };

// module.exports = { getServers, getServices, buyNumber, getOtp };

const axios = require("axios");

// Base API URL
const SMSPOOL_BASE_URL = process.env.SMS_POOL_BASE_URL || "https://api.smspool.net";
const API_KEY = process.env.SMS_POOL_API_KEY;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ---------------- GET COUNTRIES ----------------
const getServers = async (req, res) => {
  try {
    const response = await axios.get(`${SMSPOOL_BASE_URL}/country/retrieve_all`, { headers });

    const countries = (Array.isArray(response.data) ? response.data : []).map((c) => ({
      ID: c.ID || c.id,
      name: c.name || c.country || "Unknown Country",
      short_name: c.short_name || c.code || "",
    }));

    res.json(countries);
  } catch (err) {
    console.error("Failed to fetch countries:", err.response?.data || err.message);
    res.status(500).json([]);
  }
};

// ---------------- GET SERVICES ----------------
const getServices = async (req, res) => {
  try {
    const response = await axios.get(`${SMSPOOL_BASE_URL}/service/retrieve_all`, { headers });

    const services = (Array.isArray(response.data) ? response.data : []).map((s) => {
      // Determine price from multiple possible keys
      const price =
        s.price !== undefined && s.price !== null
          ? s.price
          : s.price_per_unit !== undefined && s.price_per_unit !== null
          ? s.price_per_unit
          : s.cost !== undefined && s.cost !== null
          ? s.cost
          : 0;

      return {
        ID: s.ID || s.id,
        name: s.name || s.service_name || "Unknown Service",
        price: Number(price), // make sure price is numeric
        countryID: s.countryID || s.country_id || null,
      };
    });

    res.json(services);
  } catch (err) {
    console.error("Failed to fetch services:", err.response?.data || err.message);
    res.status(500).json([]);
  }
};

// ---------------- BUY NUMBER ----------------
const buyNumber = async (req, res) => {
  const { country, service, pool = "default", max_price = 100, quantity = 1 } = req.body;

  try {
    const response = await axios.post(
      `${SMSPOOL_BASE_URL}/purchase/sms`,
      { country, service, pool, max_price, quantity },
      { headers }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Failed to buy number:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to buy number" });
  }
};

// ---------------- GET OTP ----------------
const getOtp = async (req, res) => {
  const { orderid } = req.params;

  try {
    const response = await axios.post(
      `${SMSPOOL_BASE_URL}/sms/check`,
      { orderid },
      { headers }
    );

    const otp = response.data?.otp || null;
    res.json({ otp });
  } catch (err) {
    console.error("Failed to fetch OTP:", err.response?.data || err.message);
    res.status(500).json({ otp: null });
  }
};

module.exports = { getServers, getServices, buyNumber, getOtp };
