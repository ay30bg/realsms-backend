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

const BASE_URL = "https://5sim.net/v1/user";

// ============================
// BUY NUMBER
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
    const response = await axios.get(
      `${BASE_URL}/buy/activation/${country}/any/${service}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    console.log("5SIM ERROR:", err.response?.data || err.message);

    return res.status(400).json({
      success: false,
      message: "Failed to buy number",
      error: err.response?.data || err.message,
    });
  }
};

// ============================
// CHECK OTP
// ============================
exports.checkOtp = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "orderId is required",
    });
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/check/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
        },
      }
    );

    const data = response.data;

    return res.json({
      success: true,
      status: data.status,
      otp: data.status === "RECEIVED" ? data.code : null,
    });
  } catch (err) {
    console.log("CHECK ERROR:", err.response?.data || err.message);

    return res.status(400).json({
      success: false,
      otp: null,
    });
  }
};
