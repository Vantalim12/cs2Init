// models/FamilyHead.js
const mongoose = require("mongoose");

const familyHeadSchema = new mongoose.Schema({
  headId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
  },
  birthDate: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    default: "Family Head",
  },
  qrCode: {
    type: String, // QR code data URL
  },
});

const FamilyHead = mongoose.model("FamilyHead", familyHeadSchema);
module.exports = FamilyHead;
