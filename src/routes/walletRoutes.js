const express = require('express');
const router = express.Router();
const {
  getWalletBalance,
  creditWallet,
  debitWallet,
} = require('../controllers/walletController');

const { protect } = require('../middleware/authMiddleware');

// GET balance
router.get('/balance', protect, getWalletBalance);

// CREDIT wallet (after payment verified)
router.post('/credit', protect, creditWallet);

// DEBIT wallet (for purchases)
router.post('/debit', protect, debitWallet);

module.exports = router;
