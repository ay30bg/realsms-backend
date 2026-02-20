const express = require("express");
const router = express.Router();
const { getUserTransactionStats } = require("../controllers/transactionController");

// GET /api/transactions/stats/:userId
// router.get("/stats/:userId", getUserTransactionStats);
router.get("/stats", getUserTransactionStats);

module.exports = router;
