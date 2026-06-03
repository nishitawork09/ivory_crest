import "./AdminSidebar.css";
import logo from "../../assets/IvoryCrest_logo.png";

export default function AdminSidebar({ setSection, activeSection }) {
  return (
    <div className="adminSidebar">
      <div className="sidebarLogo">
        <h2 className="sidebarTitle">
          <img src={logo} alt="logo" className="sidebarLogo" height="169px" />
        </h2>
      </div>

      <div className="sidebarMenu">
        <button
          className={`sidebarBtn ${activeSection === "rooms" ? "active" : ""}`}
          onClick={() => setSection("rooms")}
        >
          Room Management
        </button>

        <button
          className={`sidebarBtn ${activeSection === "addRoom" ? "active" : ""}`}
          onClick={() => setSection("addRoom")}
        >
          Add Room
        </button>

        <button
          className={`sidebarBtn ${activeSection === "bookings" ? "active" : ""}`}
          onClick={() => setSection("bookings")}
        >
          Bookings
        </button>

        <button
          className={`sidebarBtn ${activeSection === "users" ? "active" : ""}`}
          onClick={() => setSection("users")}
        >
          User Management
        </button>

        <button
          className={`sidebarBtn ${activeSection === "analytics" ? "active" : ""}`}
          onClick={() => setSection("analytics")}
        >
          Analytics
        </button>
      </div>
    </div>
  );
}
