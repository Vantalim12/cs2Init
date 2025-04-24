// models/DocumentRequest.js
const mongoose = require("mongoose");

const documentRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
  },
  residentId: {
    type: String,
    required: true,
    ref: "Resident",
  },
  residentName: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      "barangay-clearance",
      "residency",
      "indigency",
      "good-conduct",
      "business-permit",
    ],
  },
  purpose: {
    type: String,
    required: true,
  },
  additionalDetails: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "approved", "completed", "rejected"],
    default: "pending",
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  deliveryOption: {
    type: String,
    required: true,
    enum: ["pickup", "email", "delivery"],
  },
  processingDate: {
    type: Date,
  },
  processingNotes: {
    type: String,
  },
  processedBy: {
    type: String,
    ref: "User",
  },
  qrCode: {
    type: String, // QR code for verification
  },
});

const DocumentRequest = mongoose.model(
  "DocumentRequest",
  documentRequestSchema
);
module.exports = DocumentRequest;
