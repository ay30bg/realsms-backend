const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Order = require("../models/Order");

exports.getWeeklyStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1️⃣ Users aggregation
    const usersAgg = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          newUsers: { $sum: 1 },
        },
      },
    ]);

    // 2️⃣ Transactions aggregation
    const transactionsAgg = await Transaction.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          transactions: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
    ]);

    // 3️⃣ Orders aggregation
    const ordersAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          orders: { $sum: 1 },
        },
      },
    ]);

    // Create date map
    const statsMap = {};

    // Initialize all days with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const formatted = date.toISOString().split("T")[0];

      statsMap[formatted] = {
        date: formatted,
        newUsers: 0,
        transactions: 0,
        orders: 0,
        revenue: 0,
      };
    }

    // Merge users
    usersAgg.forEach((item) => {
      if (statsMap[item._id]) {
        statsMap[item._id].newUsers = item.newUsers;
      }
    });

    // Merge transactions
    transactionsAgg.forEach((item) => {
      if (statsMap[item._id]) {
        statsMap[item._id].transactions = item.transactions;
        statsMap[item._id].revenue = item.revenue;
      }
    });

    // Merge orders
    ordersAgg.forEach((item) => {
      if (statsMap[item._id]) {
        statsMap[item._id].orders = item.orders;
      }
    });

    const finalStats = Object.values(statsMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.json(finalStats);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
