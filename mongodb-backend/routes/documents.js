// routes/documents.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const QRCode = require("qrcode");

// Import models
const DocumentRequest = require("../models/DocumentRequest");
const Resident = require("../models/Resident");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Helper function to generate a unique request ID
const generateRequestId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await DocumentRequest.countDocuments();
  return `REQ-${currentYear}${(count + 1).toString().padStart(3, "0")}`;
};

// Get all document requests (admin access or filtered by role)
router.get("/", async (req, res) => {
  try {
    let query = {};

    // If user is a resident, only show their requests
    if (req.user.role === "resident") {
      query.residentId = req.user.residentId;
    }

    const documentRequests = await DocumentRequest.find(query)
      .sort({ requestDate: -1 })
      .select("-qrCode");

    res.json(documentRequests);
  } catch (error) {
    console.error("Error getting document requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get document requests for a specific resident
router.get("/resident/:residentId", async (req, res) => {
  try {
    const { residentId } = req.params;

    // Verify permission - only admin or the resident themselves can access
    if (req.user.role !== "admin" && req.user.residentId !== residentId) {
      return res
        .status(403)
        .json({ error: "Not authorized to access these requests" });
    }

    const requests = await DocumentRequest.find({ residentId })
      .sort({ requestDate: -1 })
      .select("-qrCode");

    res.json(requests);
  } catch (error) {
    console.error(
      `Error getting document requests for resident ${req.params.residentId}:`,
      error
    );
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific document request
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const request = await DocumentRequest.findById(id).select("-qrCode");

    if (!request) {
      return res.status(404).json({ error: "Document request not found" });
    }

    // Verify permission - only admin or the resident themselves can access
    if (
      req.user.role !== "admin" &&
      req.user.residentId !== request.residentId
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this request" });
    }

    res.json(request);
  } catch (error) {
    console.error(`Error getting document request ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get document request QR code
router.get("/:id/qrcode", async (req, res) => {
  try {
    const { id } = req.params;
    const request = await DocumentRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Document request not found" });
    }

    // Verify permission - only admin or the resident themselves can access
    if (
      req.user.role !== "admin" &&
      req.user.residentId !== request.residentId
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this QR code" });
    }

    // If QR code doesn't exist yet and request is approved/completed, generate it
    if (!request.qrCode && ["approved", "completed"].includes(request.status)) {
      // Create data for QR code
      const qrData = {
        requestId: request.requestId,
        residentId: request.residentId,
        residentName: request.residentName,
        documentType: request.documentType,
        status: request.status,
        date: request.requestDate,
        type: "DocumentRequest",
        verified: true,
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Save QR code to request record
      request.qrCode = qrCodeDataUrl;
      await request.save();
    }

    if (!request.qrCode) {
      return res.status(400).json({
        error:
          "QR code is only available for approved or completed document requests",
      });
    }

    res.json({ qrCode: request.qrCode });
  } catch (error) {
    console.error(
      `Error getting document request QR code ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new document request
router.post(
  "/",
  [
    body("residentId").not().isEmpty().withMessage("Resident ID is required"),
    body("documentType")
      .not()
      .isEmpty()
      .withMessage("Document type is required"),
    body("purpose").not().isEmpty().withMessage("Purpose is required"),
    body("deliveryOption")
      .not()
      .isEmpty()
      .withMessage("Delivery option is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if the user is requesting for themselves or admin is requesting for someone
      if (
        req.user.role !== "admin" &&
        req.user.residentId !== req.body.residentId
      ) {
        return res
          .status(403)
          .json({ error: "You can only create requests for yourself" });
      }

      // Generate unique request ID
      const requestId = await generateRequestId();

      // Get resident details for the name
      const resident = await Resident.findOne({
        residentId: req.body.residentId,
      });

      if (!resident) {
        return res.status(404).json({ error: "Resident not found" });
      }

      const residentName = `${resident.firstName} ${resident.lastName}`;

      // Create new document request
      const newRequest = new DocumentRequest({
        requestId,
        residentId: req.body.residentId,
        residentName,
        documentType: req.body.documentType,
        purpose: req.body.purpose,
        additionalDetails: req.body.additionalDetails || "",
        status: "pending",
        requestDate: new Date(),
        deliveryOption: req.body.deliveryOption,
        processingDate: null,
        processingNotes: "",
        processedBy: null,
      });

      // Save request
      await newRequest.save();

      // Return request without QR code
      const requestObj = newRequest.toObject();
      delete requestObj.qrCode;

      res.status(201).json(requestObj);
    } catch (error) {
      console.error("Error creating document request:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update a document request status (admin only)
router.put(
  "/:id/status",
  isAdmin,
  [
    body("status")
      .isIn(["pending", "approved", "rejected", "completed"])
      .withMessage("Invalid status"),
    body("processingNotes").optional(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { status, processingNotes } = req.body;

      // Check if request exists
      const request = await DocumentRequest.findById(id);
      if (!request) {
        return res.status(404).json({ error: "Document request not found" });
      }

      // Update status and processing info
      request.status = status;
      request.processingDate = new Date();
      request.processingNotes = processingNotes || "";
      request.processedBy = req.user.username;

      // Generate QR code for approved or completed requests
      if (["approved", "completed"].includes(status) && !request.qrCode) {
        const qrData = {
          requestId: request.requestId,
          residentId: request.residentId,
          residentName: request.residentName,
          documentType: request.documentType,
          status,
          date: request.requestDate,
          type: "DocumentRequest",
          verified: true,
        };

        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

        // Save QR code to request record
        request.qrCode = qrCodeDataUrl;
      }

      await request.save();

      // Return updated request without QR code
      const requestObj = request.toObject();
      delete requestObj.qrCode;

      res.json(requestObj);
    } catch (error) {
      console.error(`Error updating document request ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete a document request
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get current request to check ownership
    const request = await DocumentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Document request not found" });
    }

    // Only allow the resident who made the request or an admin to delete it
    if (
      req.user.role !== "admin" &&
      req.user.residentId !== request.residentId
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this request" });
    }

    // Delete request
    await DocumentRequest.findByIdAndDelete(id);

    res.json({ message: "Document request deleted successfully" });
  } catch (error) {
    console.error(`Error deleting document request ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
