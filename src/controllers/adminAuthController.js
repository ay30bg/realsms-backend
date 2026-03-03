const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Admin login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin user
    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Password check (replace with bcrypt if hashed)
    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Sign JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
