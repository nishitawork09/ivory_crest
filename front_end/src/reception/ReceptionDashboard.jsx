import { useEffect, useState } from "react";
import axios from "axios";
import DashboardCards from "./components/DashboardCards/DashboardCards";
import WalkInForm from "./components/WalkInForm/WalkInForm";
import BookingTable from "./components/BookingTable/BookingTable";
import SearchBar from "./components/SearchBar/SearchBar";
import LogoutButton from "../Logout-btn/Logout-btn";
import "./ReceptionDashboard.css";

export default function ReceptionDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/reception/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const guestName = b.userId?.name || b.guestName || "";

    const matchesSearch = guestName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus = statusFilter === "" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="receptionLayout">
      <LogoutButton variant="other" />

      <div className="receptionContent">
        <h1>Reception Dashboard</h1>

        <DashboardCards bookings={bookings} />

        <WalkInForm refreshBookings={fetchBookings} />

        <SearchBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <BookingTable
          bookings={filteredBookings}
          refreshBookings={fetchBookings}
        />
      </div>
    </div>
  );
}
