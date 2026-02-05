import express from "express";
import {
  getWalletBalance,
  creditWallet,
  debitWallet,
} from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/balance", protect, getWalletBalance);
router.post("/credit", protect, creditWallet);
router.post("/debit", protect, debitWallet);

export default router;
