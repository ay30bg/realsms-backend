const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Order = require("../models/Order");

exports.getWeeklyStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    const stats = [];

    for (let i = 0; i < days; i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(startDate.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const newUsers = await User.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      const transactions = await Transaction.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: "completed",
      });

      const orders = await Order.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      const revenue = transactions.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );

      stats.push({
        date: dayStart.toISOString().split("T")[0],
        newUsers,
        transactions: transactions.length,
        orders,
        revenue,
      });
    }

    res.json(stats);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
