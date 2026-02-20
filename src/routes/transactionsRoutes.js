// const express = require("express");
// const router = express.Router();
// const { getUserTransactionStats } = require("../controllers/transactionController");

// // GET /api/transactions/stats/:userId
// router.get("/stats/:userId", getUserTransactionStats);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { getUserTransactionStats } = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/transactions/stats - get stats for logged-in user
router.get("/stats", protect, getUserTransactionStats);

module.exports = router;
