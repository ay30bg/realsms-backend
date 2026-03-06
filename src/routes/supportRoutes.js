const express = require("express");
const router = express.Router();

const {
  sendMessage,
  adminReply,
  getUserMessages,
  getAdminMessages,
} = require("../controllers/supportController");

const { protect, adminOnly } = require("../middleware/adminAuthMiddleware");
// const { protectUser } = require("../middleware/authMiddleware");


// user send message
router.post("/send", protect, sendMessage);

// user fetch messages
router.get("/user", protect, getUserMessages);

// admin fetch all chats
router.get("/admin", protect, adminOnly, getAdminMessages);

// admin reply
router.post("/reply", protect, adminOnly, adminReply);

module.exports = router;
