// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { authenticateToken, isAdmin } = require("../middleware/auth");

// Import models
const User = require("../models/User");
const Resident = require("../models/Resident");

// Login route
router.post(
  "/login",
  [
    body("username").not().isEmpty().withMessage("Username is required"),
    body("password").not().isEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(400).json({ error: "Invalid username or password" });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid username or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          username: user.username,
          name: user.name,
          role: user.role,
          residentId: user.residentId,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "24h" }
      );

      res.json({
        token,
        user: {
          username: user.username,
          name: user.name,
          role: user.role,
          residentId: user.residentId,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error during login" });
    }
  }
);

// Get current user route
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;

    // Get user details from database (excluding password)
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Change password route
router.post(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .not()
      .isEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const { username } = req.user;

    try {
      // Get user from database
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!validPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Register resident user
router.post(
  "/register",
  [
    body("username").not().isEmpty().withMessage("Username is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("name").not().isEmpty().withMessage("Name is required"),
    body("residentId").not().isEmpty().withMessage("Resident ID is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, name, residentId } = req.body;

    try {
      // Check if username already exists
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if resident exists
      const resident = await Resident.findOne({ residentId });
      if (!resident) {
        return res.status(400).json({ error: "Resident ID not found" });
      }

      // Check if resident already has an account
      const userWithResidentId = await User.findOne({ residentId });
      if (userWithResidentId) {
        return res
          .status(400)
          .json({ error: "Resident already has an account" });
      }

      // Create user in database
      const newUser = new User({
        username,
        password, // will be hashed in the pre-save hook
        name,
        role: "resident",
        residentId,
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          username,
          name,
          role: "resident",
          residentId,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "24h" }
      );

      res.status(201).json({
        token,
        user: {
          username,
          name,
          role: "resident",
          residentId,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  }
);

// Check if resident already has an account
router.get("/check-resident/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resident exists
    const resident = await Resident.findOne({ residentId: id });
    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    // Check if resident already has an account
    const user = await User.findOne({ residentId: id });
    const hasAccount = !!user;

    res.json({ hasAccount });
  } catch (error) {
    console.error("Error checking resident:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create admin user (for initial setup)
router.post(
  "/create-admin",
  [
    body("username").not().isEmpty().withMessage("Username is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("name").not().isEmpty().withMessage("Name is required"),
    body("secretKey")
      .not()
      .isEmpty()
      .withMessage("Secret key is required for admin creation"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, name, secretKey } = req.body;

    // Check if secret key matches (add your own secure implementation)
    if (secretKey !== process.env.ADMIN_CREATION_KEY) {
      return res.status(403).json({ error: "Invalid secret key" });
    }

    try {
      // Check if username already exists
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Create admin user in database
      const newUser = new User({
        username,
        password, // will be hashed in the pre-save hook
        name,
        role: "admin",
      });

      await newUser.save();

      res.status(201).json({
        message: "Admin user created successfully",
      });
    } catch (error) {
      console.error("Admin creation error:", error);
      res.status(500).json({ error: "Server error during admin creation" });
    }
  }
);

module.exports = router;
