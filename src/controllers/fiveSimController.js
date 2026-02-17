// const axios = require("axios");

// // ============================
// // Buy a number from 5sim
// // ============================
// exports.buyNumber = async (req, res) => {
//   const { country, service } = req.body;

//   if (!country || !service) {
//     return res.status(400).json({
//       success: false,
//       message: "Country and service are required",
//     });
//   }

//   try {
//     const response = await axios.post(
//       "https://5sim.net/v1/user/buy/activation",
//       { country, operator: service },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.FIVSIM_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const data = response.data;

//     return res.json({ success: true, numberData: data });
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     return res.status(400).json({
//       success: false,
//       message: "Failed to buy number",
//       error: err.response?.data,
//     });
//   }
// };

// // ============================
// // Check OTP for a given order
// // ============================
// exports.checkOtp = async (req, res) => {
//   const { orderId } = req.body;

//   if (!orderId) {
//     return res.status(400).json({ success: false, message: "orderId is required" });
//   }

//   try {
//     const response = await axios.get(
//       `https://5sim.net/v1/user/check/${orderId}`,
//       {
//         headers: { Authorization: `Bearer ${process.env.FIVSIM_API_KEY}` },
//       }
//     );

//     const data = response.data;

//     if (data.status === "RECEIVED") {
//       return res.json({ otp: data.code });
//     } else {
//       return res.json({ otp: null });
//     }
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     return res.status(400).json({ otp: null });
//   }
// };

const axios = require("axios");

// ============================
// Buy a number from 5sim
// ============================
exports.buyNumber = async (req, res) => {
  const { country, service } = req.body;

  if (!country || !service) {
    return res.status(400).json({
      success: false,
      message: "Country and service are required",
    });
  }

  try {
    const response = await axios.post(
      "https://5sim.net/v1/user/buy/activation",
      { country, operator: service },
      {
        headers: {
          Authorization: `Bearer ${process.env.FIVSIM_API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    const data = response.data;

    return res.json({ success: true, numberData: data });
  } catch (err) {
    console.error("Buy number error:", err.response?.data || err.message);

    return res.status(400).json({
      success: false,
      message: "Failed to buy number. Please try again.",
      error: err.response?.data || err.message,
    });
  }
};

// ============================
// Check OTP for a given order
// ============================
exports.checkOtp = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "orderId is required" });
  }

  try {
    const response = await axios.get(`https://5sim.net/v1/user/check/${orderId}`, {
      headers: {
        Authorization: `Bearer ${process.env.FIVSIM_API_KEY}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    const data = response.data;

    // status can be WAITING, RECEIVED, EXPIRED, CANCELLED
    if (data.status === "RECEIVED") {
      return res.json({ otp: data.code });
    } else if (data.status === "EXPIRED" || data.status === "CANCELLED") {
      return res.json({ otp: null, expired: true });
    } else {
      return res.json({ otp: null });
    }
  } catch (err) {
    console.error("Check OTP error:", err.response?.data || err.message);
    return res.status(400).json({ otp: null, error: err.response?.data || err.message });
  }
};
