
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2>Ivory Crest</h2>
          <p>Experience luxury and comfort like never before.</p>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>
            <i className="fa-solid fa-location-dot"></i>{" "}
            Ahmedabad, Gujarat, India
          </p>
          <p>
            <i className="fa-solid fa-phone"></i> +91 90000 12345
          </p>
          <p>
            <i className="fa-solid fa-envelope"></i>{" "}
            <a
              style={{
                color: "#444444",
                textDecorationLine: "none",
              }}
              href="https://mail.google.com/mail/u/3/#inbox?compose=new"
            >
              ivorycrest@gmail.com
            </a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Ivory Crest Hotel. All Rights Reserved.
      </div>
    </footer>
  );
}
