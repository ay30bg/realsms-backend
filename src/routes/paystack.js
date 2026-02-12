import express from "express";
import { initPaystackPayment, paystackWebhook } from "../controllers/paystackController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/paystack/init
router.post("/init", authMiddleware, initPaystackPayment);

// POST /api/paystack/webhook
router.post("/webhook", express.json(), paystackWebhook);

export default router;
