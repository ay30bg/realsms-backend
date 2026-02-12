// src/routes/paystack.js
const express = require("express");
const router = express.Router();

// Import controllers (CommonJS style)
const {
  initPaystackPayment,
  paystackWebhook,
} = require("../controllers/paystackController");

// Auth middleware (CommonJS style)
const { authMiddleware } = require("../middleware/authMiddleware");

// -----------------------------
// Initialize Paystack payment (protected route)
// -----------------------------
router.post("/init", authMiddleware, initPaystackPayment);

// -----------------------------
// Paystack webhook (no auth)
// -----------------------------
router.post("/webhook", express.raw({ type: "*/*" }), paystackWebhook);

module.exports = router;
