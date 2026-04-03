require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const adminRoutes = require("./routes/admin");
const authRoute = require("./routes/auth");
const roomRoute = require("./routes/room");
const bookingRoutes = require("./routes/bookings");
const reception = require("./routes/reception");

const startReminderScheduler = require("./utils/reminderScheduler");

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reception", reception);

app.get("/", (req, res) => res.send("API Running..."));

// ── DB + Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ivorycrest")
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startReminderScheduler();
    });
  })
  .catch((err) => console.log(err));
