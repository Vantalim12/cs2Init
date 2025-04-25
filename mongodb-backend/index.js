// mongodb-backend/index.js - Main server file
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth");
const residentRoutes = require("./routes/residents");
const familyHeadRoutes = require("./routes/familyHeads");
const dashboardRoutes = require("./routes/dashboard");
const announcementRoutes = require("./routes/announcements");
const eventRoutes = require("./routes/events");
const documentRoutes = require("./routes/documents");
const qrcodeRoutes = require("./routes/qrcode");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/familyHeads", familyHeadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/qrcode", qrcodeRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Barangay Management System API" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
