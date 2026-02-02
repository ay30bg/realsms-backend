import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper: create JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ REGISTER
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created",
      user: { id: user._id, email: user.email, firstName: user.firstName },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid password" });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user._id, email: user.email, firstName: user.firstName },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET CURRENT USER (Protected Route)
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ success: true, user });
};
