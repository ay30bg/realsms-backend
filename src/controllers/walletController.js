import User from "../models/User.js";

// GET wallet balance
export const getWalletBalance = async (req, res) => {
  res.json({
    walletBalance: req.user.walletBalance,
  });
};

// CREDIT wallet (after verified payment)
export const creditWallet = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  req.user.walletBalance += Number(amount);
  await req.user.save();

  res.json({
    message: "Wallet credited successfully",
    walletBalance: req.user.walletBalance,
  });
};

// DEBIT wallet (purchase)
export const debitWallet = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  if (req.user.walletBalance < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  req.user.walletBalance -= Number(amount);
  await req.user.save();

  res.json({
    message: "Payment successful",
    walletBalance: req.user.walletBalance,
  });
};
