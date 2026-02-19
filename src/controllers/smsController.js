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
const Order = require("../models/Order");

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
   GET SERVICES + PRICE + LIVE STOCK
===================================================== */
const getServices = async (req, res) => {
  try {
    // Fetch services
    const servicesRes = await axios.get(
      `${SMSPOOL_BASE_URL}/service/retrieve_all`,
      { params: { key: API_KEY } }
    );

    // Fetch pricing
    const pricingRes = await axios.get(
      `${SMSPOOL_BASE_URL}/request/pricing`,
      { params: { key: API_KEY } }
    );

    // Fetch live stock
    const stockRes = await axios.get(`${SMSPOOL_BASE_URL}/request/stock`, {
      params: { key: API_KEY },
    });

    const servicesList = servicesRes.data;
    const pricingList = pricingRes.data;
    const stockList = stockRes.data;

    const services = servicesList.map((s) => {
      const priceInfo = pricingList.find((p) => p.service === s.ID);
      const stockInfo = stockList.find((st) => st.service === s.ID);

      return {
        ID: s.ID,
        name: s.name,
        price: priceInfo ? Number(priceInfo.price) * USD_TO_NGN : null,
        pool: priceInfo?.pool || "default",
        countryID: priceInfo?.country || null,
        countryShort: priceInfo?.short_name || null,
        available: stockInfo?.available || 0,
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
  const { country, service, pool, userId } = req.body;

  if (!country || !service || !userId) {
    return res.status(400).json({
      success: 0,
      message: "Country, service, and userId are required",
    });
  }

  try {
    // Purchase number
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

    const data = response.data;

    if (data.success === 1) {
      // Save order
      const newOrder = await Order.create({
        userId,
        serviceID: service,
        serviceName: data.service_name,
        country,
        pool: data.pool,
        orderId: data.order_id,
        phoneNumber: data.phonenumber,
        price: data.price * USD_TO_NGN,
        status: "PENDING",
      });

      return res.json({
        success: 1,
        message: "Number purchased",
        order: newOrder,
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Failed to buy number:", err.response?.data || err.message);

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
        params: { key: API_KEY, orderid },
      }
    );

    const data = response.data;

    if (data.sms) {
      await Order.findOneAndUpdate(
        { orderId: orderid },
        { otp: data.sms, status: "COMPLETED" }
      );
    }

    res.json(data);
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

