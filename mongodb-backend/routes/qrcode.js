// mongodb-backend/routes/qrcode.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const QRCode = require("qrcode");

// Import models
const Resident = require("../models/Resident");
const FamilyHead = require("../models/FamilyHead");
const Event = require("../models/Event");
const DocumentRequest = require("../models/DocumentRequest");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Generate QR code for any data
router.post(
  "/generate",
  [
    body("data")
      .not()
      .isEmpty()
      .withMessage("Data is required for QR code generation"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { data } = req.body;

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data));

      res.json({ qrCode: qrCodeDataUrl });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Verify any QR code (resident, family head, event, document)
router.post(
  "/verify",
  [body("scannedData").not().isEmpty().withMessage("Scanned data is required")],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { scannedData } = req.body;
      console.log("Verifying QR code data:", scannedData);

      // Parse scanned data if it's a string
      let parsedData;
      try {
        parsedData =
          typeof scannedData === "string"
            ? JSON.parse(scannedData)
            : scannedData;
      } catch (parseError) {
        console.error("Error parsing QR code data:", parseError);
        return res.status(400).json({ error: "Invalid QR code format" });
      }

      // Determine QR code type and verify accordingly
      if (!parsedData.type) {
        return res
          .status(400)
          .json({ error: "Invalid QR code format: missing type" });
      }

      let verified = false;
      let data = null;

      switch (parsedData.type) {
        case "Resident": {
          // Verify resident QR code
          const resident = await Resident.findOne({
            residentId: parsedData.id,
          });
          verified = !!resident;
          if (verified) {
            data = {
              id: resident.residentId,
              name: `${resident.firstName} ${resident.lastName}`,
              type: "Resident",
              gender: resident.gender,
              address: resident.address,
              contactNumber: resident.contactNumber,
            };
          }
          break;
        }

        case "Family Head": {
          // Verify family head QR code
          const familyHead = await FamilyHead.findOne({
            headId: parsedData.id,
          });
          verified = !!familyHead;
          if (verified) {
            data = {
              id: familyHead.headId,
              name: `${familyHead.firstName} ${familyHead.lastName}`,
              type: "Family Head",
              gender: familyHead.gender,
              address: familyHead.address,
              contactNumber: familyHead.contactNumber,
            };
          }
          break;
        }

        case "Event": {
          // Verify event QR code
          const event = await Event.findById(parsedData.id);
          verified = !!event;
          if (verified) {
            data = {
              id: event._id.toString(),
              title: event.title,
              date: event.eventDate,
              location: event.location,
              type: "Event",
              category: event.category,
              attendees: event.attendees?.length || 0,
            };
          }
          break;
        }

        case "DocumentRequest": {
          // Verify document request QR code
          const docRequest = await DocumentRequest.findOne({
            requestId: parsedData.requestId,
          });
          verified =
            !!docRequest &&
            ["approved", "completed"].includes(docRequest.status);
          if (verified) {
            data = {
              requestId: docRequest.requestId,
              residentId: docRequest.residentId,
              residentName: docRequest.residentName,
              documentType: docRequest.documentType,
              status: docRequest.status,
              date: docRequest.requestDate,
              type: "DocumentRequest",
            };
          }
          break;
        }

        default:
          return res.status(400).json({ error: "Unknown QR code type" });
      }

      if (!verified) {
        console.log(
          `Verification failed: ${parsedData.type} with ID ${
            parsedData.id || parsedData.requestId
          } not found`
        );
        res.status(404).json({
          verified: false,
          message: `${parsedData.type} not found or not valid`,
        });
      } else {
        console.log("Verification successful:", data);
        res.json({
          verified: true,
          data,
          type: parsedData.type,
        });
      }
    } catch (error) {
      console.error("Error verifying QR code:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
