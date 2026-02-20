// const mongoose = require("mongoose");
// // const Transaction = require("../models/Transaction");

// // // Get total deposits and total transactions for a user
// // exports.getUserTransactionStats = async (req, res) => {
// //   try {
// //     const { userId } = req.params;

// //     // Aggregate deposits and count transactions
// //     const result = await Transaction.aggregate([
// //       { $match: { user: mongoose.Types.ObjectId(userId), status: "SUCCESS" } },
// //       {
// //         $group: {
// //           _id: null,
// //           totalAmount: { $sum: "$amount" },
// //           totalTransactions: { $sum: 1 },
// //         },
// //       },
// //     ]);

// //     const stats = result[0] || { totalAmount: 0, totalTransactions: 0 };

// //     res.json({
// //       totalAmount: stats.totalAmount,
// //       totalTransactions: stats.totalTransactions,
// //     });
// //   } catch (err) {
// //     console.error("Error fetching transaction stats:", err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // };

// const mongoose = require("mongoose");
// const Transaction = require("../models/Transaction");

// exports.getUserTransactionStats = async (req, res) => {
//   try {
//     const userId = req.user._id; // from auth middleware

//     const result = await Transaction.aggregate([
//       {
//         $match: {
//           user: mongoose.Types.ObjectId(userId),
//           status: "SUCCESS", // make sure your DB matches this case
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//           totalTransactions: { $sum: 1 },
//         },
//       },
//     ]);

//     const stats = result[0] || { totalAmount: 0, totalTransactions: 0 };

//     res.json(stats);
//   } catch (err) {
//     console.error("Error fetching transaction stats:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };


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
