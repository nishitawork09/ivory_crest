import { useState, useEffect } from "react";
import axios from "axios";
import "./WalkInForm.css";

export default function WalkInForm({ refreshBookings }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    roomId: "",
    checkin: "",
    checkout: "",
    nights: 0,
    totalPrice: 0,
    paymentMethod: "Cash",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please login again.");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/reception/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Rooms from API:", res.data);

      const roomData = Array.isArray(res.data)
        ? res.data
        : res.data.rooms || res.data.data || [];

      setRooms(roomData);
    } catch (err) {
      console.error("Failed to load rooms:", err.response?.data || err);
      setError("Failed to load rooms.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoomLabel = (room) => {
    const name =
      room.title ||
      room.name ||
      room.roomName ||
      `Room ${room.roomNumber || room.number || ""}`;
    const price =
      room.price || room.pricePerNight || room.rate || room.basePrice || 0;
    return { name, price };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (formData.checkin && formData.checkout && formData.roomId) {
      const checkinDate = new Date(formData.checkin);
      const checkoutDate = new Date(formData.checkout);
      const diffTime = checkoutDate - checkinDate;
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const selectedRoom = rooms.find((room) => room._id === formData.roomId);
      const price = selectedRoom
        ? selectedRoom.price ||
          selectedRoom.pricePerNight ||
          selectedRoom.rate ||
          0
        : 0;

      setFormData((prev) => ({
        ...prev,
        nights: nights > 0 ? nights : 0,
        totalPrice: nights > 0 ? nights * price : 0,
      }));
    }
  }, [formData.checkin, formData.checkout, formData.roomId, rooms]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.nights <= 0) {
      alert("Checkout date must be after checkin date.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:5000/api/reception/walkin", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Walk-in booking created successfully!");

      setFormData({
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        roomId: "",
        checkin: "",
        checkout: "",
        nights: 0,
        totalPrice: 0,
        paymentMethod: "Cash",
      });

      refreshBookings();
      fetchRooms();
    } catch (err) {
      console.error("Booking error:", err.response?.data || err);
      alert(err.response?.data?.message || "Walk-in booking failed.");
    }
  };

  return (
    <div className="walkinContainer">
      <h2>Walk-In Booking</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form className="walkinForm" onSubmit={handleSubmit}>
        <input
          type="text"
          name="guestName"
          placeholder="Guest Name"
          value={formData.guestName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="guestPhone"
          placeholder="Phone"
          value={formData.guestPhone}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="guestEmail"
          placeholder="Email"
          value={formData.guestEmail}
          onChange={handleChange}
        />

        <select
          name="roomId"
          value={formData.roomId}
          onChange={handleChange}
          required
        >
          <option value="">
            {loading ? "Loading rooms..." : "Select Room"}
          </option>
          {rooms.map((room) => {
            const { name, price } = getRoomLabel(room);
            return (
              <option key={room._id} value={room._id}>
                {name} - ₹{price}
              </option>
            );
          })}
        </select>

        {rooms.length === 0 && !loading && (
          <p style={{ color: "orange", fontSize: "0.85rem" }}>
            No rooms available. Check console for API response.
          </p>
        )}

        <input
          type="date"
          name="checkin"
          value={formData.checkin}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="checkout"
          value={formData.checkout}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          value={formData.nights}
          readOnly
          placeholder="Nights"
        />

        <input
          type="number"
          value={formData.totalPrice}
          readOnly
          placeholder="Total Price (₹)"
        />

        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
        >
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="UPI">UPI</option>
        </select>

        <button type="submit" disabled={loading}>
          Create Booking
        </button>
      </form>
    </div>
  );
}
