import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");

  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}
