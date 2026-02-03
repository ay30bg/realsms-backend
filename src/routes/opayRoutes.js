import express from "express";
import { initOpayPayment, opayWebhook } from "../controllers/opayController.js";

const router = express.Router();

router.post("/init", initOpayPayment);
router.post("/webhook", opayWebhook);

export default router;
