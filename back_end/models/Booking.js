const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },

  guestName: String,
  guestPhone: String,
  guestEmail: String,

  checkin: String,
  checkout: String,

  nights: Number,
  totalPrice: Number,

  paymentMethod: String,
  paymentDetails: Object,

  status: {
    type: String,
    enum: ["Booked", "Checked-In", "Checked-Out", "Cancelled"],
    default: "Booked",
  },

  actualCheckin: Date,
  actualCheckout: Date,

  // ── Added for 24-hour reminder ─────────────────────────────
  // Set to true once the reminder email has been sent.
  // Prevents duplicate emails across cron ticks.
  reminderSent: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);