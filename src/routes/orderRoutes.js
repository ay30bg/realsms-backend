const express = require("express");
const router = express.Router();
const { buyNumber, getOtp } = require("../controllers/orderController");

router.post("/buy", buyNumber);
router.post("/otp", getOtp);

module.exports = router;
