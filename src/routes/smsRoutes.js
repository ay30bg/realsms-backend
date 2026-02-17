const express = require("express");
const { getServices, buyNumber, getOtp } = require("../controllers/smsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require auth
router.get("/services/:serverId", protect, getServices);
router.post("/buy", protect, buyNumber);
router.get("/otp/:number", protect, getOtp);

module.exports = router;
