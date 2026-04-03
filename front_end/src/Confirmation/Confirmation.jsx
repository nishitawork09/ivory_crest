import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import logo from "../assets/IvoryCrest_logo.png";
import "./Confirmation.css";
import LogoutButton from "../Logout-btn/Logout-btn";
import { useNavigate } from "react-router-dom";
import Button from "../button/button";

export default function Confirmation() {
  const nav = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const confirm = JSON.parse(localStorage.getItem("confirmation"));
    if (!confirm) {
      nav("/room");
      return;
    }
    setData(confirm);
  }, [nav]);

  function downloadReceipt() {
    if (!data) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- Theme Colors ---
    const colors = {
      header: [26, 37, 47], // #1A252F
      textMain: [44, 62, 80], // #2C3E50
      textLabel: [127, 140, 141], // #7F8C8D
      line: [220, 221, 225], // #DCDDE1
      white: [255, 255, 255],
    };

    // 1. Professional Border
    doc.setDrawColor(...colors.line);
    doc.setLineWidth(0.2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // 2. Header Band
    doc.setFillColor(...colors.header);
    doc.rect(10, 10, pageWidth - 20, 35, "F");

    // 3. Logo & Brand Title
    // doc.addImage(imageData, format, x, y, width, height)
    doc.addImage(logo, "PNG", 20, 15, 25, 25);

    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("IVORY CREST", 52, 28);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("L U X U R Y   H O T E L", 52, 35, { charSpace: 1 });

    doc.setFontSize(10);
    doc.text("BOOKING VOUCHER", pageWidth - 20, 28, { align: "right" });

    // 4. Content Area
    let y = 60;

    const drawRow = (label, value, yPos) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.textLabel);
      doc.text(label.toUpperCase(), 25, yPos);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...colors.textMain);
      doc.text(String(value || "—"), 80, yPos);

      doc.setDrawColor(...colors.line);
      doc.setLineWidth(0.1);
      doc.line(25, yPos + 4, pageWidth - 25, yPos + 4);
      return yPos + 15;
    };

    // Section Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.header);
    doc.text("RESERVATION DETAILS", 20, y);
    y += 10;

    y = drawRow("Confirmation No", data.bookingId, y);
    y = drawRow("Guest Name", data.guestName || "Valued Guest", y);
    y = drawRow("Room Type", data.room?.title || "Luxury Suite", y);
    y = drawRow("Check-In", data.checkin, y);
    y = drawRow("Check-Out", data.checkout, y);

    y += 10;

    // 5. Total Amount Highlight
    doc.setFillColor(...colors.header);
    doc.rect(20, y, pageWidth - 40, 20, "F");

    doc.setTextColor(189, 195, 199); // Light grey text
    doc.setFontSize(9);
    doc.text("TOTAL AMOUNT PAID", 30, y + 12);

    doc.setTextColor(...colors.white);
    doc.setFontSize(14);
    const price = data.totalPrice ? `INR ${data.totalPrice}.00` : "INR 0.00";
    doc.text(price, pageWidth - 30, y + 12, { align: "right" });

    // 6. Footer
    doc.setTextColor(...colors.textLabel);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(
      "Thank you for choosing Ivory Crest Luxury Hotel.",
      pageWidth / 2,
      pageHeight - 25,
      { align: "center" },
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const date = new Date().toLocaleString();
    doc.text(
      `Generated on ${date} | Official Booking Document`,
      pageWidth / 2,
      pageHeight - 18,
      { align: "center" },
    );

    doc.save(`IvoryCrest_Confirmation_${data.bookingId}.pdf`);
  }

  if (!data) return null;

  return (
    <div className="confirm-container">
      <LogoutButton />
      <div className="confirm-card">
        <h1>Booking Confirmed ✅</h1>
        <h2>{data.room?.title || "Room Booked"}</h2>
        <div className="details-grid">
          <p>
            <b>Booking ID:</b> {data.bookingId}
          </p>
          <p>
            <b>Check-in:</b> {data.checkin}
          </p>
          <p>
            <b>Check-out:</b> {data.checkout}
          </p>
        </div>
        <h3 className="price-tag">Total Paid: ₹{data.totalPrice}</h3>
        <div className="Btns">
          <button className="download-btn" onClick={downloadReceipt}>
            Download Receipt (PDF)
          </button>
          <Button />
        </div>
      </div>
    </div>
  );
}
