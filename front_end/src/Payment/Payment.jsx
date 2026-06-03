import { useState, useEffect } from "react";
import axios from "axios";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useNavigate } from "react-router-dom";
import "./Payment.css";
import Button from "../button/button";
import Footer from "../Footer/Footer";

export default function Payment() {
  const nav = useNavigate();

  const bookingData = JSON.parse(localStorage.getItem("bookingData"));

  useEffect(() => {
    if (!bookingData) nav("/room");
  }, [bookingData, nav]);

  if (!bookingData) return null;

  // ── FLAG ────────────────────────────────────────────────────────
  const isReschedule = bookingData?.isReschedule || false;

  // ── NEW BOOKING: nights + full total ────────────────────────────
  const checkin = new Date(bookingData.checkin);
  const checkout = new Date(bookingData.checkout);

  const nights =
    !isNaN(checkin) && !isNaN(checkout) && checkout > checkin
      ? Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24))
      : 0;

  const price = Number(bookingData?.room?.price) || 0;
  const fullTotal = nights * price;

  // ── RESCHEDULE: diff pricing ────────────────────────────────────
  const oldTotal = bookingData?.oldTotal || 0;
  const newTotal = bookingData?.newTotal || 0;
  const difference = bookingData?.difference || 0;

  // ── UNIFIED AMOUNT ──────────────────────────────────────────────
  const amountToPay = isReschedule ? Math.max(difference, 0) : fullTotal;

  // ── STATE ───────────────────────────────────────────────────────
  const [payment, setPayment] = useState({
    method: "upi",
    cardNumber: "",
    name: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  const [guest, setGuest] = useState({
    guestName: localStorage.getItem("name") || "",
    guestEmail: localStorage.getItem("email") || "",
    guestPhone: "",
  });

  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("");
  const [loading, setLoading] = useState(false);

  function showToast(msg, type = "success") {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3000);
  }

  const handleChange = (e) =>
    setPayment({ ...payment, [e.target.name]: e.target.value });

  const handleGuestChange = (e) =>
    setGuest({ ...guest, [e.target.name]: e.target.value });

  // ── VALIDATION ──────────────────────────────────────────────────
  const cardRegex = /^[0-9]{16}$/;
  const expiryRegex = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
  const cvvRegex = /^[0-9]{3}$/;
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;

  // Calls /confirm to write new dates to DB — only after payment succeeds
  async function confirmReschedule() {
    const token = localStorage.getItem("token");
    const bookingId = bookingData.bookingId;
    if (!bookingId) return;

    await axios.put(
      `http://localhost:5000/api/bookings/${bookingId}/confirm`,
      {
        checkin: bookingData.checkin,
        checkout: bookingData.checkout,
        nights: bookingData.pendingNights,
        totalPrice: newTotal,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }

  // ── PAYMENT HANDLER ─────────────────────────────────────────────
  async function handlePayment(e) {
    e.preventDefault();

    // Reschedule with no extra charge — skip payment, just confirm dates
    if (isReschedule && difference <= 0) {
      try {
        setLoading(true);
        await confirmReschedule();
        nav("/confirmation");
      } catch (err) {
        showToast("Failed to confirm reschedule", "error");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!phoneRegex.test(guest.guestPhone.trim())) {
      showToast("Enter a valid phone number", "error");
      return;
    }

    if (payment.method === "card") {
      if (!cardRegex.test(payment.cardNumber)) {
        showToast("Card must be 16 digits", "error");
        return;
      }
      if (!cvvRegex.test(payment.cvv)) {
        showToast("Invalid CVV", "error");
        return;
      }
      if (!expiryRegex.test(payment.expiry)) {
        showToast("Invalid expiry (MM/YY)", "error");
        return;
      }
    }

    if (payment.method === "upi") {
      if (!upiRegex.test(payment.upiId)) {
        showToast("Invalid UPI ID", "error");
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (isReschedule) {
        // ── RESCHEDULE FLOW ───────────────────────────────────────
        // Step 1: record payment transaction
        const finalData = {
          roomTitle: bookingData.room?.title,
          checkin: bookingData.checkin,
          checkout: bookingData.checkout,
          guests: bookingData.guests || 1,
          nights: bookingData.pendingNights || 0,
          totalPrice: amountToPay,
          paymentMethod: payment.method,
          paymentDetails: payment,
          guestName: guest.guestName.trim(),
          guestEmail: guest.guestEmail.trim(),
          guestPhone: guest.guestPhone.trim(),
        };

        const res = await axios.post(
          "http://localhost:5000/api/bookings",
          finalData,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const assignedRoom = res.data.booking?.roomId;
        await confirmReschedule();

        const rawId = res.data.booking?._id;
        const bookingId = rawId
          ? "IVC-" + rawId.toString().slice(-6).toUpperCase()
          : "IVC-" + Math.floor(Math.random() * 100000);

        localStorage.setItem(
          "confirmation",
          JSON.stringify({
            ...finalData,
            room: assignedRoom || bookingData.room,
            bookingId,
            paidAmount: amountToPay,
          }),
        );
      } else {
        // ── NEW BOOKING FLOW ──────────────────────────────────────
        const finalData = {
          roomTitle: bookingData.room?.title,
          checkin: bookingData.checkin,
          checkout: bookingData.checkout,
          guests: bookingData.guests || 1,
          nights,
          totalPrice: fullTotal,
          paymentMethod: payment.method,
          paymentDetails: payment,
          guestName: guest.guestName.trim(),
          guestEmail: guest.guestEmail.trim(),
          guestPhone: guest.guestPhone.trim(),
        };

        const res = await axios.post(
          "http://localhost:5000/api/bookings",
          finalData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const assignedRoom = res.data.booking?.roomId;
        const rawId = res.data.booking?._id;
        const bookingId = rawId
          ? "IVC-" + rawId.toString().slice(-6).toUpperCase()
          : "IVC-" + Math.floor(Math.random() * 100000);

        localStorage.setItem(
          "confirmation",
          JSON.stringify({
            ...finalData,
            room: assignedRoom || bookingData.room,
            bookingId,
            paidAmount: fullTotal,
          }),
        );
      }

      nav("/confirmation");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Payment failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <>
      <div className="payment-container">
        {toast && <div className={`toast toast-${toastType}`}>{toast}</div>}
        <div class="orb orb1"></div>
        <div class="orb orb2"></div>
        <div class="orb orb3"></div>

        <div className="payment-card">
          <h1>{isReschedule ? "Reschedule Payment" : "Payment"}</h1>

          <div className="payment-summary">
            <p>
              <b>Room:</b> {bookingData?.room?.title}
            </p>

            {!isReschedule && (
              <>
                <p>
                  <b>Nights:</b> {nights}
                </p>
                <h2>Total ₹{fullTotal}</h2>
              </>
            )}

            {isReschedule && (
              <>
                <p>
                  <b>Old Price:</b> ₹{oldTotal}
                </p>
                <p>
                  <b>New Price:</b> ₹{newTotal}
                </p>

                {difference > 0 && (
                  <h2 style={{ color: "red" }}>Pay Extra ₹{difference}</h2>
                )}
                {difference < 0 && (
                  <h2 style={{ color: "green" }}>
                    Refund ₹{Math.abs(difference)}
                  </h2>
                )}
                {difference === 0 && <h2>No Payment Needed</h2>}
              </>
            )}
          </div>

          {/* Payment form — shown when there's an amount to collect */}
          {(!isReschedule || difference > 0) && (
            <form onSubmit={handlePayment}>
              <input
                type="tel"
                name="guestPhone"
                placeholder="Phone Number"
                value={guest.guestPhone}
                onChange={handleGuestChange}
                required
              />

              <select
                name="method"
                value={payment.method}
                onChange={handleChange}
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>

              {payment.method === "upi" && (
                <input
                  type="text"
                  name="upiId"
                  placeholder="example@upi"
                  value={payment.upiId}
                  onChange={handleChange}
                  required
                />
              )}

              {payment.method === "card" && (
                <>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number (16 digits)"
                    value={payment.cardNumber}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Name on Card"
                    value={payment.name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={payment.expiry}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    value={payment.cvv}
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : `Pay ₹${amountToPay}`}
              </button>
            </form>
          )}

          {/* No-payment reschedule (same price or cheaper) */}
          {isReschedule && difference <= 0 && (
            <button onClick={handlePayment} disabled={loading}>
              {loading ? "Updating..." : "Confirm Reschedule"}
            </button>
          )}

          <Button />
        </div>
      </div>
      <Footer />
    </>
  );
}
