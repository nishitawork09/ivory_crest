import { useEffect, useState } from "react";
import axios from "axios";
import "./UserInfo.css";
import LogoutButton from "../Logout-btn/Logout-btn";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

const UserInfo = () => {
  const navigate = useNavigate(); // ✅ moved inside the component

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCheckin, setNewCheckin] = useState("");
  const [newCheckout, setNewCheckout] = useState("");

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const displayName = localStorage.getItem("name") || user?.name || "User";
  const displayEmail = localStorage.getItem("email") || user?.email || "";

  const calculatePreview = (checkin, checkout, price) => {
    const safePrice = Number(price) || 0;
    if (!checkin || !checkout) return { nights: 0, total: 0 };
    const start = new Date(checkin);
    const end = new Date(checkout);
    if (isNaN(start) || isNaN(end) || end <= start)
      return { nights: 0, total: 0 };
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return { nights, total: nights * safePrice };
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchBookings();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete booking?")) return;
    try {
      await axios.delete(`${API}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel booking?")) return;
    try {
      await axios.put(
        `${API}/bookings/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "Cancelled" } : b)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed");
    }
  };

  // Add at the top with other useState calls
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("");

  function showToast(msg, type = "success") {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3000);
  }

  // Replace handleReschedule:
  const handleReschedule = async (id) => {
    try {
      const res = await axios.put(
        `${API}/bookings/${id}`,
        { checkin: newCheckin, checkout: newCheckout },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const { booking, oldTotal, newTotal, difference } = res.data;
      localStorage.setItem(
        "bookingData",
        JSON.stringify({
          room: booking.roomId,
          checkin: booking.checkin,
          checkout: booking.checkout,
          guests: booking.guests || 1,
          oldTotal,
          newTotal,
          difference,
          isReschedule: true,
          bookingId: id,
        }),
      );
      window.location.href = "/payment";
    } catch (err) {
      // ← show toast instead of alert
      showToast(
        err.response?.data?.message ||
          "Room is not available for selected dates",
        "error",
      );
    }
  };

  const openReschedule = (booking) => {
    setEditingId(booking._id);
    setNewCheckin(booking.checkin);
    setNewCheckout(booking.checkout);
  };

  return (
    <div className="user-info">
      {/* Back Button */}
      <div
        style={{
          position: "sticky",
          top: "20px",
          zIndex: 1100,
          padding: "12px",
          width: "fit-content",
        }}
      >
        <button className="back-btn-fixed" onClick={() => navigate(-1)}>
          <div className="back-circle">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </div>
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {displayName !== "User"
            ? displayName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "?"}
        </div>
        <div className="profile-info">
          <p className="profile-name">{displayName}</p>
          <p className="profile-email">{displayEmail}</p>
        </div>
        <button
          className="edit-profile-link"
          onClick={() => navigate("/EditProfile")}
          title="Edit Profile"
        >
          <i className="fa-solid fa-pen-to-square"></i>
          <span>Edit</span>
        </button>
      </div>

      <LogoutButton />
      <h3>Your Bookings</h3>

      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        bookings.map((b) => {
          const preview =
            editingId === b._id
              ? calculatePreview(newCheckin, newCheckout, b.roomId?.price)
              : { nights: 0, total: 0 };

          return (
            <div key={b._id} className="booking-card">
              <p>User: {b.userId?.name}</p>
              <p>Room: {b.roomId?.title}</p>
              <p>Room No: {b.roomId?.roomNumber || "—"}</p>
              <p>Check-in: {b.checkin}</p>
              <p>Check-out: {b.checkout}</p>
              <p>Status: {b.status}</p>
              <p>Nights: {b.nights}</p>
              <p>Total: ₹{b.totalPrice}</p>

              {editingId === b._id && (
                <div className="reschedule-box">
                  <input
                    type="date"
                    value={newCheckin}
                    onChange={(e) => setNewCheckin(e.target.value)}
                  />
                  <input
                    type="date"
                    value={newCheckout}
                    onChange={(e) => setNewCheckout(e.target.value)}
                  />
                  <p>Preview Nights: {preview.nights}</p>
                  <p>Preview Price: ₹{preview.total}</p>
                  <button onClick={() => handleReschedule(b._id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Close</button>
                </div>
              )}

              <div className="actions">
                <button
                  onClick={() => openReschedule(b)}
                  disabled={b.status === "Checked-In"}
                >
                  {b.status === "Checked-In" ? "Locked" : "Reschedule"}
                </button>
                <button onClick={() => handleCancel(b._id)}>Cancel</button>
                <button onClick={() => handleDelete(b._id)}>Delete</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default UserInfo;
