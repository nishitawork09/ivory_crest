import { useNavigate } from "react-router-dom";
import "./Button.css";
export default function Button() {
  const nav = useNavigate();
  return (
    <>
      <button
        className="luxury-btn"
        type="button"
        onClick={() => {
          nav("/");
        }}
      >
        HOME
      </button>
    </>
  );
}
