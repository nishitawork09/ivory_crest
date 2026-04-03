import { useEffect, useState } from "react";
import "./Ourrooms.css";
import { useNavigate } from "react-router-dom";

export default function Ourrooms({ showButton }) {
  const nav = useNavigate();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const checkin = localStorage.getItem("checkin");
    const checkout = localStorage.getItem("checkout");

    let url = "http://localhost:5000/api/rooms";

    if (checkin && checkout) {
      url = `http://localhost:5000/api/rooms/available?checkin=${checkin}&checkout=${checkout}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.price - b.price);
        setRooms(sorted);
      });
  }, []);

  function handleBooking(room) {
    // Save selected room
    localStorage.setItem("selectedRoom", JSON.stringify(room));

    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn) {
      nav("/Bookingform");
    } else {
      nav("/auth");
    }
  }

  return (
    <>
      <div className="section-title">
        <h3>Our Rooms</h3>
      </div>

      <div className="rooms-container">
        {rooms.map((room) => (
          <div className="room-card" key={room._id}>
            <img className="room-img" src={room.img} alt={room.title} />

            <div className="room-content">
              <h2 className="room-title">{room.title}</h2>
              <p className="room-desc">{room.desc}</p>
              <h3 className="room-price">₹{room.price} / night</h3>
              <p className="room-capacity">Guests: {room.capacity}</p>

              {showButton && (
                <button
                  className="book-btn"
                  onClick={() => handleBooking(room)}
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
