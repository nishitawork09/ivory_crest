import "./Amenities.css";

export default function Amenities() {
  return (
    <>
      <div className="amenities">
        <h2>Our Amenities</h2>

        <div className="amenities-container">
          <div className="amenity-card">
            <i className="fa-solid fa-wifi"></i>
            <h3>Free WiFi</h3>
            <p>High speed internet available in all rooms.</p>
          </div>

          <div className="amenity-card">
            <i className="fa-solid fa-person-swimming"></i>
            <h3>Swimming Pool</h3>
            <p>Enjoy our clean and relaxing pool area.</p>
          </div>

          <div className="amenity-card">
            <i className="fa-solid fa-utensils"></i>
            <h3>Restaurant</h3>
            <p>Delicious food and beverages available.</p>
          </div>

          <div className="amenity-card">
            <i className="fa-solid fa-square-parking"></i>
            <h3>Parking</h3>
            <p>Safe and secure parking for all guests.</p>
          </div>

          <div className="amenity-card">
            <i className="fa-solid fa-bell-concierge"></i>
            <h3>24/7 Room Service</h3>
            <p>Order food and services anytime during your stay.</p>
          </div>

          <div className="amenity-card">
            <i className="fa-solid fa-spa"></i>
            <h3>Spa & Wellness</h3>
            <p>Relax and rejuvenate with our spa services.</p>
          </div>

          <div className="amenity-card">
            <i className="fa-solid fa-taxi"></i>
            <h3>Airport Pickup</h3>
            <p>Convenient airport pickup and drop service.</p>
          </div>

          <div className="amenity-card">
            <i className="fa-solid fa-people-roof"></i>
            <h3>Conference Hall</h3>
            <p>Perfect space for meetings and business events.</p>
          </div>
        </div>
      </div>
    </>
  );
}
