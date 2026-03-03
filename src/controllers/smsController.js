// const axios = require("axios");
// const User = require("../models/User");
// const Order = require("../models/Order");

// const SMSPOOL_BASE_URL = "https://api.smspool.net";
// const API_KEY = process.env.SMS_POOL_API_KEY;

// const USD_TO_NGN = 1500;

// // 100% markup
// const MARKUP_PERCENT = 100;
// const MARKUP_MULTIPLIER = 1 + MARKUP_PERCENT / 100;

// /* =====================================================
//    GET ALL COUNTRIES
// ===================================================== */
// const getServers = async (req, res) => {
//   try {
//     const response = await axios.get(
//       `${SMSPOOL_BASE_URL}/country/retrieve_all`,
//       { params: { key: API_KEY } }
//     );

//     const countries = response.data.map((c) => ({
//       ID: String(c.ID),
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
//    GET SERVICES WITH MARKUP
// ===================================================== */
// const getServices = async (req, res) => {
//   try {
//     const [servicesRes, pricingRes] = await Promise.all([
//       axios.get(`${SMSPOOL_BASE_URL}/service/retrieve_all`, {
//         params: { key: API_KEY },
//       }),
//       axios.get(`${SMSPOOL_BASE_URL}/request/pricing`, {
//         params: { key: API_KEY },
//       }),
//     ]);

//     const services = servicesRes.data.map((service) => {
//       const countryPricing = pricingRes.data
//         .filter((p) => String(p.service) === String(service.ID))
//         .map((p) => {
//           const basePriceNGN = Number(p.price) * USD_TO_NGN;
//           const sellingPriceNGN = basePriceNGN * MARKUP_MULTIPLIER;

//           return {
//             countryID: String(p.country),
//             pool: p.pool,
//             basePriceNGN,
//             priceNGN: sellingPriceNGN,
//           };
//         });

//       return {
//         ID: String(service.ID),
//         name: service.name,
//         pricing: countryPricing,
//       };
//     });

//     res.json(services);
//   } catch (err) {
//     console.error("Service Error:", err.response?.data || err.message);
//     res.status(500).json([]);
//   }
// };

// /* =====================================================
//    BUY NUMBER (UPDATED TO SAVE COUNTRY CODE)
// ===================================================== */
// const buyNumber = async (req, res) => {
//   const { country, service } = req.body;

//   if (!country || !service) {
//     return res.status(400).json({
//       success: 0,
//       message: "Country and service are required",
//     });
//   }

//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({
//         success: 0,
//         message: "User not found",
//       });
//     }

//     // Always fetch latest pricing
//     const pricingRes = await axios.get(
//       `${SMSPOOL_BASE_URL}/request/pricing`,
//       { params: { key: API_KEY } }
//     );

//     const priceInfo = pricingRes.data.find(
//       (p) =>
//         String(p.service) === String(service) &&
//         String(p.country) === String(country)
//     );

//     if (!priceInfo) {
//       return res.status(400).json({
//         success: 0,
//         message: "Service not available for selected country",
//       });
//     }

//     const basePriceNGN = Number(priceInfo.price) * USD_TO_NGN;
//     const sellingPriceNGN = basePriceNGN * MARKUP_MULTIPLIER;

//     if (user.walletBalanceNGN < sellingPriceNGN) {
//       return res.status(400).json({
//         success: 0,
//         message: "Insufficient balance",
//       });
//     }

//     // Fetch country list to get country code
//     const countryRes = await axios.get(
//       `${SMSPOOL_BASE_URL}/country/retrieve_all`,
//       { params: { key: API_KEY } }
//     );

//     const selectedCountry = countryRes.data.find(
//       (c) => String(c.ID) === String(country)
//     );

//     if (!selectedCountry) {
//       return res.status(400).json({
//         success: 0,
//         message: "Invalid country selected",
//       });
//     }

//     const countryCode = selectedCountry.short_name;

//     // Purchase from SMSPool
//     const purchaseRes = await axios.post(
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

//     if (!purchaseRes.data || purchaseRes.data.success === 0) {
//       return res.status(500).json({
//         success: 0,
//         message: purchaseRes.data?.message || "Purchase failed",
//       });
//     }

//     const { number, orderid } = purchaseRes.data;

