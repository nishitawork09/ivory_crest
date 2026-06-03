const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin"); // or whatever your admin middleware is

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ── KPI ──────────────────────────────────────────────────────────────────────
router.get("/kpi", verifyToken, isAdmin, async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const [totalBookings, totalUsers, cancellations, earnings] =
    await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      User.countDocuments(),
      Booking.countDocuments({
        status: "Cancelled",
        createdAt: { $gte: start, $lte: end },
      }),
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: "Cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

  res.json({
    totalBookings,
    totalUsers,
    cancellations,
    totalEarnings: earnings[0]?.total || 0,
    deltas: {}, // add delta logic later if needed
  });
});

// ── Monthly Bookings & Users ─────────────────────────────────────────────────
router.get("/monthly-bookings", verifyToken, isAdmin, async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const bookings = await Booking.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: { $month: "$createdAt" }, bookings: { $sum: 1 } } },
  ]);

  const users = await User.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: { $month: "$createdAt" }, users: { $sum: 1 } } },
  ]);

  const data = MONTHS.map((month, i) => ({
    month,
    bookings: bookings.find((b) => b._id === i + 1)?.bookings || 0,
    users: users.find((u) => u._id === i + 1)?.users || 0,
  }));

  res.json(data);
});

// ── Monthly Earnings ─────────────────────────────────────────────────────────
router.get("/monthly-earnings", verifyToken, isAdmin, async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const earnings = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        earnings: { $sum: "$totalPrice" },
      },
    },
  ]);

  const data = MONTHS.map((month, i) => ({
    month,
    earnings: earnings.find((e) => e._id === i + 1)?.earnings || 0,
  }));

  res.json(data);
});

// ── Room Bookings ─────────────────────────────────────────────────────────────
router.get("/room-bookings", verifyToken, isAdmin, async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const data = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $ne: "Cancelled" },
      },
    },
    { $group: { _id: "$roomId", bookings: { $sum: 1 } } },
    {
      $lookup: {
        from: "rooms",
        localField: "_id",
        foreignField: "_id",
        as: "roomData",
      },
    },
    { $unwind: "$roomData" },
    { $project: { room: "$roomData.title", bookings: 1 } },
    { $sort: { bookings: -1 } },
    { $limit: 5 },
  ]);

  res.json(data);
});

module.exports = router;
