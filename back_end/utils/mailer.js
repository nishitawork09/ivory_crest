const nodemailer = require("nodemailer");
const generateBookingPDF = require("./generateBookingPDF");

// ── Transporter ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ── Confirmation email (sent immediately on booking) ─────────────────────────
async function sendBookingConfirmationEmail(booking) {
  const to = booking.guestEmail;
  const name = booking.guestName || "Guest";
  const room = booking.roomId;
  const roomLabel = room?.title || room?.roomNumber || "Your Room";

  if (!to) {
    console.warn(
      `[Mailer] Booking ${booking._id} has no guestEmail — skipping confirmation.`,
    );
    return;
  }

  const pdfBuffer = await generateBookingPDF(booking);

  await transporter.sendMail({
    from: `"Ivory Crest Hotel" <${process.env.MAIL_USER}>`,
    to,
    subject: `Booking Confirmed — ${roomLabel} | Check-in: ${booking.checkin}`,
    html: buildHtml({
      name,
      roomLabel,
      bookingId: booking._id,
      checkin: booking.checkin,
      checkout: booking.checkout,
      nights: booking.nights,
      total: booking.totalPrice,
      type: "confirmation",
    }),
    attachments: [
      {
        filename: `IvoryCrest-${booking._id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  console.log(`[Mailer] Confirmation sent → ${to}`);
}

// ── 24-hour reminder email ────────────────────────────────────────────────────
async function sendCheckinReminderEmail(booking) {
  const to = booking.guestEmail;
  const name = booking.guestName || "Guest";
  const room = booking.roomId;
  const roomLabel = room?.title || room?.roomNumber || "Your Room";

  if (!to) {
    console.warn(
      `[Mailer] Booking ${booking._id} has no guestEmail — skipping reminder.`,
    );
    return;
  }

  const pdfBuffer = await generateBookingPDF(booking);

  await transporter.sendMail({
    from: `"Ivory Crest Hotel" <${process.env.MAIL_USER}>`,
    to,
    subject: `⏰ Reminder: Check-in Tomorrow — ${roomLabel}`,
    html: buildHtml({
      name,
      roomLabel,
      bookingId: booking._id,
      checkin: booking.checkin,
      checkout: booking.checkout,
      nights: booking.nights,
      total: booking.totalPrice,
      type: "reminder",
    }),
    attachments: [
      {
        filename: `IvoryCrest-${booking._id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  console.log(`[Mailer] Reminder sent → ${to}`);
}

// ── Shared HTML builder ───────────────────────────────────────────────────────
function buildHtml({
  name,
  roomLabel,
  bookingId,
  checkin,
  checkout,
  nights,
  total,
  type,
}) {
  const isReminder = type === "reminder";
  const headerColor = isReminder ? "#c17a22" : "#1e1a12";
  const headerText = isReminder
    ? "⏰ Check-In Reminder"
    : "Booking Confirmed ✅";
  const intro = isReminder
    ? `This is a friendly reminder that your check-in at Ivory Crest is <strong>tomorrow, ${checkin}</strong>.`
    : `Your booking has been confirmed. Your PDF receipt is attached below.`;
  const closing = isReminder
    ? "See you tomorrow — we can't wait to welcome you! 🌟"
    : "We look forward to welcoming you to Ivory Crest. 🏨";

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 16px;font-weight:600;color:#6b5c38;font-size:12px;white-space:nowrap">${label}</td>
      <td style="padding:10px 16px;color:#1e1a12;font-size:13px">${value || "—"}</td>
    </tr>`;

  return `
  <div style="font-family:'Georgia',serif;max-width:580px;margin:auto;border:1px solid #ddc878;border-radius:4px;overflow:hidden">
    <div style="background:${headerColor};padding:28px 24px;text-align:center">
      <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#c1a032;margin:0 0 6px">IVORY CREST LUXURY HOTEL</p>
      <h2 style="color:#fff;margin:0;font-size:20px;font-weight:normal">${headerText}</h2>
    </div>

    <div style="padding:28px 24px;background:#faf6ed">
      <p style="color:#2e2718;font-size:15px">Dear <strong>${name}</strong>,</p>
      <p style="color:#555;font-size:14px;line-height:1.6">${intro}</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#fff;border:1px solid #e8dfc0;border-radius:3px">
        ${row("Booking ID", bookingId)}
        ${row("Room", roomLabel)}
        ${row("Check-In", checkin)}
        ${row("Check-Out", checkout)}
        ${row("Nights", nights != null ? `${nights} night${nights !== 1 ? "s" : ""}` : null)}
      </table>

      <div style="background:#1e1a12;border-radius:3px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;color:#c1a032">TOTAL PAID (INR)</span>
        <span style="font-size:20px;color:#ffe680;font-weight:bold">
          ₹${total != null ? Number(total).toLocaleString("en-IN") : "—"}
        </span>
      </div>

      <p style="color:#6b5c38;font-style:italic;font-size:13px;margin-top:24px">${closing}</p>
    </div>

    <div style="background:#f2ece0;padding:12px;text-align:center;border-top:1px solid #ddc878">
      <p style="font-size:11px;color:#a09070;margin:0">This is an automated email — please do not reply directly.</p>
    </div>
  </div>`;
}

module.exports = { sendBookingConfirmationEmail, sendCheckinReminderEmail };
