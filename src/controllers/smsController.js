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


const User = require("../models/User");
const axios = require("axios");

const SMSPOOL_BASE_URL = "https://api.smspool.net";
const API_KEY = process.env.SMS_POOL_API_KEY;
const USD_TO_NGN = 1000;

const buyNumber = async (req, res) => {
  const { country, service, pool } = req.body;
  const userId = req.user.id; // from auth middleware

  if (!country || !service) {
    return res.status(400).json({
      success: 0,
      message: "Country and service are required",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
      });
    }

    /* ==============================
       GET SERVICE PRICE FIRST
    ============================== */
    const pricingRes = await axios.get(
      `${SMSPOOL_BASE_URL}/request/pricing`,
      { params: { key: API_KEY } }
    );

    const priceInfo = pricingRes.data.find(
      (p) => p.service === service && p.country === country
    );

    if (!priceInfo) {
      return res.status(400).json({
        success: 0,
        message: "Service not available for selected country",
      });
    }

    const priceInNaira = Number(priceInfo.price) * USD_TO_NGN;

    /* ==============================
       CHECK USER BALANCE
    ============================== */
    if (user.balance < priceInNaira) {
      return res.status(400).json({
        success: 0,
        message: "Insufficient balance",
      });
    }

    /* ==============================
       DEDUCT BALANCE FIRST
    ============================== */
    user.balance -= priceInNaira;
    await user.save();

    try {
      /* ==============================
         ATTEMPT PURCHASE
      ============================== */
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

      /* ==============================
         IF SMSPOOL FAILED → REFUND
      ============================== */
      if (response.data.success !== 1) {
        user.balance += priceInNaira;
        await user.save();

        return res.status(400).json(response.data);
      }

      /* ==============================
         SUCCESS
      ============================== */
      return res.json({
        success: 1,
        data: response.data,
        newBalance: user.balance,
      });

    } catch (purchaseError) {
      /* ==============================
         NETWORK ERROR → REFUND
      ============================== */
      user.balance += priceInNaira;
      await user.save();

      return res.status(500).json({
        success: 0,
        message: "Purchase failed, balance refunded",
      });
    }

  } catch (err) {
    console.error("Buy Error:", err.response?.data || err.message);

    return res.status(500).json({
      success: 0,
      message: "Something went wrong",
    });
  }
};

