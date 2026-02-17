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
    // Make request to 5sim official API
    const response = await axios.post(
      "https://5sim.net/v1/user/buy/activation",
      {
        country: country,
        operator: service,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FIVSIM_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // optional: 10s timeout
      }
    );

    const data = response.data;

    // Check for expected fields
    if (!data.id || !data.number) {
      return res.status(500).json({
        success: false,
        message: "Invalid response from 5sim API",
        rawData: data,
      });
    }

    return res.json({
      success: true,
      numberData: {
        id: data.id,
        number: data.number,
        price: data.price,
        country: data.country,
        operator: data.operator,
        status: data.status,
      },
    });
  } catch (err) {
    console.error("5sim buyNumber error:", err.response?.data || err.message);

    return res.status(400).json({
      success: false,
      message: "Failed to buy number",
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
    const response = await axios.get(
      `https://5sim.net/v1/user/check/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FIVSIM_API_KEY}`,
        },
        timeout: 10000, // optional: 10s timeout
      }
    );

    const data = response.data;

    // If OTP received, return it
    if (data.status === "RECEIVED" && data.code) {
      return res.json({ otp: data.code });
    }

    // If still waiting or other status, return null
    return res.json({ otp: null, status: data.status });
  } catch (err) {
    console.error("5sim checkOtp error:", err.response?.data || err.message);

    return res.status(400).json({
      success: false,
      otp: null,
      message: "Failed to check OTP",
      error: err.response?.data || err.message,
    });
  }
};
