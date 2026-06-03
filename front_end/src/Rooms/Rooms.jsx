import Ourrooms from "../ourrooms/Ourrooms";
import "./Rooms.css";
import Footer from "../Footer/Footer";
import ProfileAvatar from "../profile-avatar/profile-avatar";
import { useNavigate } from "react-router-dom";
export default function Rooms() {
  const navigate = useNavigate();
  return (
    <>
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
      <div className="roomBook">
        <Ourrooms showButton={true} />
      </div>
      <Footer />
      <ProfileAvatar />
    </>
  );
}
