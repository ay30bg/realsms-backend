const User = require("../models/User");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");

exports.getAdminStats = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    // Total Revenue
    const revenueResult = await Transaction.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      totalUsers,
      totalOrders,
      totalTransactions,
      totalRevenue,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};
