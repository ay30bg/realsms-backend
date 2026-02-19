const express = require("express");
const router = express.Router();
const {
  getServers,
  getServices,
  buyNumber,
  getOtp,
} = require("../controllers/smsController");
const { protect } = require("../middleware/authMiddleware");

// ---------------- ROUTES ----------------

// Get all countries/servers
router.get("/servers", protect, getServers);

// Get all services (no serverId needed)
router.get("/services", protect, getServices);

// Buy number
router.post("/buy", protect, buyNumber);

// Get OTP for a purchased number (POST with body)
router.post("/otp", protect, getOtp);

module.exports = router;

