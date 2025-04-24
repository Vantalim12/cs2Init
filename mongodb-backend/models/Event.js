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
