// const express = require("express");
// const router = express.Router();
// const { getAdminStats } = require("../controllers/adminController");
// const { protect, adminOnly } = require("../middleware/adminAuthMiddleware");

// router.get("/stats", protect, adminOnly, getAdminStats);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/adminAuthMiddleware");
const adminController = require("../controllers/adminController");

router.get("/stats", protect, adminOnly, adminController.getAdminStats);
router.get("/users", protect, adminOnly, adminController.getAllUsers);
router.get("/transactions", protect, adminOnly, adminController.getAllTransactions);
router.get("/orders", protect, adminOnly, adminController.getAllOrders);

module.exports = router;
