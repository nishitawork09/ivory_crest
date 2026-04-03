import "./DashboardCards.css";

export default function DashboardCards({ bookings }) {
  const total = bookings.length;

  const checkedIn = bookings.filter((b) => b.status === "Checked-In").length;

  const checkedOut = bookings.filter((b) => b.status === "Checked-Out").length;

  const booked = bookings.filter((b) => b.status === "Booked").length;

  return (
    <div className="cardsContainer">
      <div className="card">
        <h3>Total Bookings</h3>
        <p>{total}</p>
      </div>

      <div className="card">
        <h3>Checked-In</h3>
        <p>{checkedIn}</p>
      </div>

      <div className="card">
        <h3>Checked-Out</h3>
        <p>{checkedOut}</p>
      </div>

      <div className="card">
        <h3>Upcoming</h3>
        <p>{booked}</p>
      </div>
    </div>
  );
}