//     // Deduct wallet
//     user.walletBalanceNGN -= sellingPriceNGN;
//     await user.save();

//     // Save order (NOW SAVING COUNTRY CODE)
//     const order = new Order({
//       user: user._id,
//       service: String(service),
//       country: {
//         id: String(country),      // provider ID
//         code: countryCode,        // country code (US, UK, NG etc)
//       },
//       orderid,
//       number,
//       baseCost: basePriceNGN,
//       priceCharged: sellingPriceNGN,
//       profit: sellingPriceNGN - basePriceNGN,
//       status: "waiting",
//     });

//     await order.save();

//     res.json({
//       success: 1,
//       message: "Number purchased successfully",
//       data: {
//         number,
//         orderid,
//         pricePaid: sellingPriceNGN,
//         countryCode,
//       },
//       remainingBalance: user.walletBalanceNGN,
//     });

//   } catch (err) {
//     console.error("Buy Error:", err.response?.data || err.message);
//     res.status(500).json({
//       success: 0,
//       message: "Purchase failed",
//     });
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
//       { params: { key: API_KEY, orderid } }
//     );

//     const status = Number(response.data.status);
//     const sms = response.data.sms;

//     const order = await Order.findOne({ orderid });
//     if (!order) {
//       return res.status(404).json({
//         success: 0,
//         message: "Order not found",
//       });
//     }

//     if (status === 3 && sms) {
//       const otp = sms.match(/\d{4,6}/)?.[0];

//       order.otp = otp;
//       order.status = "received";
//       await order.save();

//       return res.json({
//         success: 1,
//         otp,
//         message: "OTP received",
//       });
//     }

//     if (status === 4) {
//       order.status = "cancelled";
//       await order.save();

//       return res.json({
//         success: 0,
//         message: "Order expired or cancelled",
//       });
//     }

//     return res.json({
//       success: 0,
//       message: "OTP not yet available",
//     });

//   } catch (err) {
//     console.error("OTP Error:", err.response?.data || err.message);
//     res.status(500).json({
//       success: 0,
//       message: "Failed to check OTP",
//     });
//   }
// };

// /* =====================================================
//    MANUAL REFUND
// ===================================================== */
// const cancelOrder = async (req, res) => {
//   const { orderid } = req.body;

//   if (!orderid) {
//     return res.status(400).json({
//       success: 0,
//       message: "Order ID required",
//     });
//   }

//   try {
//     const order = await Order.findOne({
//       orderid,
//       user: req.user.id,
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: 0,
//         message: "Order not found",
//       });
//     }

//     if (order.status !== "waiting") {
//       return res.status(400).json({
//         success: 0,
//         message: "Order cannot be refunded",
//       });
//     }

//     if (order.refunded) {
//       return res.status(400).json({
//         success: 0,
//         message: "Order already refunded",
//       });
//     }

//     await axios.post(
//       `${SMSPOOL_BASE_URL}/sms/cancel`,
//       null,
//       { params: { key: API_KEY, orderid } }
//     );

//     const user = await User.findById(order.user);

//     user.walletBalanceNGN += order.priceCharged;
//     await user.save();

//     order.status = "refunded";
//     order.refunded = true;
//     order.refundedAt = new Date();
//     order.profit = 0;

//     await order.save();

//     return res.json({
//       success: 1,
//       message: "Order refunded successfully",
//       refundedAmount: order.priceCharged,
//       newBalance: user.walletBalanceNGN,
//     });

//   } catch (err) {
//     console.error("Refund Error:", err.response?.data || err.message);
//     return res.status(500).json({
//       success: 0,
//       message: "Refund failed",
//     });
//   }
// };

// /* =====================================================
//    GET USER ORDERS
// ===================================================== */
// const getUserOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user.id })
//       .sort({ createdAt: -1 });

//     res.json({
//       success: 1,
//       data: orders,
//     });
//   } catch (err) {
//     console.error("Fetch Orders Error:", err.message);
//     res.status(500).json({
//       success: 0,
//       message: "Failed to fetch orders",
//     });
//   }
// };

// const resendOtp = async (req, res) => {
//   const { orderid } = req.body;

//   if (!orderid) {
//     return res.status(400).json({ success: 0, message: "Order ID is required" });
//   }

//   try {
//     const order = await Order.findOne({ orderid, user: req.user.id });

