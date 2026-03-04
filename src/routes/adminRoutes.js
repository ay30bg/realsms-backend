// const express = require("express");
// const router = express.Router();
// const { protect, adminOnly } = require("../middleware/adminAuthMiddleware");
// const adminController = require("../controllers/adminController");

// router.get("/stats", protect, adminOnly, adminController.getAdminStats);
// router.get("/users", protect, adminOnly, adminController.getAllUsers);
// router.get("/transactions", protect, adminOnly, adminController.getAllTransactions);
// router.get("/orders", protect, adminOnly, adminController.getAllOrders);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/adminAuthMiddleware");
const adminController = require("../controllers/adminController");

// Admin dashboard stats
router.get("/stats", protect, adminOnly, adminController.getAdminStats);

// Users
router.get("/users", protect, adminOnly, adminController.getAllUsers);
router.put("/users/:userId", protect, adminOnly, adminController.editUser);
router.patch("/users/:userId/ban", protect, adminOnly, adminController.toggleBanUser);
router.delete("/users/:userId", protect, adminOnly, adminController.deleteUser);

// Transactions
router.get("/transactions", protect, adminOnly, adminController.getAllTransactions);

// Orders
router.get("/orders", protect, adminOnly, adminController.getAllOrders);

module.exports = router;
