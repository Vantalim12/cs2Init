// routes/announcements.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken, isAdmin } = require("../middleware/auth");

// Import model
const Announcement = require("../models/Announcement");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.json(announcements);
  } catch (error) {
    console.error("Error getting announcements:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific announcement
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json(announcement);
  } catch (error) {
    console.error(`Error getting announcement ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new announcement (admin only)
router.post(
  "/",
  isAdmin,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("category").not().isEmpty().withMessage("Category is required"),
    body("type").not().isEmpty().withMessage("Type is required"),
    body("content").not().isEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, category, type, content } = req.body;

      // Create new announcement
      const newAnnouncement = new Announcement({
        title,
        category,
        type,
        content,
        date: new Date(),
      });

      // Save announcement
      await newAnnouncement.save();

      res.status(201).json(newAnnouncement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update an announcement (admin only)
router.put(
  "/:id",
  isAdmin,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("category").not().isEmpty().withMessage("Category is required"),
    body("type").not().isEmpty().withMessage("Type is required"),
    body("content").not().isEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { title, category, type, content } = req.body;

      // Check if announcement exists
      const announcement = await Announcement.findById(id);
      if (!announcement) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      // Update announcement
      const updatedAnnouncement = await Announcement.findByIdAndUpdate(
        id,
        {
          title,
          category,
          type,
          content,
        },
        { new: true }
      );

      res.json(updatedAnnouncement);
    } catch (error) {
      console.error(`Error updating announcement ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete an announcement (admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if announcement exists
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    // Delete announcement
    await Announcement.findByIdAndDelete(id);

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error(`Error deleting announcement ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
