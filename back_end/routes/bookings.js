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
      roomTitle,
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

    // Find all rooms of this type
    const roomsOfType = await Room.find({ title: roomTitle });
    if (roomsOfType.length === 0) {
      return res.status(404).json({ message: "Room type not found" });
    }

    // Find which room IDs are already booked for these dates
    const bookedRoomIds = await Booking.find({
      roomId: { $in: roomsOfType.map((r) => r._id) },
      status: { $in: ["Booked", "Checked-In"] },
      checkin: { $lt: checkout },
      checkout: { $gt: checkin },
    }).distinct("roomId");

    // Pick first available room
    const availableRoom = roomsOfType.find(
      (r) => !bookedRoomIds.map(String).includes(r._id.toString()),
    );

    if (!availableRoom) {
      return res.status(409).json({
        message: "No rooms available for the selected dates",
      });
    }

    const booking = new Booking({
      userId: req.user.id,
      roomId: availableRoom._id,
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

    return res.json({
      message: "Room booked successfully",
      booking: populated,
    });
  } catch (err) {
    console.error("[Bookings] POST error:", err);
    res.status(500).json(err);
  }
});

/* ── GET /api/bookings — All bookings ────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("roomId", "title roomNumber");
    res.json(bookings);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ── GET /api/bookings/my — User's own bookings ─────────────── */
router.get("/my", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("roomId", "title price roomNumber")
      .populate("userId", "name");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
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

/* ── PUT /api/bookings/:id/cancel ─────────────────────────────── */
router.put("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not allowed" });
    if (booking.status === "Checked-In")
      return res.status(400).json({ message: "Cannot cancel after check-in" });
    if (booking.status === "Cancelled")
      return res.status(400).json({ message: "Already cancelled" });
    booking.status = "Cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    console.error("[Bookings] Cancel error:", err);
    res.status(500).json({ message: "Cancel failed" });
  }
});

/* ── DELETE /api/bookings/:id ─────────────────────────────────── */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not allowed" });
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error("[Bookings] Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ── PUT /api/bookings/:id — Reschedule preview ──────────────── */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("roomId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not allowed" });
    if (booking.status === "Checked-In")
      return res
        .status(400)
        .json({ message: "Cannot reschedule after check-in" });

    const { checkin, checkout } = req.body;
    const start = new Date(checkin);
    const end = new Date(checkout);

    if (end <= start)
      return res
        .status(400)
        .json({ message: "Checkout must be after check-in" });

    // Availability check — exclude current booking
    const conflict = await Booking.findOne({
      roomId: booking.roomId._id,
      _id: { $ne: booking._id },
      status: { $in: ["Booked", "Checked-In"] },
      checkin: { $lt: checkout },
      checkout: { $gt: checkin },
    });

    if (conflict) {
      return res.status(409).json({
        message: "Room is not available for the selected dates",
      });
    }

    const oldTotal = booking.totalPrice;
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const price = booking.roomId?.price || 0;
    const newTotal = nights * price;
    const difference = newTotal - oldTotal;

    res.json({
      booking,
      oldTotal,
      newTotal,
      difference,
      pendingCheckin: checkin,
      pendingCheckout: checkout,
      pendingNights: nights,
    });
  } catch (err) {
    console.error("[Bookings] Reschedule preview error:", err);
    res.status(500).json({ message: "Preview failed" });
  }
});

/* ── PUT /api/bookings/:id/confirm — Apply reschedule ────────── */
router.put("/:id/confirm", verifyToken, async (req, res) => {
  try {
    const { checkin, checkout, nights, totalPrice } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not allowed" });
    booking.checkin = checkin;
    booking.checkout = checkout;
    booking.nights = nights;
    booking.totalPrice = totalPrice;
    const updated = await booking.save();
    res.json({ message: "Booking updated successfully", booking: updated });
  } catch (err) {
    console.error("[Bookings] Confirm error:", err);
    res.status(500).json({ message: "Confirm failed" });
  }
});

module.exports = router;
