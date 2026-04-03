const cron = require("node-cron");
const Booking = require("../models/Booking");
const { sendCheckinReminderEmail } = require("./mailer");

function startReminderScheduler() {
  console.log("[Scheduler] 24-hour check-in reminder scheduler started.");

  // Runs at the start of every hour: "0 * * * *"
  // Change to "* * * * *" while testing (runs every minute)
  cron.schedule("0 * * * *", async () => {
    console.log("[Scheduler] Tick:", new Date().toISOString());

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const pad = (n) => String(n).padStart(2, "0");
      const yyyy = tomorrow.getFullYear();
      const mm = pad(tomorrow.getMonth() + 1);
      const dd = pad(tomorrow.getDate());

      const tomorrowISO = `${yyyy}-${mm}-${dd}`; // 2025-07-20
      const tomorrowSlash = `${dd}/${mm}/${yyyy}`; // 20/07/2025
      const tomorrowLong = tomorrow.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }); // 20 July 2025

      const candidates = await Booking.find({
        status: "Booked",
        reminderSent: { $ne: true },
      })
        .populate("roomId", "title roomNumber")
        .lean();

      const toRemind = candidates.filter((b) => {
        const c = (b.checkin || "").trim();
        return c === tomorrowISO || c === tomorrowSlash || c === tomorrowLong;
      });

      if (toRemind.length === 0) {
        console.log("[Scheduler] No reminders to send this hour.");
        return;
      }

      console.log(`[Scheduler] Sending ${toRemind.length} reminder(s)…`);

      for (const booking of toRemind) {
        try {
          await sendCheckinReminderEmail(booking);

          await Booking.findByIdAndUpdate(booking._id, { reminderSent: true });

          console.log(
            `[Scheduler] ✓ Reminded booking ${booking._id} → ${booking.guestEmail}`,
          );
        } catch (err) {
          console.error(
            `[Scheduler] ✗ Failed for booking ${booking._id}:`,
            err.message,
          );
        }
      }
    } catch (err) {
      console.error("[Scheduler] Cron error:", err.message);
    }
  });
}

module.exports = startReminderScheduler;
