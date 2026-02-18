// // // const axios = require("axios");

// // // // Base API URL
// // // const SMSPOOL_BASE_URL = process.env.SMS_POOL_BASE_URL || "https://api.smspool.net";
// // // const API_KEY = process.env.SMS_POOL_API_KEY;

// // // const headers = {
// // //   Authorization: `Bearer ${API_KEY}`,
// // //   "Content-Type": "application/json",
// // // };

// // // // ---------------- GET COUNTRIES ----------------
// // // const getServers = async (req, res) => {
// // //   try {
// // //     const response = await axios.get(`${SMSPOOL_BASE_URL}/country/retrieve_all`, { headers });

// // //     // Map to ensure { ID, name, short_name } for frontend
// // //     const countries = (Array.isArray(response.data) ? response.data : []).map((c) => ({
// // //       ID: c.ID || c.id,
// // //       name: c.name || c.country,
// // //       short_name: c.short_name || c.code,
// // //     }));

// // //     res.json(countries);
// // //   } catch (err) {
// // //     console.error("Failed to fetch countries:", err.response?.data || err.message);
// // //     res.status(500).json([]);
// // //   }
// // // };

// // // // ---------------- GET SERVICES ----------------
// // // const getServices = async (req, res) => {
// // //   try {
// // //     const response = await axios.get(`${SMSPOOL_BASE_URL}/service/retrieve_all`, { headers });

// // //     const services = (Array.isArray(response.data) ? response.data : []).map((s) => ({
// // //       ID: s.ID || s.id,
// // //       name: s.name,
// // //       price: s.price || 0,
// // //       countryID: s.countryID || null, // optional, if API supports country filtering
// // //     }));

// // //     res.json(services);
// // //   } catch (err) {
// // //     console.error("Failed to fetch services:", err.response?.data || err.message);
// // //     res.status(500).json([]);
// // //   }
// // // };

// // // // ---------------- BUY NUMBER ----------------
// // // const buyNumber = async (req, res) => {
// // //   const { country, service, pool = "default", max_price = 100, quantity = 1 } = req.body;

// // //   try {
// // //     const response = await axios.post(
// // //       `${SMSPOOL_BASE_URL}/purchase/sms`,
// // //       { country, service, pool, max_price, quantity },
// // //       { headers }
// // //     );

// // //     res.json(response.data);
// // //   } catch (err) {
// // //     console.error("Failed to buy number:", err.response?.data || err.message);
// // //     res.status(500).json({ message: "Failed to buy number" });
// // //   }
// // // };

// // // // ---------------- GET OTP ----------------
// // // const getOtp = async (req, res) => {
// // //   const { orderid } = req.params;

// // //   try {
// // //     const response = await axios.post(
// // //       `${SMSPOOL_BASE_URL}/sms/check`,
// // //       { orderid },
// // //       { headers }
// // //     );

// // //     const otp = response.data?.otp || null;
// // //     res.json({ otp });
// // //   } catch (err) {
// // //     console.error("Failed to fetch OTP:", err.response?.data || err.message);
// // //     res.status(500).json({ otp: null });
// // //   }
// // // };

// // // module.exports = { getServers, getServices, buyNumber, getOtp };

// // const axios = require("axios");

// // // Base API URL
// // const SMSPOOL_BASE_URL = process.env.SMS_POOL_BASE_URL || "https://api.smspool.net";
// // const API_KEY = process.env.SMS_POOL_API_KEY;

// // const headers = {
// //   Authorization: `Bearer ${API_KEY}`,
// //   "Content-Type": "application/json",
// // };

// // // ---------------- GET COUNTRIES ----------------
// // const getServers = async (req, res) => {
// //   try {
// //     const response = await axios.get(`${SMSPOOL_BASE_URL}/country/retrieve_all`, { headers });

// //     const countries = (Array.isArray(response.data) ? response.data : []).map((c) => ({
// //       ID: c.ID || c.id,
// //       name: c.name || c.country,
// //       short_name: c.short_name || c.code,
// //     }));

