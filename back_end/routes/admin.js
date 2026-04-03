const express = require("express");

const Room = require("../models/Room");
const Booking = require("../models/Booking");
const User = require("../models/User");

const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

/* ---------- ROOMS ---------- */

// Get all rooms
router.get("/rooms", verifyToken, isAdmin, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Add room
router.post("/rooms", verifyToken, isAdmin, async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.json(newRoom);
  } catch (error) {
    res.status(500).json(error);
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
      .populate("roomId", "title");

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
