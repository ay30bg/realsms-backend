// const User = require("../models/User");
// const Order = require("../models/Order");
// const Transaction = require("../models/Transaction");

// exports.getAdminStats = async (req, res) => {
//   try {
//     /* ==============================
//        TOTAL COUNTS
//     ============================== */

//     const totalUsers = await User.countDocuments();
//     const totalOrders = await Order.countDocuments();
//     const totalTransactions = await Transaction.countDocuments();

//     /* ==============================
//        TOTAL REVENUE (SUCCESS ONLY)
//     ============================== */

//     const revenueResult = await Transaction.aggregate([
//       { $match: { status: { $regex: /^SUCCESS$/i } } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

//     const totalRevenue = revenueResult[0]?.total || 0;

//     /* ==============================
//        DATE RANGES
//     ============================== */

//     const now = new Date();

//     const thisWeekStart = new Date();
//     thisWeekStart.setDate(now.getDate() - 7);

//     const previousWeekStart = new Date();
//     previousWeekStart.setDate(now.getDate() - 14);

//     /* ==============================
//        THIS WEEK DATA
//     ============================== */

//     const thisWeekRevenueAgg = await Transaction.aggregate([
//       {
//         $match: {
//           status: { $regex: /^SUCCESS$/i },
//           createdAt: { $gte: thisWeekStart },
//         },
//       },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

//     const thisWeekRevenue = thisWeekRevenueAgg[0]?.total || 0;

//     const thisWeekUsers = await User.countDocuments({
//       createdAt: { $gte: thisWeekStart },
//     });

//     const thisWeekOrders = await Order.countDocuments({
//       createdAt: { $gte: thisWeekStart },
//     });

//     const thisWeekTransactions = await Transaction.countDocuments({
//       createdAt: { $gte: thisWeekStart },
//     });

//     /* ==============================
//        PREVIOUS WEEK DATA
//     ============================== */

//     const previousWeekRevenueAgg = await Transaction.aggregate([
//       {
//         $match: {
//           status: { $regex: /^SUCCESS$/i },
//           createdAt: {
//             $gte: previousWeekStart,
//             $lt: thisWeekStart,
//           },
//         },
//       },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

//     const previousWeekRevenue = previousWeekRevenueAgg[0]?.total || 0;

//     const previousWeekUsers = await User.countDocuments({
//       createdAt: {
//         $gte: previousWeekStart,
//         $lt: thisWeekStart,
//       },
//     });

//     const previousWeekOrders = await Order.countDocuments({
//       createdAt: {
//         $gte: previousWeekStart,
//         $lt: thisWeekStart,
//       },
//     });

//     const previousWeekTransactions = await Transaction.countDocuments({
//       createdAt: {
//         $gte: previousWeekStart,
//         $lt: thisWeekStart,
//       },
//     });

//     /* ==============================
//        CHANGE CALCULATIONS
//     ============================== */

//     const calculateChange = (current, previous) => {
//       if (previous === 0) return current > 0 ? 100 : 0;
//       return (((current - previous) / previous) * 100).toFixed(2);
//     };

//     const weeklyRevenueChange = calculateChange(
//       thisWeekRevenue,
//       previousWeekRevenue
//     );

//     const weeklyUsersChange = calculateChange(
//       thisWeekUsers,
//       previousWeekUsers
//     );

//     const weeklyOrdersChange = calculateChange(
//       thisWeekOrders,
//       previousWeekOrders
//     );

//     const weeklyTransactionsChange = calculateChange(
//       thisWeekTransactions,
//       previousWeekTransactions
//     );

//     /* ==============================
//        RESPONSE
//     ============================== */

//     res.json({
//       totalUsers,
//       totalOrders,
//       totalTransactions,
//       totalRevenue,

//       weeklyRevenueChange,
//       weeklyUsersChange,
//       weeklyOrdersChange,
//       weeklyTransactionsChange,
//     });
//   } catch (error) {
//     console.error("Admin stats error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch admin stats",
//     });
//   }
// };

const User = require("../models/User");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");

/* ==============================
   ADMIN STATS (EXISTING)
============================== */
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const revenueResult = await Transaction.aggregate([
      { $match: { status: { $regex: /^SUCCESS$/i } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const now = new Date();
    const thisWeekStart = new Date();
    thisWeekStart.setDate(now.getDate() - 7);
    const previousWeekStart = new Date();
    previousWeekStart.setDate(now.getDate() - 14);

    const thisWeekRevenueAgg = await Transaction.aggregate([
      { $match: { status: { $regex: /^SUCCESS$/i }, createdAt: { $gte: thisWeekStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const thisWeekRevenue = thisWeekRevenueAgg[0]?.total || 0;

    const thisWeekUsers = await User.countDocuments({ createdAt: { $gte: thisWeekStart } });
    const thisWeekOrders = await Order.countDocuments({ createdAt: { $gte: thisWeekStart } });
    const thisWeekTransactions = await Transaction.countDocuments({ createdAt: { $gte: thisWeekStart } });

    const previousWeekRevenueAgg = await Transaction.aggregate([
      { $match: { status: { $regex: /^SUCCESS$/i }, createdAt: { $gte: previousWeekStart, $lt: thisWeekStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const previousWeekRevenue = previousWeekRevenueAgg[0]?.total || 0;

    const previousWeekUsers = await User.countDocuments({ createdAt: { $gte: previousWeekStart, $lt: thisWeekStart } });
    const previousWeekOrders = await Order.countDocuments({ createdAt: { $gte: previousWeekStart, $lt: thisWeekStart } });
    const previousWeekTransactions = await Transaction.countDocuments({ createdAt: { $gte: previousWeekStart, $lt: thisWeekStart } });

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return (((current - previous) / previous) * 100).toFixed(2);
    };

    res.json({
      totalUsers,
      totalOrders,
      totalTransactions,
      totalRevenue,
      weeklyRevenueChange: calculateChange(thisWeekRevenue, previousWeekRevenue),
      weeklyUsersChange: calculateChange(thisWeekUsers, previousWeekUsers),
      weeklyOrdersChange: calculateChange(thisWeekOrders, previousWeekOrders),
      weeklyTransactionsChange: calculateChange(thisWeekTransactions, previousWeekTransactions),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admin stats" });
  }
};

/* ==============================
   GET ALL USERS
============================== */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ==============================
   GET ALL TRANSACTIONS
============================== */
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "email") // optional: populate user email
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

/* ==============================
   GET ALL ORDERS
============================== */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
