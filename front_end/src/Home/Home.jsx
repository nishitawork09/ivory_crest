import "./Home.css";
import { useNavigate } from "react-router-dom";
import Abtus from "../abtus/Abtus";
import Ourrooms from "../ourrooms/Ourrooms";
import Amenities from "../Amenities/Amenities";
import Footer from "../Footer/Footer";
import CTA from "../CTA/Cta";
import Profile_avatar from "../profile-avatar/profile-avatar";

export default function Home() {
  const nav = useNavigate();

  function handleExplore() {
    const token = localStorage.getItem("token");

    if (!token) {
      nav("/auth");
    } else {
      nav("/room");
    }
  }

  return (
    <>
      <div className="landpage">
        <div className="Home">
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
          <Profile_avatar />
          <div className="middleTxt">
            <h1>Welcome to IVORY CREST</h1>
            <p>Experience Luxury & Comfort Like Never Before</p>
            <button onClick={handleExplore}>Explore Rooms</button>
          </div>
        </div>
        <Abtus />
        <Ourrooms />
        <Amenities />
        <CTA />
      </div>
      <Footer />
    </>
  );
}
