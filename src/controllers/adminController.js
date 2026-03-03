// const User = require("../models/User");
// const Order = require("../models/Order");
// const Transaction = require("../models/Transaction");

// exports.getAdminStats = async (req, res) => {
//   try {
//     // Total counts
//     const totalUsers = await User.countDocuments();
//     const totalOrders = await Order.countDocuments();
//     const totalTransactions = await Transaction.countDocuments();

//     // Total Revenue
//     const revenueResult = await Transaction.aggregate([
//       { $match: { status: "success" } },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const totalRevenue = revenueResult[0]?.total || 0;

//     res.json({
//       totalUsers,
//       totalOrders,
//       totalTransactions,
//       totalRevenue,
//     });
//   } catch (error) {
//     console.error("Admin stats error:", error);
//     res.status(500).json({ message: "Failed to fetch admin stats" });
//   }
// };


const User = require("../models/User");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");

// ✅ Get Admin Stats
exports.getAdminStats = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    // Total Revenue (successful transactions only)
    const revenueResult = await Transaction.aggregate([
      { $match: { status: { $regex: /^SUCCESS$/i } } }, // match SUCCESS case-insensitive
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Optional: calculate weekly change (example: last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTransactions = await Transaction.aggregate([
      { $match: { status: { $regex: /^SUCCESS$/i }, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const weeklyRevenue = weeklyTransactions[0]?.total || 0;

    const weeklyRevenueChange = totalRevenue
      ? (((weeklyRevenue - (totalRevenue - weeklyRevenue)) / totalRevenue) * 100).toFixed(2)
      : 0;

    res.json({
      totalUsers,
      totalOrders,
      totalTransactions,
      totalRevenue,
      weeklyRevenueChange, // optional, frontend can display it
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};
