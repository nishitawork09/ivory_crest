require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const adminRoutes = require("./routes/admin");
const authRoute = require("./routes/auth");
const roomRoute = require("./routes/room");
const bookingRoutes = require("./routes/bookings");
const reception = require("./routes/reception");
const analyticsRoutes = require("./routes/analytics");

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("API Running..."));
app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reception", reception);
app.use("/api/analytics", analyticsRoutes);
connectDB(app);