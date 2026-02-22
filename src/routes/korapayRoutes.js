const express = require("express");
const router = express.Router();
const { initKorapayCharge } = require("../controllers/korapayController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/korapay/init
router.post("/init", protect, initKorapayCharge);

module.exports = router;
