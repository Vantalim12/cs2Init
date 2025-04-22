// routes/events.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const QRCode = require("qrcode");

// Import model
const Event = require("../models/Event");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1 });

    // Filter out QR code data from response
    const eventsWithoutQR = events.map((event) => {
      const eventObj = event.toObject();
      delete eventObj.qrCode;
      return eventObj;
    });

    res.json(eventsWithoutQR);
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific event
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Filter out QR code data from response
    const eventObj = event.toObject();
    delete eventObj.qrCode;

    res.json(eventObj);
  } catch (error) {
    console.error(`Error getting event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get event QR code
router.get("/:id/qrcode", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // If QR code doesn't exist yet, generate it
    if (!event.qrCode) {
      // Create data for QR code
      const qrData = {
        id: event._id.toString(),
        title: event.title,
        date: event.eventDate,
        location: event.location,
        type: "Event",
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Save QR code to event record
      event.qrCode = qrCodeDataUrl;
      await event.save();
    }

    res.json({ qrCode: event.qrCode });
  } catch (error) {
    console.error(`Error getting event QR code ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new event (admin only)
router.post(
  "/",
  isAdmin,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    body("eventDate").isISO8601().withMessage("Valid event date is required"),
    body("location").not().isEmpty().withMessage("Location is required"),
    body("category").not().isEmpty().withMessage("Category is required"),
    body("time").not().isEmpty().withMessage("Time is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, eventDate, location, category, time } =
        req.body;

      // Create new event
      const newEvent = new Event({
        title,
        description,
        eventDate,
        location,
        category,
        time,
        createdDate: new Date(),
        attendees: [],
      });

      // Save event
      await newEvent.save();

      // Generate QR code for event registration
      const qrData = {
        id: newEvent._id.toString(),
        title,
        date: eventDate,
        location,
        type: "Event",
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Save QR code to event record
      newEvent.qrCode = qrCodeDataUrl;
      await newEvent.save();

      // Filter out QR code data from response
      const eventObj = newEvent.toObject();
      delete eventObj.qrCode;

      res.status(201).json(eventObj);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update an event (admin only)
router.put(
  "/:id",
  isAdmin,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    body("eventDate").isISO8601().withMessage("Valid event date is required"),
    body("location").not().isEmpty().withMessage("Location is required"),
    body("category").not().isEmpty().withMessage("Category is required"),
    body("time").optional(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { title, description, eventDate, location, category, time } =
        req.body;

      // Check if event exists
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Update event
      const updatedEvent = await Event.findByIdAndUpdate(
        id,
        {
          title,
          description,
          eventDate,
          location,
          category,
          time: time || event.time,
        },
        { new: true }
      );

      // If significant event details changed, regenerate QR code
      if (
        title !== event.title ||
        eventDate !== event.eventDate.toISOString() ||
        location !== event.location
      ) {
        const qrData = {
          id: updatedEvent._id.toString(),
          title,
          date: eventDate,
          location,
          type: "Event",
        };

        // Generate new QR code
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

        // Save new QR code
        updatedEvent.qrCode = qrCodeDataUrl;
        await updatedEvent.save();
      }

      // Filter out QR code data from response
      const eventObj = updatedEvent.toObject();
      delete eventObj.qrCode;

      res.json(eventObj);
    } catch (error) {
      console.error(`Error updating event ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Register for an event
router.post(
  "/:id/register",
  [body("attendee").isObject().withMessage("Attendee information is required")],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { attendee } = req.body;

      // Validate required attendee fields
      if (!attendee.id || !attendee.name) {
        return res
          .status(400)
          .json({ error: "Attendee ID and name are required" });
      }

      // Check if event exists
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if attendee is already registered
      const isRegistered = event.attendees.some((a) => a.id === attendee.id);
      if (isRegistered) {
        return res
          .status(400)
          .json({ error: "Attendee already registered for this event" });
      }

      // Add the new attendee
      event.attendees.push(attendee);
      await event.save();

      res
        .status(200)
        .json({
          message: "Registration successful",
          attendees: event.attendees,
        });
    } catch (error) {
      console.error(`Error registering for event ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Unregister from an event
router.delete("/:id/register/:attendeeId", async (req, res) => {
  try {
    const { id, attendeeId } = req.params;

    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is authorized to unregister
    if (req.user.role !== "admin" && req.user.residentId !== attendeeId) {
      return res
        .status(403)
        .json({ error: "Not authorized to unregister this attendee" });
    }

    // Find attendee index
    const attendeeIndex = event.attendees.findIndex((a) => a.id === attendeeId);
    if (attendeeIndex === -1) {
      return res
        .status(404)
        .json({ error: "Attendee not registered for this event" });
    }

    // Remove the attendee
    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    res
      .status(200)
      .json({
        message: "Unregistration successful",
        attendees: event.attendees,
      });
  } catch (error) {
    console.error(`Error unregistering from event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete an event (admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Delete event
    await Event.findByIdAndDelete(id);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(`Error deleting event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
