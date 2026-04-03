import Ourrooms from "../ourrooms/Ourrooms";
import "./Rooms.css";
import Footer from "../Footer/Footer";
import Logout from "../Logout-btn/Logout-btn";

export default function Rooms() {
  return (
    <>
      <div className="roomBook">
        <Ourrooms showButton={true} />
      </div>
      <Logout />
      <Footer />
    </>
  );
}
