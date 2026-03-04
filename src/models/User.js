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

    // ✅ ADD THIS
    status: {
      type: String,
      enum: ["Active", "Banned"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

