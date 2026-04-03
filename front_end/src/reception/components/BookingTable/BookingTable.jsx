import BookingRow from "../BookingRow/BookingRow";
import "./BookingTable.css";

export default function BookingTable({ bookings, refreshBookings }) {
  return (
    <table className="bookingTable">
      <thead>
        <tr>
          <th>Guest</th>
          <th>Room</th>
          <th>Check-In</th>
          <th>Check-Out</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {bookings.map((booking) => (
          <BookingRow
            key={booking._id}
            booking={booking}
            refreshBookings={refreshBookings}
          />
        ))}
      </tbody>
    </table>
  );
}
