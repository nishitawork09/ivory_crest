import { useNavigate } from "react-router-dom";
import "./Logout-btn.css";

export default function LogoutButton({ variant = "default" }) {
  const nav = useNavigate();

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("bookingData");
    localStorage.removeItem("confirmation");
    localStorage.removeItem("paymentData");
    localStorage.removeItem("token");
    nav("/auth");
  }

  return (
    <button className={`logout-btn ${variant}`} onClick={handleLogout}>
      Logout
    </button>
  );
}
