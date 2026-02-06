// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   reference: { type: String, required: true, unique: true },
//   amount: { type: Number, required: true },
//   status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
//   provider: { type: String, default: "OPAY" },
// }, { timestamps: true });

// export default mongoose.model("Transaction", transactionSchema);

import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // NowPayments invoice ID or payment reference
    reference: {
      type: String,
      required: true,
      unique: true,
    },

    // 💵 Amount user paid in USDT
    usdtAmount: {
      type: Number,
      required: true,
    },

    // 💱 Exchange rate used (e.g. 1500)
    exchangeRate: {
      type: Number,
      required: true,
    },

    // 🇳🇬 Final credited amount in Naira
    ngnAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    provider: {
      type: String,
      default: "NOWPAYMENTS",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