// //     res.json(countries);
// //   } catch (err) {
// //     console.error("Failed to fetch countries:", err.response?.data || err.message);
// //     res.status(500).json([]);
// //   }
// // };

// // // ---------------- GET SERVICES WITH PRICING ----------------
// // const getServices = async (req, res) => {
// //   try {
// //     // 1️⃣ Fetch all services
// //     const servicesRes = await axios.get(`${SMSPOOL_BASE_URL}/service/retrieve_all`, { headers });
// //     const servicesList = Array.isArray(servicesRes.data) ? servicesRes.data : [];

// //     // 2️⃣ Fetch pricing info
// //     const pricingRes = await axios.get(`${SMSPOOL_BASE_URL}/request/pricing`, { headers });
// //     const pricingList = Array.isArray(pricingRes.data) ? pricingRes.data : [];

// //     // 3️⃣ Merge service info with pricing
// //     const services = servicesList.map((s) => {
// //       const priceInfo = pricingList.find(
// //         (p) => p.service === s.ID || p.service === s.id
// //       );

// //       return {
// //         ID: s.ID || s.id,
// //         name: s.name || s.service_name || "Unknown Service",
// //         price: priceInfo ? Number(priceInfo.price) : null, // numeric price
// //         countryID: priceInfo?.country || null,
// //         countryShort: priceInfo?.short_name || null,
// //         pool: priceInfo?.pool || null,
// //       };
// //     });

// //     res.json(services);
// //   } catch (err) {
// //     console.error("Failed to fetch services with pricing:", err.response?.data || err.message);
// //     res.status(500).json([]);
// //   }
// // };

// // // ---------------- BUY NUMBER ----------------
// // const buyNumber = async (req, res) => {
// //   const { country, service, pool = "default", max_price = 100, quantity = 1 } = req.body;

// //   try {
// //     const response = await axios.post(
// //       `${SMSPOOL_BASE_URL}/purchase/sms`,
// //       { country, service, pool, max_price, quantity },
// //       { headers }
// //     );

// //     res.json(response.data);
// //   } catch (err) {
// //     console.error("Failed to buy number:", err.response?.data || err.message);
// //     res.status(500).json({ message: "Failed to buy number" });
// //   }
// // };

// // // ---------------- GET OTP ----------------
// // const getOtp = async (req, res) => {
// //   const { orderid } = req.params;

// //   try {
// //     const response = await axios.post(
// //       `${SMSPOOL_BASE_URL}/sms/check`,
// //       { orderid },
// //       { headers }
// //     );

// //     const otp = response.data?.otp || null;
// //     res.json({ otp });
// //   } catch (err) {
// //     console.error("Failed to fetch OTP:", err.response?.data || err.message);
// //     res.status(500).json({ otp: null });
// //   }
// // };

// // module.exports = { getServers, getServices, buyNumber, getOtp };

// const axios = require("axios");

// const SMSPOOL_BASE_URL = "https://api.smspool.net";
// const API_KEY = process.env.SMS_POOL_API_KEY;

// // Change this to current rate when needed
// const USD_TO_NGN = 1000;

// const headers = {
//   Authorization: `Bearer ${API_KEY}`,
//   "Content-Type": "application/json",
// };

// // ---------------- GET COUNTRIES ----------------
// const getServers = async (req, res) => {
//   try {
//     const response = await axios.get(
//       `${SMSPOOL_BASE_URL}/country/retrieve_all`,
//       { headers }
//     );

//     const countries = response.data.map((c) => ({
//       ID: c.ID,
//       name: c.name,
//       short_name: c.short_name,
//     }));

//     res.json(countries);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json([]);
//   }
// };

// // ---------------- GET SERVICES + PRICE (NGN) ----------------
// const getServices = async (req, res) => {
//   try {
//     const servicesRes = await axios.get(
//       `${SMSPOOL_BASE_URL}/service/retrieve_all`,
//       { headers }
//     );

