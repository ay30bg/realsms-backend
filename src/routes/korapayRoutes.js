const express = require("express");
const router = express.Router();
const { initializePayment, verifyPayment } = require("../controllers/korapayController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/korapay/init
router.post("/init", protect, initializePayment);

// // GET /api/korapay/verify?reference=...
// router.get("/verify", protect, verifyPayment);

module.exports = router;
