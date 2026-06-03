import { useNavigate } from "react-router-dom";
import "./Cta.css";

export default function CTA() {
  const nav = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") || "no";

  return (
    <section className="cta">
      <h2>Ready to Experience Luxury?</h2>
      <p>Book your stay at Ivory Crest and enjoy premium comfort.</p>
      <button
        onClick={() => {
          if (isLoggedIn === "true") {
            return nav("/room");
          }
          nav("/Auth");
        }}
      >
        Book Now
      </button>
    </section>
  );
}
