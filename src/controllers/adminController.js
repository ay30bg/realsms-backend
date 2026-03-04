// const User = require("../models/User");
// const Order = require("../models/Order");
// const Transaction = require("../models/Transaction");

// /* ==============================
//    ADMIN STATS (EXISTING)
// ============================== */
// exports.getAdminStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalOrders = await Order.countDocuments();
//     const totalTransactions = await Transaction.countDocuments();

//     const revenueResult = await Transaction.aggregate([
//       { $match: { status: { $regex: /^SUCCESS$/i } } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);
//     const totalRevenue = revenueResult[0]?.total || 0;

//     const now = new Date();
//     const thisWeekStart = new Date();
//     thisWeekStart.setDate(now.getDate() - 7);
//     const previousWeekStart = new Date();
//     previousWeekStart.setDate(now.getDate() - 14);

//     const thisWeekRevenueAgg = await Transaction.aggregate([
//       { $match: { status: { $regex: /^SUCCESS$/i }, createdAt: { $gte: thisWeekStart } } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);
//     const thisWeekRevenue = thisWeekRevenueAgg[0]?.total || 0;

//     const thisWeekUsers = await User.countDocuments({ createdAt: { $gte: thisWeekStart } });
//     const thisWeekOrders = await Order.countDocuments({ createdAt: { $gte: thisWeekStart } });
//     const thisWeekTransactions = await Transaction.countDocuments({ createdAt: { $gte: thisWeekStart } });

//     const previousWeekRevenueAgg = await Transaction.aggregate([
//       { $match: { status: { $regex: /^SUCCESS$/i }, createdAt: { $gte: previousWeekStart, $lt: thisWeekStart } } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);
//     const previousWeekRevenue = previousWeekRevenueAgg[0]?.total || 0;

//     const previousWeekUsers = await User.countDocuments({ createdAt: { $gte: previousWeekStart, $lt: thisWeekStart } });
//     const previousWeekOrders = await Order.countDocuments({ createdAt: { $gte: previousWeekStart, $lt: thisWeekStart } });
//     const previousWeekTransactions = await Transaction.countDocuments({ createdAt: { $gte: previousWeekStart, $lt: thisWeekStart } });

//     const calculateChange = (current, previous) => {
//       if (previous === 0) return current > 0 ? 100 : 0;
//       return (((current - previous) / previous) * 100).toFixed(2);
//     };

//     res.json({
//       totalUsers,
//       totalOrders,
//       totalTransactions,
//       totalRevenue,
//       weeklyRevenueChange: calculateChange(thisWeekRevenue, previousWeekRevenue),
//       weeklyUsersChange: calculateChange(thisWeekUsers, previousWeekUsers),
//       weeklyOrdersChange: calculateChange(thisWeekOrders, previousWeekOrders),
//       weeklyTransactionsChange: calculateChange(thisWeekTransactions, previousWeekTransactions),
//     });
//   } catch (error) {
//     console.error("Admin stats error:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch admin stats" });
//   }
// };

// /* ==============================
//    GET ALL USERS
// ============================== */
// exports.getAllUsers = async (req, res) => {
//   try {
//     const { search = "", page = 1, limit = 10 } = req.query;

//     const query = {
//       email: { $regex: search, $options: "i" }, // case-insensitive search
//     };

//     const total = await User.countDocuments(query);
//     const users = await User.find(query, "email walletBalanceNGN createdAt")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const mappedUsers = users.map((u) => ({
//       _id: u._id,
//       email: u.email,
//       balance: u.walletBalanceNGN,
//       status: "Active", // default if no status field
//       dateJoined: u.createdAt,
//     }));

//     res.json({ data: mappedUsers, total });
//   } catch (error) {
//     console.error("Fetch users error:", error);
//     res.status(500).json({ message: "Failed to fetch users" });
//   }
// };

// /* ==============================
//    GET ALL TRANSACTIONS
// ============================== */
// exports.getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await Transaction.find()
//       .populate("user", "email") // optional: populate user email
//       .sort({ createdAt: -1 });
//     res.json(transactions);
//   } catch (error) {
//     console.error("Fetch transactions error:", error);
//     res.status(500).json({ message: "Failed to fetch transactions" });
//   }
// };

// /* ==============================
//    GET ALL ORDERS
// ============================== */
// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     console.error("Fetch orders error:", error);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };


const User = require("../models/User");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");

/* ==============================
   ADMIN STATS
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
   GET ALL USERS (WITH SEARCH & PAGINATION)
============================== */
exports.getAllUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = { email: { $regex: search, $options: "i" } };

    const total = await User.countDocuments(query);
    const users = await User.find(query, "email walletBalanceNGN createdAt status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const mappedUsers = users.map((u) => ({
      _id: u._id,
      email: u.email,
      balance: u.walletBalanceNGN,
      status: u.status || "Active",
      dateJoined: u.createdAt,
    }));

    res.json({ data: mappedUsers, total });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ==============================
   EDIT USER
============================== */
exports.editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, walletBalanceNGN } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.email = email || user.email;
    user.walletBalanceNGN = walletBalanceNGN ?? user.walletBalanceNGN;

    await user.save();
    res.json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Edit user error:", error);
    res.status(500).json({ success: false, message: "Failed to edit user" });
  }
};

/* ==============================
   BAN / UNBAN USER
============================== */
exports.toggleBanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "Active" ? "Banned" : "Active";

    await user.save();
    res.json({ success: true, message: `User is now ${user.status}`, user });
  } catch (error) {
    console.error("Toggle ban user error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle user ban status" });
  }
};

/* ==============================
   DELETE USER
============================== */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

/* ==============================
   GET ALL TRANSACTIONS
============================== */
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "email")
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
