const express = require("express");
const router = express.Router();

const {
  getOverviewAnalytics,
  getDailyAnalytics,
  getMonthlyAnalytics,
} = require("../controllers/adminAnalyticsController");

const { protect, adminOnly } = require("../middleware/adminAuthMiddleware");

/**
 * @route   GET /api/admin/analytics/overview
 * @desc    Get total platform overview stats
 */
router.get("/overview", protect, adminOnly, getOverviewAnalytics);

/**
 * @route   GET /api/admin/analytics/daily?days=7
 * @desc    Get daily analytics breakdown
 */
router.get("/daily", protect, adminOnly, getDailyAnalytics);

/**
 * @route   GET /api/admin/analytics/monthly
 * @desc    Get monthly analytics breakdown
 */
router.get("/monthly", protect, adminOnly, getMonthlyAnalytics);

module.exports = router;
