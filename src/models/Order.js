// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     service: String,
//     country: String,
//     orderid: String,
//     number: String,
//     baseCost: Number,
//     priceCharged: Number,
//     profit: Number,
//     status: {
//       type: String,
//       enum: ["waiting", "received", "cancelled"],
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

    service: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
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
      enum: ["waiting", "received", "refunded"],
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
