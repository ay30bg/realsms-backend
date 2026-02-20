const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

exports.getUserTransactionStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          status: "SUCCESS",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const stats = result[0] || {
      totalAmount: 0,
      totalTransactions: 0,
    };

    res.json(stats);
  } catch (err) {
    console.error("Error fetching transaction stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};
