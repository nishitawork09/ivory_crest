import { useEffect, useState } from "react";
import axios from "axios";
import "./A_Booking.css";

export default function A_Bookings() {
  const [bookings, setBookings] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = res.data.sort((a, b) => a.totalPrice - b.totalPrice);

      setBookings(sorted);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bookingsContainer">
      <h2 className="bookingsTitle">Bookings</h2>

      <div className="bookingGrid">
        {bookings.map((b) => (
          <div key={b._id} className="bookingCard">
            <div className="bookingRow">
              <span className="bookingLabel">User</span>
              <span className="bookingValue">{b.userId?.email || "N/A"}</span>
            </div>

            <div className="bookingRow">
              <span className="bookingLabel">Room</span>
              <span className="bookingValue">{b.roomId?.title || "N/A"}</span>
            </div>

            <div className="bookingRow">
              <span className="bookingLabel">Room No</span>
              <span className="bookingValue">
                {b.roomId?.roomNumber || "—"}
              </span>
            </div>

            <div className="bookingRow">
              <span className="bookingLabel">Check In</span>
              <span className="bookingValue">
                {new Date(b.checkin).toLocaleDateString()}
              </span>
            </div>

            <div className="bookingRow">
              <span className="bookingLabel">Check Out</span>
              <span className="bookingValue">
                {new Date(b.checkout).toLocaleDateString()}
              </span>
            </div>

            <div className="bookingRow">
              <span className="bookingLabel">Total Price</span>
              <span className="bookingValue">₹ {b.totalPrice}</span>
            </div>

            <div className="bookingRow">
              <span className="bookingLabel">Status</span>
              <span className="bookingValue">{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
