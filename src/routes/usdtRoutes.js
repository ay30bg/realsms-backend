// routes/usdtRoutes.js
const express = require('express');
const { initUSDTPayment, usdtWebhook } = require('../controllers/usdtController');

const router = express.Router();

// POST /api/usdt/init
router.post('/init', initUSDTPayment);

// POST /api/usdt/webhook
router.post('/webhook', usdtWebhook);

module.exports = router; // ✅ make sure to export router
