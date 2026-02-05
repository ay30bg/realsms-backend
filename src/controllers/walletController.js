const User = require('../models/User');

// GET wallet balance
const getWalletBalance = async (req, res, next) => {
  try {
    // req.user is set by auth middleware
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    res.json({
      walletBalance: req.user.walletBalance,
    });
  } catch (err) {
    next(err);
  }
};

// CREDIT wallet (after verified payment)
const creditWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    req.user.walletBalance += Number(amount);
    await req.user.save();

    res.json({
      message: 'Wallet credited successfully',
      walletBalance: req.user.walletBalance,
    });
  } catch (err) {
    next(err);
  }
};

// DEBIT wallet (for purchases)
const debitWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (req.user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    req.user.walletBalance -= Number(amount);
    await req.user.save();

    res.json({
      message: 'Payment successful',
      walletBalance: req.user.walletBalance,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWalletBalance,
  creditWallet,
  debitWallet,
};
