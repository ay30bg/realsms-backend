// routes/opayRoutes.js
const express = require("express");
const { initOpayPayment, opayWebhook } = require("../controllers/opayController");

const router = express.Router();

router.post("/init", initOpayPayment);
router.post("/webhook", opayWebhook);

module.exports = router; // ✅ must use module.exports
