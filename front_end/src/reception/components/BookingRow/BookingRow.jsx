import axios from "axios";
import StatusBadge from "../StatusBadge/StatusBadge";
import "./BookingRow.css";

export default function BookingRow({ booking, refreshBookings }) {
  const token = localStorage.getItem("token");

  const checkIn = async () => {
    await axios.put(
      `http://localhost:5000/api/reception/checkin/${booking._id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    refreshBookings();
  };

  const checkOut = async () => {
    await axios.put(
      `http://localhost:5000/api/reception/checkout/${booking._id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    refreshBookings();
  };

  const cancelBooking = async () => {
    await axios.put(
      `http://localhost:5000/api/reception/cancel/${booking._id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    refreshBookings();
  };

  return (
    <tr>
      <td>{booking.userId?.name || booking.guestName}</td>

      <td>{booking.roomId?.title}</td>

      <td>{booking.roomId?.roomNumber || "—"}</td>

      <td>{booking.checkin}</td>

      <td>{booking.checkout}</td>

      <td>
        <StatusBadge status={booking.status} />
      </td>

      <td>
        {booking.status === "Booked" && (
          <button className="actionBtn" onClick={checkIn}>
            Check-In
          </button>
        )}

        {booking.status === "Checked-In" && (
          <button className="actionBtn" onClick={checkOut}>
            Check-Out
          </button>
        )}

        {booking.status !== "Cancelled" && booking.status !== "Checked-Out" && (
          <button className="cancelBtn" onClick={cancelBooking}>
            Cancel
          </button>
        )}
      </td>
    </tr>
  );
}