//     const pricingRes = await axios.get(
//       `${SMSPOOL_BASE_URL}/request/pricing`,
//       { headers }
//     );

//     const servicesList = servicesRes.data;
//     const pricingList = pricingRes.data;

//     const services = servicesList.map((s) => {
//       const priceInfo = pricingList.find(
//         (p) => p.service === s.ID
//       );

//       let priceInNaira = null;

//       if (priceInfo) {
//         priceInNaira = Number(priceInfo.price) * USD_TO_NGN;
//       }

//       return {
//         ID: s.ID,
//         name: s.name,
//         price: priceInNaira, // NGN
//         pool: priceInfo?.pool || "default",
//         countryID: priceInfo?.country || null,
//         countryShort: priceInfo?.short_name || null,
//       };
//     });

//     res.json(services);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json([]);
//   }
// };

// // ---------------- BUY NUMBER ----------------
// const buyNumber = async (req, res) => {
//   const { country, service, pool, max_price } = req.body;

//   try {
//     const response = await axios.post(
//       `${SMSPOOL_BASE_URL}/purchase/sms`,
//       {
//         country,
//         service,
//         pool,
//         max_price, // must be USD
//         quantity: 1,
//       },
//       { headers }
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error("Failed to buy number:", err.response?.data || err.message);
//     res.status(500).json(err.response?.data || { message: "Purchase failed" });
//   }
// };

// // ---------------- GET OTP ----------------
// const getOtp = async (req, res) => {
//   const { orderid } = req.body;

//   try {
//     const response = await axios.post(
//       `${SMSPOOL_BASE_URL}/sms/check`,
//       { orderid },
//       { headers }
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ otp: null });
//   }
// };

// module.exports = {
//   getServers,
//   getServices,
//   buyNumber,
//   getOtp,
// };

const axios = require("axios");

const SMSPOOL_BASE_URL = "https://api.smspool.net";
const API_KEY = process.env.SMS_POOL_API_KEY;

// USD → NGN rate
const USD_TO_NGN = 1000;

// Profit markup (1.3 = 30% profit)
const MARKUP = 1.3;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ---------------- GET COUNTRIES ----------------
const getServers = async (req, res) => {
  try {
    const response = await axios.get(`${SMSPOOL_BASE_URL}/country/retrieve_all`, { headers });
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

// ---------------- GET SERVICES + PRICING ----------------
const getServices = async (req, res) => {
  try {
    const { country: countryId } = req.query; // optional country ID from frontend

    const servicesRes = await axios.get(`${SMSPOOL_BASE_URL}/service/retrieve_all`, { headers });
    const servicesList = servicesRes.data;

    const services = await Promise.all(
      servicesList.map(async (s) => {
        try {
          // Fetch pricing for each service (must pass service + country)
          const pricingRes = await axios.get(`${SMSPOOL_BASE_URL}/request/pricing`, {
            headers,
            params: {
              service: s.ID,
              country: countryId || undefined, // if no country, SMSPool may default
            },
          });

          const priceUSD = Number(pricingRes.data?.price || 0);
          if (!priceUSD) return null; // skip services without pricing

          const priceNGN = priceUSD * USD_TO_NGN * MARKUP;

          return {
            ID: s.ID,
            name: s.name,
            priceUSD,
            priceNGN: Math.round(priceNGN), // round to nearest Naira
          };
        } catch (err) {
          return null;
        }
      })
    );

    res.json(services.filter(Boolean));
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json([]);
  }
};

// ---------------- BUY NUMBER ----------------
const buyNumber = async (req, res) => {
  const { country, service, pool, max_price } = req.body;

  if (!country || !service || !max_price) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const response = await axios.post(
      `${SMSPOOL_BASE_URL}/purchase/sms`,
      {
        country,
        service,
        pool: pool || "default",
        max_price, // must be in USD
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

  if (!orderid) return res.status(400).json({ otp: null });

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