//     if (!order) {
//       return res.status(404).json({ success: 0, message: "Order not found" });
//     }

//     // ✅ Allow resending for "waiting" or "received" orders
//     if (order.status === "refunded" || order.status === "cancelled") {
//       return res.status(400).json({
//         success: 0,
//         message: "Cannot resend OTP for refunded or cancelled orders",
//       });
//     }

//     // Call SMSPool resend OTP API
//     const response = await axios.post(
//       `${SMSPOOL_BASE_URL}/sms/resend`,
//       null,
//       { params: { key: API_KEY, orderid } }
//     );

//     if (response.data.success === 1) {
//       // Reset status to waiting so polling resumes
//       order.status = "waiting";
//       order.otp = null;
//       await order.save();

//       return res.json({
//         success: 1,
//         message: "OTP resent successfully",
//       });
//     } else {
//       return res.status(500).json({
//         success: 0,
//         message: response.data?.message || "Failed to resend OTP",
//       });
//     }

//   } catch (err) {
//     console.error("Resend OTP Error:", err.response?.data || err.message);
//     return res.status(500).json({ success: 0, message: "Failed to resend OTP" });
//   }
// };

// module.exports = {
//   getServers,
//   getServices,
//   buyNumber,
//   getOtp,
//   cancelOrder,
//   getUserOrders,
//   resendOtp,
// };


const axios = require("axios");
const User = require("../models/User");
const Order = require("../models/Order");

const SMSPOOL_BASE_URL = "https://api.smspool.net";
const API_KEY = process.env.SMS_POOL_API_KEY;

const USD_TO_NGN = 1500;
const MARKUP_PERCENT = 100;
const MARKUP_MULTIPLIER = 1 + MARKUP_PERCENT / 100;

