import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Payment.css";
import LogoutButton from "../Logout-btn/Logout-btn";
import Button from "../button/button";

export default function Payment() {
  const nav = useNavigate();

  const bookingData = JSON.parse(localStorage.getItem("bookingData"));

  useEffect(() => {
    if (!bookingData) nav("/room");
  }, [bookingData, nav]);

  if (!bookingData) return null;

  const [payment, setPayment] = useState({
    method: "upi",
    cardNumber: "",
    name: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  // ── Guest details — sent to backend for email / PDF ───────────
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

  const checkin = new Date(bookingData.checkin);
  const checkout = new Date(bookingData.checkout);
  const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * bookingData.room.price;

  const cardRegex = /^[0-9]{16}$/;
  const expiryRegex = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
  const cvvRegex = /^[0-9]{3}$/;
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9][0-9]{9}$/;

  async function handlePayment(e) {
    e.preventDefault();

    // ── Validate guest info ─────────────────────────────────────
    if (!phoneRegex.test(guest.guestPhone)) {
      showToast("Please enter a valid 10-digit phone number", "error");
      return;
    }

    // ── Validate payment ────────────────────────────────────────
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

    const finalData = {
      roomId: bookingData.room._id,
      checkin: bookingData.checkin,
      checkout: bookingData.checkout,
      guests: bookingData.guests,
      nights,
      totalPrice,
      paymentMethod: payment.method,
      paymentDetails: payment,
      // ── guest fields (used by mailer + PDF) ──────────────────
      guestName: guest.guestName.trim(),
      guestEmail: guest.guestEmail.trim(),
      guestPhone: guest.guestPhone.trim(),
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/bookings",
        finalData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Use real _id from backend for the booking reference
      const rawId = res.data.booking?._id;
      const bookingId = rawId
        ? "IVC-" + rawId.toString().slice(-6).toUpperCase()
        : "IVC-" + Math.floor(Math.random() * 100000);

      localStorage.setItem(
        "confirmation",
        JSON.stringify({
          ...finalData,
          room: bookingData.room, // keep full room object for Confirmation page
          bookingId,
        }),
      );

      nav("/confirmation");
    } catch (err) {
      // Log full error so you can debug from the console
      console.error("[Payment] Error:", err.response?.data || err.message);

      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        err.message ||
        "Payment failed";

      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="payment-container">
      {toast && <div className={`toast toast-${toastType}`}>{toast}</div>}

      <LogoutButton />

      <div className="payment-card">
        <h1>Secure Payment</h1>

        <div className="payment-summary">
          <p>
            <b>Room:</b> {bookingData.room.title}
          </p>
          <p>
            <b>Check-in:</b> {bookingData.checkin}
          </p>
          <p>
            <b>Check-out:</b> {bookingData.checkout}
          </p>
          <p>
            <b>Nights:</b> {nights}
          </p>
          <h2>Total ₹{totalPrice}</h2>
        </div>

        <form onSubmit={handlePayment}>
          {/* ── Guest Details ─────────────────────────────────── */}
          <fieldset className="guest-fields">
            <legend>Guest Details</legend>
            <input
              type="tel"
              name="guestPhone"
              placeholder="Phone Number (10 digits)"
              maxLength="10"
              value={guest.guestPhone}
              onChange={handleGuestChange}
              className="bookphno"
              required
            />
          </fieldset>

          {/* ── Payment Method ────────────────────────────────── */}
          <label>Payment Method</label>
          <select name="method" value={payment.method} onChange={handleChange}>
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
                placeholder="Card Number"
                maxLength="16"
                value={payment.cardNumber}
                onChange={handleChange}
              />
              <input
                type="text"
                name="name"
                placeholder="Card Holder Name"
                value={payment.name}
                onChange={handleChange}
              />
              <div className="card-row">
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  maxLength="5"
                  className="mmyy"
                  value={payment.expiry}
                  onChange={handleChange}
                />
                <input
                  type="password"
                  name="cvv"
                  placeholder="CVV"
                  maxLength="3"
                  value={payment.cvv}
                  className="cvv"
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Processing…" : "Pay Now"}
          </button>

          <Button />
        </form>
      </div>
    </div>
  );
}
