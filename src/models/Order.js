const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    service: String,
    country: String,
    orderid: String,
    number: String,
    price: Number,
    status: {
      type: String,
      enum: ["waiting", "received", "expired"],
      default: "waiting",
    },
    otp: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
