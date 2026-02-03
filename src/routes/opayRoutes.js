// // routes/opayRoutes.js
// const express = require("express");
// const { initOpayPayment, opayWebhook } = require("../controllers/opayController");

// const router = express.Router();

// router.post("/init", initOpayPayment);
// router.post("/webhook", opayWebhook);

// module.exports = router; // ✅ must use module.exports

// routes/opayRoutes.js
const express = require("express");
const { initOpayPayment, opayWebhook } = require("../controllers/opayController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected route — user must be logged in
router.post("/init", protect, initOpayPayment);

// Webhook from Opay does NOT require auth
router.post("/webhook", opayWebhook);

module.exports = router;
