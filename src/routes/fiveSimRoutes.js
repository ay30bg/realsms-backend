const express = require("express");
const { buyNumber, checkOtp } = require("../controllers/fiveSimController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/buy-number", protect, buyNumber);
router.post("/check-otp", protect, checkOtp);

module.exports = router;
