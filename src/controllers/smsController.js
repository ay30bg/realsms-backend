// const axios = require("axios");

// const SMSPOOL_BASE_URL = "https://api.smspool.net";
// const API_KEY = process.env.SMS_POOL_API_KEY;

// // Change this when rate changes
// const USD_TO_NGN = 1000;

// /* =====================================================
//    GET ALL COUNTRIES
// ===================================================== */
// const getServers = async (req, res) => {
//   try {
//     const response = await axios.get(
//       `${SMSPOOL_BASE_URL}/country/retrieve_all`,
//       {
//         params: { key: API_KEY },
//       }
//     );

//     const countries = response.data.map((c) => ({
//       ID: c.ID,
//       name: c.name,
//       short_name: c.short_name,
//     }));

//     res.json(countries);
//   } catch (err) {
//     console.error("Country Error:", err.response?.data || err.message);
//     res.status(500).json([]);
//   }
// };

// /* =====================================================
//    GET SERVICES + PRICE (CONVERTED TO NAIRA)
// ===================================================== */
// const getServices = async (req, res) => {
//   try {
//     const servicesRes = await axios.get(
//       `${SMSPOOL_BASE_URL}/service/retrieve_all`,
//       {
//         params: { key: API_KEY },
//       }
//     );

//     const pricingRes = await axios.get(
//       `${SMSPOOL_BASE_URL}/request/pricing`,
//       {
//         params: { key: API_KEY },
//       }
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
//         price: priceInNaira, // converted to NGN
//         pool: priceInfo?.pool || "default",
//         countryID: priceInfo?.country || null,
//         countryShort: priceInfo?.short_name || null,
//       };
//     });

//     res.json(services);
//   } catch (err) {
//     console.error("Service Error:", err.response?.data || err.message);
//     res.status(500).json([]);
//   }
// };

// /* =====================================================
//    BUY NUMBER
// ===================================================== */
// const buyNumber = async (req, res) => {
//   const { country, service, pool, max_price } = req.body;

//   // Validation
//   if (!country || !service) {
//     return res.status(400).json({
//       success: 0,
//       message: "Country and service are required",
//     });
//   }

//   try {
//     const response = await axios.post(
//       `${SMSPOOL_BASE_URL}/purchase/sms`,
//       null,
//       {
//         params: {
//           key: API_KEY,
//           country,
//           service,
//           quantity: 1,
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error(
//       "Failed to buy number:",
//       err.response?.data || err.message
//     );

//     res.status(500).json(
//       err.response?.data || {
//         success: 0,
//         message: "Purchase failed",
//       }
//     );
//   }
// };

// /* =====================================================
//    CHECK OTP
// ===================================================== */
// const getOtp = async (req, res) => {
//   const { orderid } = req.body;

//   if (!orderid) {
//     return res.status(400).json({
//       success: 0,
//       message: "Order ID is required",
//     });
//   }

//   try {
//     const response = await axios.post(
//       `${SMSPOOL_BASE_URL}/sms/check`,
//       null,
//       {
//         params: {
//           key: API_KEY,
//           orderid,
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error("OTP Error:", err.response?.data || err.message);

//     res.status(500).json({
//       success: 0,
//       message: "Failed to check OTP",
//     });
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

// Change when rate changes
const USD_TO_NGN = 1000;

/* =====================================================
   GET ALL COUNTRIES
===================================================== */
const getServers = async (req, res) => {
  try {
    const response = await axios.get(
      `${SMSPOOL_BASE_URL}/country/retrieve_all`,
      { params: { key: API_KEY } }
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
   GET SERVICES + PRICE + STOCK (CONVERTED TO NAIRA)
===================================================== */
const getServices = async (req, res) => {
  try {
    const servicesRes = await axios.get(
      `${SMSPOOL_BASE_URL}/service/retrieve_all`,
      { params: { key: API_KEY } }
    );

    const pricingRes = await axios.get(
      `${SMSPOOL_BASE_URL}/request/pricing`,
      { params: { key: API_KEY } }
    );

    const servicesList = servicesRes.data;
    const pricingList = pricingRes.data;

    const services = [];

    pricingList.forEach((priceInfo) => {
      const serviceInfo = servicesList.find(
        (s) => s.ID === priceInfo.service
      );

      if (!serviceInfo) return;

      services.push({
        ID: serviceInfo.ID,
        name: serviceInfo.name,
        country: priceInfo.country,
        pool: priceInfo.pool,
        stock: priceInfo.count || 0,
        priceUSD: Number(priceInfo.price),
        priceNGN: Number(priceInfo.price) * USD_TO_NGN,
      });
    });

    res.json(services);
  } catch (err) {
    console.error("Service Error:", err.response?.data || err.message);
    res.status(500).json([]);
  }
};

/* =====================================================
   BUY NUMBER (AUTO POOL SELECTION + STOCK CHECK)
===================================================== */
const buyNumber = async (req, res) => {
  const { country, service } = req.body;

  if (!country || !service) {
    return res.status(400).json({
      success: 0,
      message: "Country and service are required",
    });
  }

  try {
    // 1️⃣ Get latest pricing to check stock
    const pricingRes = await axios.get(
      `${SMSPOOL_BASE_URL}/request/pricing`,
      { params: { key: API_KEY } }
    );

    const pricingList = pricingRes.data;

    // 2️⃣ Find available pool with stock
    const availablePool = pricingList.find(
      (p) =>
        p.service == service &&
        p.country == country &&
        p.count > 0
    );

    if (!availablePool) {
      return res.json({
        success: 0,
        message: "No numbers available right now",
        type: "OUT_OF_STOCK",
      });
    }

    // 3️⃣ Purchase using available pool
    const purchaseRes = await axios.post(
      `${SMSPOOL_BASE_URL}/purchase/sms`,
      null,
      {
        params: {
          key: API_KEY,
          country,
          service,
          pool: availablePool.pool,
          quantity: 1,
        },
      }
    );

    res.json(purchaseRes.data);

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

