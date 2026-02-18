// // const axios = require("axios");
 
// // exports.getServices = async (req, res) => {
// //   const { serverId } = req.params;

// //   try {
// //     const response = await axios.get(`${process.env.SMS_POOL_BASE_URL}/services`, {
// //       params: { serverId },
// //       headers: { "Authorization": `Bearer ${process.env.SMS_POOL_API_KEY}` },
// //     });

// //     res.json(response.data);
// //   } catch (err) {
// //     console.error(err.response?.data || err.message);
// //     res.status(500).json({ error: "Failed to fetch services" });
// //   }
// // };

// // exports.buyNumber = async (req, res) => {
// //   const { serviceId } = req.body;
// //   const user = req.user; // ✅ Comes from auth middleware

// //   try {
// //     if (!user || user.balance < 0) {
// //       return res.status(400).json({ error: "Insufficient balance" });
// //     }

// //     const response = await axios.post(
// //       `${process.env.SMS_POOL_BASE_URL}/buy`,
// //       { serviceId },
// //       { headers: { "Authorization": `Bearer ${process.env.SMS_POOL_API_KEY}` } }
// //     );

// //     const data = response.data;

// //     // Deduct balance
// //     user.balance -= data.price || 0;
// //     await user.save();

// //     res.json({ number: data.number, otp: data.otp || null });
// //   } catch (err) {
// //     console.error(err.response?.data || err.message);
// //     res.status(500).json({ error: err.response?.data?.message || "Failed to buy number" });
// //   }
// // };

// // exports.getOtp = async (req, res) => {
// //   const { number } = req.params;

// //   try {
// //     const response = await axios.get(`${process.env.SMS_POOL_BASE_URL}/otp`, {
// //       params: { number },
// //       headers: { "Authorization": `Bearer ${process.env.SMS_POOL_API_KEY}` },
// //     });

// //     const data = response.data;

// //     if (!data.otp) return res.status(404).json({ error: "OTP not yet received" });

// //     res.json({ otp: data.otp });
// //   } catch (err) {
// //     console.error(err.response?.data || err.message);
// //     res.status(500).json({ error: "Failed to fetch OTP" });
// //   }
// // };


// const axios = require("axios");

// // ---------------- GET SERVERS ----------------
// const getServers = async (req, res) => {
//   try {
//     const response = await axios.get(`${process.env.SMS_POOL_BASE_URL}/servers`, {
//       headers: { Authorization: `Bearer ${process.env.SMS_POOL_API_KEY}` },
//     });

//     const servers = Array.isArray(response.data) ? response.data : response.data.servers || [];
//     res.json(servers);
//   } catch (err) {
//     console.error("Failed to fetch servers from SMSPool:", err.message);
//     res.status(500).json([]);
//   }
// };

// // ---------------- GET SERVICES BY SERVER ----------------
// const getServices = async (req, res) => {
//   const { serverId } = req.params;
//   try {
//     const response = await axios.get(
//       `${process.env.SMS_POOL_BASE_URL}/servers/${serverId}/services`,
//       { headers: { Authorization: `Bearer ${process.env.SMS_POOL_API_KEY}` } }
//     );

//     const services = Array.isArray(response.data)
//       ? response.data
//       : response.data.services || [];
//     res.json(services);
//   } catch (err) {
//     console.error("Failed to fetch services:", err.message);
//     res.status(500).json([]);
//   }
// };

// // ---------------- BUY NUMBER ----------------
// const buyNumber = async (req, res) => {
//   const { serviceId } = req.body;
//   try {
//     const response = await axios.post(
//       `${process.env.SMS_POOL_BASE_URL}/buy`,
//       { serviceId },
//       { headers: { Authorization: `Bearer ${process.env.SMS_POOL_API_KEY}` } }
//     );

//     // SMSPool returns purchased number
//     const number = response.data.number;
//     res.json({ number });
//   } catch (err) {
//     console.error("Failed to buy number:", err.message);
//     res.status(500).json({ message: "Failed to buy number" });
//   }
// };

// // ---------------- GET OTP ----------------
// const getOtp = async (req, res) => {
//   const { number } = req.params;
//   try {
//     const response = await axios.get(
//       `${process.env.SMS_POOL_BASE_URL}/otp/${number}`,
//       { headers: { Authorization: `Bearer ${process.env.SMS_POOL_API_KEY}` } }
//     );

//     // If OTP is received
//     const otp = response.data.otp || null;
//     res.json({ otp });
//   } catch (err) {
//     console.error("Failed to fetch OTP:", err.message);
//     res.status(500).json({ otp: null });
//   }
// };

// module.exports = { getServers, getServices, buyNumber, getOtp };

const axios = require("axios");

// Base API URL
const SMSPOOL_BASE_URL = process.env.SMS_POOL_BASE_URL || "https://api.smspool.net";
const API_KEY = process.env.SMS_POOL_API_KEY;

// Common headers
const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ---------------- GET COUNTRIES (instead of servers) ----------------
const getServers = async (req, res) => {
  try {
    const response = await axios.get(`${SMSPOOL_BASE_URL}/country/retrieve_all`, { headers });
    const countries = Array.isArray(response.data) ? response.data : [];
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
    const services = Array.isArray(response.data) ? response.data : [];
    res.json(services);
  } catch (err) {
    console.error("Failed to fetch services:", err.response?.data || err.message);
    res.status(500).json([]);
  }
};

// ---------------- BUY NUMBER ----------------
const buyNumber = async (req, res) => {
  const { country, service, pool, max_price = 100, quantity = 1 } = req.body;

  try {
    const response = await axios.post(
      `${SMSPOOL_BASE_URL}/purchase/sms`,
      { country, service, pool, max_price, quantity },
      { headers }
    );

    // Returns order info
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
