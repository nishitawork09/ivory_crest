import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  adminOnly = false,
  receptionOnly = false,
}) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/auth" />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" />;
  }

  if (receptionOnly && role !== "reception" && role !== "admin")
    return <Navigate to="/" />;

  return children;
}
