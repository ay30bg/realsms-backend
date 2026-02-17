// routes/fiveSimRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/fiveSimController");

router.post("/buy-number", auth, controller.buyNumber);
router.post("/check-otp", auth, controller.checkOtp);
router.post("/cancel", auth, controller.cancelOrder);

module.exports = router;
