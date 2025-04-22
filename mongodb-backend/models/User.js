// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "resident"],
  },
  residentId: {
    type: String,
    ref: "Resident",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;

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

// models/Announcement.js
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["important", "warning", "info"],
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;

// models/Event.js
const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  attendees: [attendeeSchema],
  qrCode: {
    type: String, // QR code data URL for event registration
  },
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;

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
