import { useState } from "react";
import axios from "axios";
import "./AuthLuxury.css";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const nav = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm({
      name: "",
      email: "",
      password: "",
    });
  }

  function showToast(message, type) {
    setToast(message);
    setToastType(type);

    setTimeout(() => {
      setToast("");
    }, 3000);
  }

  function validatePassword(password) {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return regex.test(password);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isLogin && !validatePassword(form.password)) {
      showToast(
        "Password must be 8+ characters, include a number & special character",
        "warning",
      );
      return;
    }

    try {
      let url = "";

      if (isLogin) {
        url = "http://localhost:5000/api/auth/login";
      } else {
        url = "http://localhost:5000/api/auth/signup";
      }

      const res = await axios.post(url, form);

      if (isLogin) {
        resetForm();

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("email", res.data.email);

        /* ADMIN LOGIN */
        if (res.data.role === "admin") {
          showToast("Welcome Admin 👑", "success");

          setTimeout(() => {
            nav("/admin");
          }, 1500);
        } else if (res.data.role === "reception") {
          /* RECEPTION LOGIN */
          showToast("Welcome Receptionist 🛎️", "success");

          setTimeout(() => {
            nav("/reception");
          }, 1500);
        } else {
          /* USER LOGIN */
          showToast("Login successful", "success");

          setTimeout(() => {
            nav("/room");
          }, 1500);
        }
      } else {
        showToast("Account created successfully!", "success");

        resetForm();

        setTimeout(() => {
          setIsLogin(true);
        }, 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.msg || "Something went wrong", "error");
    }
  }

  return (
    <div className="luxury-container">
      {toast && <div className={`toast toast-${toastType}`}>{toast}</div>}

      <div className="luxury-card">
        <h1 className="brand">Ivory Crest</h1>

        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
        </form>

        <p className="switch">
          {isLogin ? "New to Ivory Crest?" : "Already a member?"}

          <span
            onClick={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
          >
            {isLogin ? " Create Account" : " Login"}
          </span>
        </p>

        <br />

        <p
          className="back"
          onClick={() => {
            nav("/");
          }}
        >
          back to home
        </p>
      </div>
    </div>
  );
}
