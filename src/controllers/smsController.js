// const axios = require("axios");
// const User = require("../models/User");
// const Order = require("../models/Order");

// const SMSPOOL_BASE_URL = "https://api.smspool.net";
// const API_KEY = process.env.SMS_POOL_API_KEY;

// const USD_TO_NGN = 1000;

// // 🔥 100% Markup
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
//    GET SERVICES WITH MARKUP PRICING
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
//    BUY NUMBER (SAFE PROFIT VERSION)
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

//     // 🔥 Always fetch latest pricing (protects profit)
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

//     // Base price (what SMSPool will deduct from YOU)
//     const basePriceNGN = Number(priceInfo.price) * USD_TO_NGN;

//     // Selling price (what YOU charge user)
//     const sellingPriceNGN = basePriceNGN * MARKUP_MULTIPLIER;

//     // Check user balance
//     if (user.walletBalanceNGN < sellingPriceNGN) {
//       return res.status(400).json({
//         success: 0,
//         message: "Insufficient balance",
//       });
//     }

//     // 🔥 Purchase from SMSPool
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

//     // Deduct selling price from user
//     user.walletBalanceNGN -= sellingPriceNGN;
//     await user.save();

//     // Save order
//     const order = new Order({
//       user: user._id,
//       service: String(service),
//       country: String(country),
//       orderid,
//       number,
//       baseCost: basePriceNGN,       // What SMSPool charged you
//       priceCharged: sellingPriceNGN, // What user paid
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
//         profit: sellingPriceNGN - basePriceNGN,
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
//       {
//         params: {
//           key: API_KEY,
//           orderid,
//         },
//       }
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
//         otp: null,
//         message: "Order cancelled or expired",
//       });
//     }

//     return res.json({
//       success: 0,
//       otp: null,
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

// module.exports = {
//   getServers,
//   getServices,
//   buyNumber,
//   getOtp,
// };

const axios = require("axios");
const User = require("../models/User");
const Order = require("../models/Order");

const SMSPOOL_BASE_URL = "https://api.smspool.net";
const API_KEY = process.env.SMS_POOL_API_KEY;

const USD_TO_NGN = 1500;

// 100% markup
const MARKUP_PERCENT = 100;
const MARKUP_MULTIPLIER = 1 + MARKUP_PERCENT / 100;

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
      ID: String(c.ID),
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
   GET SERVICES WITH MARKUP
