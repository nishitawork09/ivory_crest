const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const Booking = require("../models/Booking");

/* GET ALL ROOMS */
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* GET AVAILABLE ROOMS BY DATE */
router.get("/available", async (req, res) => {
  try {
    const { checkin, checkout } = req.query;

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    const bookings = await Booking.find({
      $or: [
        {
          checkin: { $lte: checkoutDate },
          checkout: { $gte: checkinDate },
        },
      ],
      // Fixed: also exclude Checked-In guests who are still occupying the room
      status: { $in: ["Booked", "Checked-In"] },
    });

    const bookedRoomIds = bookings.map((b) => b.roomId.toString());

    const rooms = await Room.find({
      _id: { $nin: bookedRoomIds },
    });

    res.json(rooms);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
