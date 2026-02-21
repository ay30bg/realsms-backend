const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    service: {
      type: String,
      required: true,
    },

    // UPDATED COUNTRY STRUCTURE
    country: {
      id: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
    },

    orderid: {
      type: String,
      required: true,
      unique: true,
    },

    number: {
      type: String,
      required: true,
    },

    baseCost: {
      type: Number,
      required: true,
    },

    priceCharged: {
      type: Number,
      required: true,
    },

    profit: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["waiting", "received", "refunded", "cancelled"],
      default: "waiting",
    },

    otp: {
      type: String,
    },

    refunded: {
      type: Boolean,
      default: false,
    },

    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
