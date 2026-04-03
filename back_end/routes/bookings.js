const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const verifyToken = require("../middleware/verifyToken");
const { sendBookingConfirmationEmail } = require("../utils/mailer");

/* ── POST /api/bookings — Create booking ─────────────────────── */
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      roomId,
      checkin,
      checkout,
      guests,
      nights,
      totalPrice,
      paymentMethod,
      paymentDetails,
      guestName,
      guestPhone,
      guestEmail,
    } = req.body;

    const booking = new Booking({
      userId: req.user.id,
      roomId,
      guestName,
      guestPhone,
      guestEmail,
      checkin,
      checkout,
      guests,
      nights,
      totalPrice,
      paymentMethod,
      paymentDetails,
      status: "Booked",
    });

    await booking.save();

    const populated = await Booking.findById(booking._id).populate(
      "roomId",
      "title roomNumber",
    );

    sendBookingConfirmationEmail(populated).catch((err) =>
      console.error("[Bookings] Email failed:", err.message),
    );

    return res.json({ message: "Room booked successfully", booking });
  } catch (err) {
    console.error("[Bookings] POST error:", err);
    res.status(500).json(err);
  }
});

/* ── GET /api/bookings — All bookings ────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "email")
      .populate("roomId", "title");
    res.json(bookings);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ── PUT /api/bookings/checkout/:id — Checkout ───────────────── */
router.put("/checkout/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "Checked-Out";
    booking.actualCheckout = new Date();
    await booking.save();

    res.json({ message: "Checkout successful" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
