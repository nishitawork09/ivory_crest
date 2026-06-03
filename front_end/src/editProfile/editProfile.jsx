import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./editProfile.css";

const API = "http://localhost:5000/api";

const EditProfile = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [name, setName] = useState(
    localStorage.getItem("name") || user?.name || "",
  );
  const [email, setEmail] = useState(
    localStorage.getItem("email") || user?.email || "",
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("");

  function showToast(msg, type = "success") {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3000);
  }

  const handleSubmit = async () => {
    if (!password)
      return showToast("Please enter your password to confirm", "error");
    if (!name.trim() || !email.trim())
      return showToast("Name and email cannot be empty", "error");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/auth/update-profile`,
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update localStorage
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);
      const updatedUser = {
        ...user,
        name: res.data.name,
        email: res.data.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showToast("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <div className={`toast ${toastType}`}>{toast}</div>}
      <div className="edit-profile-page">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="ep-back">
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
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </div>
          </button>
        </div>

        <div className="ep-card">
          <div className="ep-avatar">
            {name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "?"}
          </div>
          <h2 className="ep-title">Edit Profile</h2>
          <p className="ep-subtitle">Confirm your password to save changes</p>

          <div className="ep-field">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="ep-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="ep-field">
            <label>
              Current Password <span className="required">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to confirm"
            />
          </div>

          <button
            className="ep-save-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
