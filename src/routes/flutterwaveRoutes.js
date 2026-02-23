const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
} = require("../controllers/flutterwaveController");
const { protect } = require("../middleware/authMiddleware");

router.post("/init", protect, initializePayment);
router.get("/verify", verifyPayment);

module.exports = router;
