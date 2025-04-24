// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in database (optional, for extra security)
    const user = await User.findOne({ username: decoded.username });
    if (!user) {
      return res.status(403).json({ error: "Invalid token." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token." });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ error: "Access denied. Admin rights required." });
  }
};

// Middleware to check if user is a resident and owns the requested resource
const isResidentOwner = (req, res, next) => {
  if (req.user && req.user.role === "resident") {
    // If the request contains a residentId parameter, check that it matches the user's residentId
    if (req.params.id && req.user.residentId !== req.params.id) {
      return res.status(403).json({
        error: "Access denied. You can only access your own information.",
      });
    }
    next();
  } else {
    next(); // Admin can access all
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  isResidentOwner,
};
