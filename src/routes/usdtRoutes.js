const express = require("express");
const { initUSDTPayment, usdtWebhook } = require("../controllers/usdtController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/init", protect, initUSDTPayment);
router.post("/webhook", usdtWebhook);

module.exports = router;
