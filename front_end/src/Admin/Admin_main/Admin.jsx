import { useState } from "react";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import Rooms from "../A_Room/A_Rooms";
import AddRoom from "../AddRoom/A_AddRoom";
import Bookings from "../A_Booking/A_Booking";
import Users from "../A_user/A_User";
import LogoutButton from "../../Logout-btn/Logout-btn";

import "./Admin.css";

export default function Admin() {
  const [section, setSection] = useState("rooms");

  return (
    <div className="adminContainer">
      <LogoutButton variant="other"/>
      <AdminSidebar setSection={setSection} />

      <div className="adminMain">
        <div className="adminHeader">
          <h1 className="adminTitle">Admin Dashboard</h1>
        </div>

        <div className="adminSection">
          {section === "rooms" && <Rooms />}

          {section === "addRoom" && <AddRoom setSection={setSection} />}

          {section === "bookings" && <Bookings />}

          {section === "users" && <Users />}
        </div>
      </div>
    </div>
  );
}
