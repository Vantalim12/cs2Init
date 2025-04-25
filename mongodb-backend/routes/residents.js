// mongodb-backend/routes/residents.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  authenticateToken,
  isAdmin,
  isResidentOwner,
} = require("../middleware/auth");
const QRCode = require("qrcode");

// Import models
const Resident = require("../models/Resident");
const FamilyHead = require("../models/FamilyHead");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Helper function to generate a unique resident ID
const generateResidentId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Resident.countDocuments();
  return `R-${currentYear}${(count + 1).toString().padStart(3, "0")}`;
};

// Get all residents (admin only)
router.get("/", isAdmin, async (req, res) => {
  try {
    const residents = await Resident.find({}, "-qrCode");
    res.json(residents);
  } catch (error) {
    console.error("Error getting residents:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get resident by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await Resident.findOne({ residentId: id }, "-qrCode");

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    // Check if user is authorized to view this resident
    if (req.user.role !== "admin" && req.user.residentId !== id) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this resident" });
    }

    res.json(resident);
  } catch (error) {
    console.error(`Error getting resident ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get resident QR code
router.get("/:id/qrcode", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authorized to access this QR code
    if (req.user.role !== "admin" && req.user.residentId !== id) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this QR code" });
    }

    const resident = await Resident.findOne({ residentId: id });

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    // If QR code doesn't exist yet, generate it
    if (!resident.qrCode) {
      // Create data for QR code (resident's basic info)
      const qrData = {
        id: resident.residentId,
        name: `${resident.firstName} ${resident.lastName}`,
        type: "Resident",
        verified: true,
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Save QR code to resident record
      resident.qrCode = qrCodeDataUrl;
      await resident.save();
    }

    res.json({ qrCode: resident.qrCode });
  } catch (error) {
    console.error(`Error getting resident QR code ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new resident (admin only)
router.post(
  "/",
  isAdmin,
  [
    body("firstName")
      .not()
      .isEmpty()
      .trim()
      .withMessage("First name is required"),
    body("lastName")
      .not()
      .isEmpty()
      .trim()
      .withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").not().isEmpty().withMessage("Birth date is required"),
    body("address").not().isEmpty().trim().withMessage("Address is required"),
    body("contactNumber").optional().trim(),
    body("familyHeadId").optional(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors
          .array()
          .map((err) => err.msg)
          .join(", "),
        errors: errors.array(),
      });
    }

    try {
      console.log("Creating resident with data:", req.body);

      // Check if family head exists if provided
      if (req.body.familyHeadId) {
        const familyHead = await FamilyHead.findOne({
          headId: req.body.familyHeadId,
        });
        if (!familyHead) {
          return res.status(400).json({ error: "Family head does not exist" });
        }

        // If family head exists, use their address
        req.body.address = familyHead.address;
      }

      // Generate unique resident ID
      const residentId = await generateResidentId();
      console.log("Generated resident ID:", residentId);

      // Create new resident
      const newResident = new Resident({
        residentId,
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        gender: req.body.gender,
        birthDate: new Date(req.body.birthDate),
        address: req.body.address.trim(),
        contactNumber: req.body.contactNumber?.trim() || "",
        familyHeadId: req.body.familyHeadId || null,
        registrationDate: new Date(),
        type: "Resident",
      });

      // Save resident
      await newResident.save();

      // Generate QR code
      const qrData = {
        id: residentId,
        name: `${req.body.firstName} ${req.body.lastName}`,
        type: "Resident",
        verified: true,
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Save QR code to resident record
      newResident.qrCode = qrCodeDataUrl;
      await newResident.save();

      // Return resident without QR code in response
      const residentResponse = newResident.toObject();
      delete residentResponse.qrCode;

      res.status(201).json(residentResponse);
    } catch (error) {
      console.error("Error creating resident:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update resident
router.put(
  "/:id",
  [
    body("firstName").not().isEmpty().withMessage("First name is required"),
    body("lastName").not().isEmpty().withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").isDate().withMessage("Valid birth date is required"),
    body("address").not().isEmpty().withMessage("Address is required"),
    body("contactNumber").optional(),
    body("familyHeadId").optional(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;

      // Check if resident exists
      const resident = await Resident.findOne({ residentId: id });
      if (!resident) {
        return res.status(404).json({ error: "Resident not found" });
      }

      // Verify authorization
      if (req.user.role !== "admin" && req.user.residentId !== id) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this resident" });
      }

      // If family head changed, update related data
      if (resident.familyHeadId !== req.body.familyHeadId) {
        // If new family head specified, get their info and use their address
        if (req.body.familyHeadId) {
          const familyHead = await FamilyHead.findOne({
            headId: req.body.familyHeadId,
          });
          if (!familyHead) {
            return res
              .status(400)
              .json({ error: "Family head does not exist" });
          }
          // Use family head's address
          req.body.address = familyHead.address;
        }
      }

      // Update resident
      const updatedResident = await Resident.findOneAndUpdate(
        { residentId: id },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          gender: req.body.gender,
          birthDate: req.body.birthDate,
          address: req.body.address,
          contactNumber: req.body.contactNumber || "",
          familyHeadId: req.body.familyHeadId || "",
        },
        { new: true, projection: "-qrCode" }
      );

      res.json(updatedResident);
    } catch (error) {
      console.error(`Error updating resident ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete resident (admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resident exists
    const resident = await Resident.findOne({ residentId: id });
    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    // Delete resident
    await Resident.deleteOne({ residentId: id });

    res.json({ message: "Resident deleted successfully" });
  } catch (error) {
    console.error(`Error deleting resident ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
