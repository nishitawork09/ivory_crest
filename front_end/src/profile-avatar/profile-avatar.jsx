import { useNavigate } from "react-router-dom";
import "./profile-avatar.css";
export default function ProfileAvatar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const displayName = localStorage.getItem("name") || user?.name || "User";

  const initials =
    displayName !== "User"
      ? displayName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

  return (
    <>
      {token && (
        <button onClick={() => navigate("/profile")} className="profile-btn">
          <div className="profile-avatar">{initials}</div>
          <span className="profile-label">Profile</span>
        </button>
      )}
    </>
  );
}
