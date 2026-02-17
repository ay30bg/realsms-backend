const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  service: Object,
  number: String,
  otp: String,
  status: { type: String, enum: ["waiting", "received", "expired"], default: "waiting" },
  price: Number,
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
