// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select("-password");
//       next();
//     } catch (err) {
//       console.error(err);
//       res.status(401).json({ success: false, message: "Not authorized" });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ success: false, message: "No token provided" });
//   }
// };


// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      req.user = user; // ✅ user is available in controllers
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
  } else {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
};

