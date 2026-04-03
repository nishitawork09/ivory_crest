import { useNavigate } from "react-router-dom";
import "./Cta.css";

export default function CTA() {
  const nav = useNavigate();
  return (
    <section className="cta">
      <h2>Ready to Experience Luxury?</h2>
      <p>Book your stay at Ivory Crest and enjoy premium comfort.</p>
      <button onClick={() => nav("/Auth")}>Book Now</button>
    </section>
  );
}
