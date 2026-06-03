const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

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

    doc.rect(0, 0, W, H).fill(theme.white);
    doc
      .rect(20, 20, W - 40, H - 40)
      .lineWidth(0.5)
      .stroke(theme.borderColor);
    doc.rect(20, 20, W - 40, 90).fill(theme.headerBg);

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
          .text("IVORY CREST", 45 + logoWidth + 15, contentStartY + 2, {
            lineBreak: false,
          });
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor("#bdc3c7")
          .text(
            "L U X U R Y   H O T E L",
            45 + logoWidth + 17,
            contentStartY + 28,
            { characterSpacing: 2, lineBreak: false },
          );
      } else {
        throw new Error("Logo not found");
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
        lineBreak: false,
      });

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(theme.labelColor)
      .text(
        `CONFIRMATION NUMBER: ${booking._id?.toString().toUpperCase() || "N/A"}`,
        50,
        125,
        { lineBreak: false },
      );

    // ── Helpers ──────────────────────────────────────────────
    const drawSectionHeader = (title, y) => {
      doc.rect(50, y, W - 100, 20).fill(theme.highlight);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(theme.primaryText)
        .text(title, 60, y + 6, { width: W - 120, lineBreak: false });
      return y + 30;
    };

    const drawField = (label, value, y) => {
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(theme.labelColor)
        .text(label.toUpperCase(), 60, y, { width: 130, lineBreak: false });
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#1a1a1a")
        .text(String(value || "—"), 200, y, {
          width: W - 260,
          lineBreak: false,
        });
      doc
        .moveTo(60, y + 18)
        .lineTo(W - 60, y + 18)
        .lineWidth(0.3)
        .stroke(theme.borderColor);
      return y + 30;
    };

    // 4. Guest Information
    let y = 160;
    y = drawSectionHeader("GUEST INFORMATION", y);
    y = drawField("Full Name", booking.guestName, y);
    y = drawField("Email", booking.guestEmail, y);
    y = drawField("Contact", booking.guestPhone, y);

    y += 15;

    // 5. Reservation Details
    y = drawSectionHeader("RESERVATION DETAILS", y);
    y = drawField("Room Type", booking.roomId?.title || "Confirmed Suite", y);
    y = drawField("Room Number", booking.roomId?.roomNumber || "—", y);
    y = drawField("Check-In", booking.checkin, y);
    y = drawField("Check-Out", booking.checkout, y);
    y = drawField("Length of Stay", `${booking.nights || 0} Night(s)`, y);

    y += 15;

    // 6. Billing
    y = drawSectionHeader("BILLING SUMMARY", y);
    y = drawField("Payment Method", booking.paymentMethod?.toUpperCase(), y);

    // 7. Total Box
    y += 10;
    doc.rect(50, y, W - 100, 50).fill(theme.headerBg);
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#bdc3c7")
      .text("TOTAL AMOUNT PAID", 70, y + 20, { lineBreak: false });
    const totalText = booking.totalPrice
      ? `INR ${Number(booking.totalPrice).toLocaleString("en-IN")}.00`
      : "INR 0.00";
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor(theme.white)
      .text(totalText, 50, y + 16, {
        width: W - 125,
        align: "right",
        lineBreak: false,
      });

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
