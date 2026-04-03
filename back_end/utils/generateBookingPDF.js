const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

/**
 * Generates a professional, uniformly styled Booking PDF for Ivory Crest.
 * @param {Object} booking - Populated booking document
 * @returns {Promise<Buffer>}
 */
function generateBookingPDF(booking) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const W = doc.page.width;
    const H = doc.page.height;

    const theme = {
      headerBg: "#1a252f",
      primaryText: "#2c3e50",
      labelColor: "#7f8c8d",
      borderColor: "#dcdde1",
      highlight: "#f8f9fa",
      white: "#ffffff",
    };

    // 1. Background and Border
    doc.rect(0, 0, W, H).fill(theme.white);
    doc
      .rect(20, 20, W - 40, H - 40)
      .lineWidth(0.5)
      .stroke(theme.borderColor);

    // 2. Header Section
    doc.rect(20, 20, W - 40, 90).fill(theme.headerBg);

    // Fixed: relative path so it works on any machine / OS
    const logoPath = path.join(__dirname, "../assets/IvoryCrest_logo.png");
    const logoWidth = 45;
    const contentStartY = 42;

    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 45, contentStartY, { width: logoWidth });

        doc
          .fontSize(22)
          .font("Helvetica-Bold")
          .fillColor(theme.white)
          .text("IVORY CREST", 45 + logoWidth + 15, contentStartY + 2);

        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor("#bdc3c7")
          .text(
            "L U X U R Y   H O T E L",
            45 + logoWidth + 17,
            contentStartY + 28,
            {
              characterSpacing: 2,
            },
          );
      } else {
        throw new Error("Logo file not found");
      }
    } catch (e) {
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor(theme.white)
        .text("IVORY CREST", 0, contentStartY + 5, { align: "center" });
    }

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(theme.white)
      .text("BOOKING CONFIRMATION", 0, contentStartY + 15, {
        align: "right",
        width: W - 60,
      });

    // 3. Document ID Bar
    const idY = 125;
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(theme.labelColor)
      .text(
        `CONFIRMATION NUMBER: ${booking._id?.toString().toUpperCase() || "N/A"}`,
        50,
        idY,
      );

    // ── Helpers ──────────────────────────────────────────────────
    const drawSectionHeader = (title, y) => {
      doc.rect(50, y, W - 100, 20).fill(theme.highlight);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(theme.primaryText)
        .text(title, 60, y + 6);
      return y + 30;
    };

    const drawField = (label, value, y) => {
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(theme.labelColor)
        .text(label.toUpperCase(), 60, y);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#1a1a1a")
        .text(String(value || "—"), 200, y);

      doc
        .moveTo(60, y + 15)
        .lineTo(W - 60, y + 15)
        .lineWidth(0.3)
        .stroke(theme.borderColor);

      return y + 28;
    };

    // 4. Guest Details
    let currentY = 160;
    currentY = drawSectionHeader("GUEST INFORMATION", currentY);
    currentY = drawField("Full Name", booking.guestName, currentY);
    currentY = drawField("Email", booking.guestEmail, currentY);
    currentY = drawField("Contact", booking.guestPhone, currentY);

    currentY += 15;

    // 5. Stay Details
    currentY = drawSectionHeader("RESERVATION DETAILS", currentY);
    const roomType =
      booking.roomId?.title || booking.roomId?.roomNumber || "Confirmed Suite";
    currentY = drawField("Room Type", roomType, currentY);
    currentY = drawField("Check-In", booking.checkin, currentY);
    currentY = drawField("Check-Out", booking.checkout, currentY);
    currentY = drawField(
      "Length of Stay",
      `${booking.nights || 0} Night(s)`,
      currentY,
    );

    currentY += 15;

    // 6. Payment & Billing
    currentY = drawSectionHeader("BILLING SUMMARY", currentY);
    currentY = drawField(
      "Payment Method",
      booking.paymentMethod?.toUpperCase(),
      currentY,
    );

    // 7. Total Amount Box
    currentY += 10;
    doc.rect(50, currentY, W - 100, 50).fill(theme.headerBg);

    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#bdc3c7")
      .text("TOTAL AMOUNT PAID", 70, currentY + 20);

    const totalText = booking.totalPrice
      ? `INR ${Number(booking.totalPrice).toLocaleString("en-IN")}.00`
      : "INR 0.00";

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor(theme.white)
      .text(totalText, 50, currentY + 16, { width: W - 125, align: "right" });

    // 8. Footer
    const footerY = H - 80;
    doc
      .moveTo(50, footerY)
      .lineTo(W - 50, footerY)
      .lineWidth(0.5)
      .stroke(theme.borderColor);

    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor(theme.labelColor)
      .text(
        "Thank you for choosing Ivory Crest. We look forward to your visit.",
        0,
        footerY + 15,
        { align: "center" },
      );

    const time = new Date().toLocaleString("en-IN", { hour12: true });
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor(theme.borderColor)
      .text(`Generated: ${time} | reception@ivorycrest.com`, 0, footerY + 35, {
        align: "center",
      });

    doc.end();
  });
}

module.exports = generateBookingPDF;
