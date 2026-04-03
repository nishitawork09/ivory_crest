import "./AdminSidebar.css";
import logo from "../../assets/IvoryCrest_logo.png";

export default function AdminSidebar({ setSection }) {
  return (
    <div className="adminSidebar">
      <div className="sidebarLogo">
        <h2 className="sidebarTitle">
          <img src={logo} alt="logo" className="sidebarLogo" height="169px" />
        </h2>
      </div>

      <div className="sidebarMenu">
        <button className="sidebarBtn" onClick={() => setSection("rooms")}>
          Room Management
        </button>

        <button className="sidebarBtn" onClick={() => setSection("addRoom")}>
          Add Room
        </button>

        <button className="sidebarBtn" onClick={() => setSection("bookings")}>
          Bookings
        </button>

        <button className="sidebarBtn" onClick={() => setSection("users")}>
          User Management
        </button>
      </div>
    </div>
  );
}