===================================================== */
const getServices = async (req, res) => {
  try {
    const [servicesRes, pricingRes] = await Promise.all([
      axios.get(`${SMSPOOL_BASE_URL}/service/retrieve_all`, {
        params: { key: API_KEY },
      }),
      axios.get(`${SMSPOOL_BASE_URL}/request/pricing`, {
        params: { key: API_KEY },
      }),
    ]);

    const services = servicesRes.data.map((service) => {
      const countryPricing = pricingRes.data
        .filter((p) => String(p.service) === String(service.ID))
        .map((p) => {
          const basePriceNGN = Number(p.price) * USD_TO_NGN;
          const sellingPriceNGN = basePriceNGN * MARKUP_MULTIPLIER;

          return {
            countryID: String(p.country),
            pool: p.pool,
            basePriceNGN,
            priceNGN: sellingPriceNGN,
          };
        });

      return {
        ID: String(service.ID),
        name: service.name,
        pricing: countryPricing,
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
  const { country, service } = req.body;

  if (!country || !service) {
    return res.status(400).json({
      success: 0,
      message: "Country and service are required",
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
      });
    }

    // Always fetch latest pricing
    const pricingRes = await axios.get(
      `${SMSPOOL_BASE_URL}/request/pricing`,
      { params: { key: API_KEY } }
    );

    const priceInfo = pricingRes.data.find(
      (p) =>
        String(p.service) === String(service) &&
        String(p.country) === String(country)
    );

    if (!priceInfo) {
      return res.status(400).json({
        success: 0,
        message: "Service not available for selected country",
      });
    }

    const basePriceNGN = Number(priceInfo.price) * USD_TO_NGN;
    const sellingPriceNGN = basePriceNGN * MARKUP_MULTIPLIER;

    if (user.walletBalanceNGN < sellingPriceNGN) {
      return res.status(400).json({
        success: 0,
        message: "Insufficient balance",
      });
    }

    // Purchase
    const purchaseRes = await axios.post(
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

    if (!purchaseRes.data || purchaseRes.data.success === 0) {
      return res.status(500).json({
        success: 0,
        message: purchaseRes.data?.message || "Purchase failed",
      });
    }

    const { number, orderid } = purchaseRes.data;

    // Deduct from user
    user.walletBalanceNGN -= sellingPriceNGN;
    await user.save();

    // Save order
    const order = new Order({
      user: user._id,
      service: String(service),
      country: String(country),
      orderid,
      number,
      baseCost: basePriceNGN,
      priceCharged: sellingPriceNGN,
      profit: sellingPriceNGN - basePriceNGN,
      status: "waiting",
    });

    await order.save();

    res.json({
      success: 1,
      message: "Number purchased successfully",
      data: {
        number,
        orderid,
        pricePaid: sellingPriceNGN,
      },
      remainingBalance: user.walletBalanceNGN,
    });
  } catch (err) {
    console.error("Buy Error:", err.response?.data || err.message);
    res.status(500).json({
      success: 0,
      message: "Purchase failed",
    });
  }
};

/* =====================================================
   CHECK OTP
===================================================== */
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
//         params: { key: API_KEY, orderid },
//       }
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

const getOtp = async (req, res) => {
  const { orderid } = req.body;

  if (!orderid) {
    return res.status(400).json({
      success: 0,
      message: "Order ID is required",
    });
  }

  try {
    // Fetch the order
    const order = await Order.findOne({ orderid });
    if (!order) {
      return res.status(404).json({
        success: 0,
        message: "Order not found",
      });
    }

    // Handle refunded orders
    if (order.status === "refunded") {
      return res.json({
        success: 0,
        message: "Order has been refunded",
        otp: order.otp || null,
      });
    }

    // Handle already received OTP
    if (order.status === "received" && order.otp) {
      return res.json({
        success: 1,
        message: "OTP already received",
        otp: order.otp,
      });
    }

    // Handle cancelled orders
    if (order.status === "cancelled") {
      return res.json({
        success: 0,
        message: "Order was cancelled",
        otp: order.otp || null,
      });
    }

    // Check provider for latest OTP
    const response = await axios.post(
      `${SMSPOOL_BASE_URL}/sms/check`,
      null,
      { params: { key: API_KEY, orderid } }
    );

    const status = Number(response.data.status);
    const sms = response.data.sms;

    if (status === 3 && sms) {
      // OTP received
      const otp = sms.match(/\d{4,6}/)?.[0];
      order.otp = otp;
      order.status = "received";
      await order.save();

      return res.json({
        success: 1,
        message: "OTP received",
        otp,
      });
    }

    if (status === 4) {
      // Provider cancelled/expired
      order.status = "cancelled";
      await order.save();

      return res.json({
        success: 0,
        message: "Order expired or cancelled",
        otp: order.otp || null,
      });
    }

    // Still waiting
    return res.json({
      success: 0,
      message: "OTP not yet available",
      otp: order.otp || null,
    });

  } catch (err) {
    console.error("OTP Error:", err.response?.data || err.message);
    return res.status(500).json({
      success: 0,
      message: "Failed to check OTP",
    });
  }
};

/* =====================================================
   MANUAL REFUND / CANCEL
===================================================== */
const cancelOrder = async (req, res) => {
  const { orderid } = req.body;

  if (!orderid) {
    return res.status(400).json({
      success: 0,
      message: "Order ID required",
    });
  }

  try {
    const order = await Order.findOne({
      orderid,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: 0,
        message: "Order not found",
      });
    }

    if (order.status !== "waiting") {
      return res.status(400).json({
        success: 0,
        message: "Order cannot be refunded",
      });
    }

    if (order.refunded) {
      return res.status(400).json({
        success: 0,
        message: "Order already refunded",
      });
    }

    // Cancel on provider
    await axios.post(
      `${SMSPOOL_BASE_URL}/sms/cancel`,
      null,
      {
        params: {
          key: API_KEY,
          orderid,
        },
      }
    );

    const user = await User.findById(order.user);

    // Refund wallet
    user.walletBalanceNGN += order.priceCharged;
    await user.save();

    // Update order
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
    return res.status(500).json({
      success: 0,
      message: "Refund failed",
    });
  }
};

/* =====================================================
   GET USER ORDERS
===================================================== */
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: 1,
      data: orders,
    });
  } catch (err) {
    console.error("Fetch Orders Error:", err.message);
    res.status(500).json({
      success: 0,
      message: "Failed to fetch orders",
    });
  }
};

module.exports = {
  getServers,
  getServices,
  buyNumber,
  getOtp,
  cancelOrder,
  getUserOrders,
};

