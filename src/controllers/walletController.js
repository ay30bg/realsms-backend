// const User = require('../models/User');

// // GET wallet balance
// const getWalletBalance = async (req, res, next) => {
//   try {
//     // req.user is set by auth middleware
//     if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

//     res.json({
//       walletBalance: req.user.walletBalance,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // CREDIT wallet (after verified payment)
// const creditWallet = async (req, res, next) => {
//   try {
//     const { amount } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ message: 'Invalid amount' });
//     }

//     req.user.walletBalance += Number(amount);
//     await req.user.save();

//     res.json({
//       message: 'Wallet credited successfully',
//       walletBalance: req.user.walletBalance,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // DEBIT wallet (for purchases)
// const debitWallet = async (req, res, next) => {
//   try {
//     const { amount } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ message: 'Invalid amount' });
//     }

//     if (req.user.walletBalance < amount) {
//       return res.status(400).json({ message: 'Insufficient balance' });
//     }

//     req.user.walletBalance -= Number(amount);
//     await req.user.save();

//     res.json({
//       message: 'Payment successful',
//       walletBalance: req.user.walletBalance,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = {
//   getWalletBalance,
//   creditWallet,
//   debitWallet,
// };


import User from "../models/User.js";

// ================================
// GET WALLET BALANCE
// ================================
export const getWalletBalance = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user._id).select("walletBalanceNGN");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      walletBalanceNGN: user.walletBalanceNGN || 0,
    });
  } catch (err) {
    console.error("Get wallet balance error:", err.message);
    next(err);
  }
};

// ================================
// CREDIT WALLET
// ================================
export const creditWallet = async (req, res, next) => {
  try {
    const parsedAmount = Number(req.body.amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalanceNGN: parsedAmount } }, // ✅ Using walletBalanceNGN
      { new: true }
    );

    res.json({
      message: "Wallet credited successfully",
      walletBalanceNGN: user.walletBalanceNGN,
    });
  } catch (err) {
    console.error("Credit wallet error:", err.message);
    next(err);
  }
};

// ================================
// DEBIT WALLET
// ================================
export const debitWallet = async (req, res, next) => {
  try {
    const parsedAmount = Number(req.body.amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(req.user._id);

    if (user.walletBalanceNGN < parsedAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.walletBalanceNGN -= parsedAmount;
    await user.save();

    res.json({
      message: "Payment successful",
      walletBalanceNGN: user.walletBalanceNGN,
    });
  } catch (err) {
    console.error("Debit wallet error:", err.message);
    next(err);
  }
};
