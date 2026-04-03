import { useState } from "react";
import axios from "axios";
import "./A_AddRoom.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function A_AddRoom({ setSection }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [img, setImg] = useState("");
  const [desc, setDesc] = useState("");

  const token = localStorage.getItem("token");

  const addRoom = async () => {
    // Validation
    if (!title || !price || !capacity || !img || !desc) {
      toast.warning("Please fill all fields");
      return;
    }

    const confirmAdd = window.confirm(
      "Are you sure you want to add this room?",
    );

    if (!confirmAdd) return;

    try {
      await axios.post(
        "http://localhost:5000/api/admin/rooms",
        { title, price, capacity, img, desc },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Room added successfully");

      setTimeout(() => {
        setSection("rooms");
      }, 1500);
    } catch (err) {
      toast.error("Failed to add room");
    }
  };

  return (
    <div className="addRoomContainer">
      <ToastContainer position="top-right" autoClose={2000} />

      <h2 className="addRoomTitle">Add New Room</h2>

      <div className="addRoomForm">
        <input
          className="addRoomInput"
          placeholder="Room Title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="addRoomInput"
          placeholder="Price"
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          className="addRoomInput"
          placeholder="Capacity"
          onChange={(e) => setCapacity(e.target.value)}
        />

        <input
          className="addRoomInput"
          placeholder="Image URL"
          onChange={(e) => setImg(e.target.value)}
        />

        <textarea
          className="addRoomTextarea"
          placeholder="Room Description"
          onChange={(e) => setDesc(e.target.value)}
        />

        <button className="addRoomButton" onClick={addRoom}>
          Add Room
        </button>
      </div>
    </div>
  );
}
