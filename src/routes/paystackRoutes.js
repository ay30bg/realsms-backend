const express = require("express");
const {
  initializePayment,
  verifyPayment,
} = require("../controllers/paystackController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/init", protect, initializePayment);
router.get("/verify", verifyPayment);

module.exports = router;
