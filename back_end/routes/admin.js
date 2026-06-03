const express = require("express");

const Room = require("../models/Room");
const Booking = require("../models/Booking");
const User = require("../models/User");

const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

/* ---------- ROOMS ---------- */

// Get all rooms
// GET all rooms — restore to simple find()
router.get("/rooms", verifyToken, isAdmin, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST add room — duplicate check + roomNumber
router.post("/rooms", verifyToken, isAdmin, async (req, res) => {
  try {
    const { roomNumber, title, price, capacity, img, desc } = req.body;

    // Split "101,102" or "A101,B102" into individual numbers
    const roomNumbers = roomNumber
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    if (roomNumbers.length === 0) {
      return res
        .status(400)
        .json({ message: "Enter at least one room number" });
    }

    // Check for duplicates
    const existing = await Room.find({ roomNumber: { $in: roomNumbers } });
    if (existing.length > 0) {
      const duplicates = existing.map((r) => r.roomNumber).join(", ");
      return res.status(409).json({
        message: `These room numbers already exist: ${duplicates}`,
      });
    }

    // Create one document per room number
    const rooms = roomNumbers.map((num) => ({
      roomNumber: num,
      title,
      price,
      capacity,
      img,
      desc,
    }));

    const created = await Room.insertMany(rooms);
    res.json({ message: `${created.length} room(s) added`, rooms: created });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update room
router.put("/rooms/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(room);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete room
router.delete("/rooms/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* ---------- BOOKINGS ---------- */

router.get("/bookings", verifyToken, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "email")
      .populate("roomId", "title roomNumber"); // ← add roomNumber

    res.json(bookings);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* ---------- USERS ---------- */

router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
