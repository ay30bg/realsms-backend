// // models/User.js
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },

//     // 🔑 Forgot password
//     resetPasswordToken: String,
//     resetPasswordExpire: Date,

//     // 💰 Wallet balance
//     walletBalance: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },

//     // 🔑 Forgot password
//     resetPasswordToken: String,
//     resetPasswordExpire: Date,

//     // 💰 Wallet balance (NAIRA)
//     walletBalanceNGN: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    walletBalanceNGN: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
