import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Bookingform.css";
import LogoutButton from "../Logout-btn/Logout-btn";

export default function Bookingform() {
  const nav = useNavigate();

  const [room, setRoom] = useState(null);

  const [form, setForm] = useState({
    checkin: "",
    checkout: "",
  });

  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("");

  function showToast(message, type) {
    setToast(message);
    setToastType(type);

    setTimeout(() => {
      setToast("");
    }, 3000);
  }

  useEffect(() => {
    const savedRoom = JSON.parse(localStorage.getItem("selectedRoom"));
    setRoom(savedRoom);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const checkin = new Date(form.checkin);
    const checkout = new Date(form.checkout);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (checkin < today) {
      showToast(
        "Nice try 😄 but we haven't invented time travel yet!",
        "error",
      );
      return;
    }

    if (checkout <= checkin) {
      showToast("Checkout must be after check-in!", "warning");
      return;
    }

    const bookingData = {
      room,
      checkin: form.checkin,
      checkout: form.checkout,
    };

    /* save booking data */
    localStorage.setItem("bookingData", JSON.stringify(bookingData));

    /* save dates for availability check */
    localStorage.setItem("checkin", form.checkin);
    localStorage.setItem("checkout", form.checkout);

    nav("/payment");
  }

  if (!room) return <h2>No room selected</h2>;

  return (
    <div className="booking-container">
      {toast && <div className={`toast toast-${toastType}`}>{toast}</div>}

      <LogoutButton />

      <div className="booking-card">
        <div className="room-info">
          <img src={room.img} alt={room.title} />

          <div className="room-details">
            <h2>{room.title}</h2>
            <p>{room.desc}</p>
            <h3>₹{room.price} / night</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <label>Check-In Date</label>
          <input
            type="date"
            name="checkin"
            value={form.checkin}
            onChange={handleChange}
            required
          />

          <label>Check-Out Date</label>
          <input
            type="date"
            name="checkout"
            value={form.checkout}
            onChange={handleChange}
            required
          />

          <button type="submit">Continue to Payment</button>
        </form>
      </div>
    </div>
  );
}
