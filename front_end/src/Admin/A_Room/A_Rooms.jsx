import { useEffect, useState } from "react";
import axios from "axios";
import "./A_Rooms.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function A_Rooms() {
  const [rooms, setRooms] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRooms(res.data);
    } catch (err) {
      toast.error("Failed to fetch rooms");
    }
  };

  const deleteRoom = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Room deleted successfully");

      fetchRooms();
    } catch (err) {
      toast.error("Error deleting room");
    }
  };

  const updateRoom = async (id) => {
    const newPrice = prompt("Enter new price");

    if (!newPrice) {
      toast.warning("Price cannot be empty");
      return;
    }

    const confirmUpdate = window.confirm(`Change room price to ₹${newPrice}?`);

    if (!confirmUpdate) return;

    try {
      await axios.put(
        `http://localhost:5000/api/admin/rooms/${id}`,
        { price: newPrice },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Room price updated");

      fetchRooms();
    } catch (err) {
      toast.error("Error updating room");
    }
  };

  return (
    <div className="roomsContainer">
      <ToastContainer position="top-right" autoClose={2000} />

      <h2 className="roomsTitle">Room Management</h2>

      <div className="roomsGrid">
        {rooms.map((room) => (
          <div key={room._id} className="roomCard">
            <img src={room.img} alt={room.title} className="roomImage" />

            <div className="roomContent">
              <h3 className="roomTitle">{room.title}</h3>

              <p className="roomDesc">{room.desc}</p>

              <p className="roomPrice">₹ {room.price}</p>

              <div className="roomButtons">
                <button
                  className="roomEditBtn"
                  onClick={() => updateRoom(room._id)}
                >
                  Edit
                </button>

                <button
                  className="roomDeleteBtn"
                  onClick={() => deleteRoom(room._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
