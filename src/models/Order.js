// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     service: String,
//     country: String,
//     orderid: String,
//     number: String,
//     price: Number,
//     status: {
//       type: String,
//       enum: ["waiting", "received", "expired"],
//       default: "waiting",
//     },
//     otp: String,
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: String,
    country: String,
    orderid: String,
    number: String,
    baseCost: Number,
    priceCharged: Number,
    profit: Number,
    status: {
      type: String,
      enum: ["waiting", "received", "cancelled"],
      default: "waiting",
    },
    otp: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
