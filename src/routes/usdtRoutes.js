import express from "express";
import { initUSDTPayment, usdtWebhook } from "../controllers/usdtController.js";

const router = express.Router();

// Initialize payment
router.post("/init", initUSDTPayment);

// Webhook for NowPayments
router.post("/webhook", usdtWebhook);

export default router;
