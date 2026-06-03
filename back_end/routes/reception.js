const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Room = require("../models/Room");

const verifyToken = require("../middleware/verifyToken");
const isReception = require("../middleware/isReception");

// ===============================
// Get All Bookings
// ===============================
router.get("/bookings", verifyToken, isReception, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("roomId", "title price roomNumber");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// ===============================
// Get Available Rooms
// ===============================
router.get("/rooms", verifyToken, isReception, async (req, res) => {
  try {
    const rooms = await Room.find();

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// ===============================
// Check-In Guest
// ===============================
router.put("/checkin/:id", verifyToken, isReception, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "Checked-In",
        actualCheckin: new Date(),
      },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Mark room as occupied
    await Room.findByIdAndUpdate(booking.roomId, {
      available: false,
    });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Check-in failed" });
  }
});

// ===============================
// Check-Out Guest
// ===============================
router.put("/checkout/:id", verifyToken, isReception, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "Checked-Out",
        actualCheckout: new Date(),
      },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Make room available again
    await Room.findByIdAndUpdate(booking.roomId, {
      available: true,
    });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Check-out failed" });
  }
});

// ===============================
// Cancel Booking
// ===============================
router.put("/cancel/:id", verifyToken, isReception, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cancel failed" });
  }
});

// ===============================
// Walk-In Booking
// ===============================
router.post("/walkin", verifyToken, isReception, async (req, res) => {
  try {
    const {
      roomId,
      guestName,
      guestPhone,
      guestEmail,
      checkin,
      checkout,
      nights,
      totalPrice,
      paymentMethod,
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const conflict = await Booking.findOne({
      roomId,
      status: { $in: ["Booked", "Checked-In"] },
      checkin: { $lt: checkout },
      checkout: { $gt: checkin },
    });

    if (conflict) {
      return res.status(409).json({
        message: "Room is already booked for the selected dates",
      });
    }

    const booking = new Booking({
      roomId,
      guestName,
      guestPhone,
      guestEmail,
      checkin,
      checkout,
      nights,
      totalPrice,
      paymentMethod,
      status: "Checked-In",
      actualCheckin: new Date(),
    });

    await booking.save();

    await Room.findByIdAndUpdate(roomId, { available: false });

    res.json({ message: "Walk-in booking created", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Walk-in booking failed" });
  }
});

module.exports = router;