/* =====================================================
   BUY NUMBER
===================================================== */
const buyNumber = async (req, res) => {
  const { country, service } = req.body;

  if (!country || !service) {
    return res.status(400).json({ success: 0, message: "Country and service are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: 0, message: "User not found" });

    const pricingRes = await axios.get(`${SMSPOOL_BASE_URL}/request/pricing`, { params: { key: API_KEY } });
    const priceInfo = pricingRes.data.find(p => String(p.service) === String(service) && String(p.country) === String(country));

    if (!priceInfo) return res.status(400).json({ success: 0, message: "Service not available for selected country" });

    const basePriceNGN = Number(priceInfo.price) * USD_TO_NGN;
    const sellingPriceNGN = basePriceNGN * MARKUP_MULTIPLIER;

    if (user.walletBalanceNGN < sellingPriceNGN) return res.status(400).json({ success: 0, message: "Insufficient balance" });

    const countryRes = await axios.get(`${SMSPOOL_BASE_URL}/country/retrieve_all`, { params: { key: API_KEY } });
    const selectedCountry = countryRes.data.find(c => String(c.ID) === String(country));
    if (!selectedCountry) return res.status(400).json({ success: 0, message: "Invalid country selected" });

    const countryCode = selectedCountry.short_name;

    const purchaseRes = await axios.post(`${SMSPOOL_BASE_URL}/purchase/sms`, null, {
      params: { key: API_KEY, country, service, quantity: 1 },
    });

    if (!purchaseRes.data || purchaseRes.data.success === 0) {
      return res.status(500).json({ success: 0, message: purchaseRes.data?.message || "Purchase failed" });
    }

    const { number, orderid } = purchaseRes.data;

    user.walletBalanceNGN -= sellingPriceNGN;
    await user.save();

    const order = new Order({
      user: user._id,
      service: String(service),
      country: { id: String(country), code: countryCode },
      orderid,
      number,
      baseCost: basePriceNGN,
      priceCharged: sellingPriceNGN,
      profit: sellingPriceNGN - basePriceNGN,
      status: "waiting", // OTP not received yet
    });

    await order.save();

    res.json({
      success: 1,
      message: "Number purchased successfully",
      data: { number, orderid, pricePaid: sellingPriceNGN, countryCode },
      remainingBalance: user.walletBalanceNGN,
    });

  } catch (err) {
    console.error("Buy Error:", err.response?.data || err.message);
    res.status(500).json({ success: 0, message: "Purchase failed" });
  }
};

/* =====================================================
   GET OTP
===================================================== */
const getOtp = async (req, res) => {
  const { orderid } = req.body;
  if (!orderid) return res.status(400).json({ success: 0, message: "Order ID is required" });

  try {
    const response = await axios.post(`${SMSPOOL_BASE_URL}/sms/check`, null, { params: { key: API_KEY, orderid } });
    const status = Number(response.data.status);
    const sms = response.data.sms;

    const order = await Order.findOne({ orderid });
    if (!order) return res.status(404).json({ success: 0, message: "Order not found" });

    if (status === 3 && sms) {
      const otp = sms.match(/\d{4,6}/)?.[0];
      order.otp = otp;
      order.status = "received"; // OTP received, no refund allowed
      await order.save();

      return res.json({ success: 1, otp, message: "OTP received" });
    }

    if (status === 4) {
      order.status = "cancelled";
      await order.save();
      return res.json({ success: 0, message: "Order expired or cancelled" });
    }

    return res.json({ success: 0, message: "OTP not yet available" });

  } catch (err) {
    console.error("OTP Error:", err.response?.data || err.message);
    res.status(500).json({ success: 0, message: "Failed to check OTP" });
  }
};

/* =====================================================
   RESEND OTP
   ✅ Does NOT allow refund
===================================================== */
const resendOtp = async (req, res) => {
  const { orderid } = req.body;
  if (!orderid) return res.status(400).json({ success: 0, message: "Order ID is required" });

  try {
    const order = await Order.findOne({ orderid, user: req.user.id });
    if (!order) return res.status(404).json({ success: 0, message: "Order not found" });

    if (order.status === "refunded" || order.status === "cancelled") {
      return res.status(400).json({ success: 0, message: "Cannot resend OTP for refunded or cancelled orders" });
    }

    const response = await axios.post(`${SMSPOOL_BASE_URL}/sms/resend`, null, { params: { key: API_KEY, orderid } });
    if (response.data.success === 1) {
      order.resendRequested = true; // track resend request
      await order.save();

      return res.json({ success: 1, message: "OTP resent successfully" });
    } else {
      return res.status(500).json({ success: 0, message: response.data?.message || "Failed to resend OTP" });
    }

  } catch (err) {
    console.error("Resend OTP Error:", err.response?.data || err.message);
    return res.status(500).json({ success: 0, message: "Failed to resend OTP" });
  }
};

/* =====================================================
   CANCEL / REFUND
   ✅ Block refund if OTP received
===================================================== */
const cancelOrder = async (req, res) => {
  const { orderid } = req.body;
  if (!orderid) return res.status(400).json({ success: 0, message: "Order ID required" });

  try {
    const order = await Order.findOne({ orderid, user: req.user.id });
    if (!order) return res.status(404).json({ success: 0, message: "Order not found" });

    if (order.status === "received" || order.status === "refunded") {
      return res.status(400).json({ success: 0, message: "Cannot refund after OTP has been received" });
    }

    if (order.status !== "waiting") {
      return res.status(400).json({ success: 0, message: "Order cannot be refunded" });
    }

    if (order.refunded) return res.status(400).json({ success: 0, message: "Order already refunded" });

    await axios.post(`${SMSPOOL_BASE_URL}/sms/cancel`, null, { params: { key: API_KEY, orderid } });

    const user = await User.findById(order.user);
    user.walletBalanceNGN += order.priceCharged;
    await user.save();

    order.status = "refunded";
    order.refunded = true;
    order.refundedAt = new Date();
    order.profit = 0;
    await order.save();

    return res.json({
      success: 1,
      message: "Order refunded successfully",
      refundedAmount: order.priceCharged,
      newBalance: user.walletBalanceNGN,
    });

  } catch (err) {
    console.error("Refund Error:", err.response?.data || err.message);
    return res.status(500).json({ success: 0, message: "Refund failed" });
  }
};

/* =====================================================
   GET USER ORDERS
===================================================== */
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: 1, data: orders });
  } catch (err) {
    console.error("Fetch Orders Error:", err.message);
    res.status(500).json({ success: 0, message: "Failed to fetch orders" });
  }
};

module.exports = {
  getServers,
  getServices,
  buyNumber,
  getOtp,
  cancelOrder,
  getUserOrders,
  resendOtp,
};
