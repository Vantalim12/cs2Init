// models/Resident.js
const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema({
  residentId: {
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
  familyHeadId: {
    type: String,
    ref: "FamilyHead",
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    default: "Resident",
  },
  qrCode: {
    type: String, // QR code data URL
  },
});

const Resident = mongoose.model("Resident", residentSchema);
module.exports = Resident;
