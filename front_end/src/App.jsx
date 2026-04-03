import { Routes, Route } from "react-router-dom";
import Auth from "./auth/Auth";
import Home from "./Home/Home";
import Rooms from "./Rooms/Rooms";
import Bookingform from "./Bookingform/Bookingform";
import Payment from "./Payment/Payment";
import Confirmation from "./Confirmation/Confirmation";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import Admin from "./Admin/Admin_main/Admin";
import ReceptionDashboard from "./reception/ReceptionDashboard";
// import Button from "./button/button";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/auth" element={<Auth />} />

        {/* USER PAGES */}

        <Route
          path="/room"
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Bookingform"
          element={
            <ProtectedRoute>
              <Bookingform />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Confirmation"
          element={
            <ProtectedRoute>
              <Confirmation />
            </ProtectedRoute>
          }
        />

        {/* ADMIN PAGE */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
        {/* reception PAGE */}
        <Route
          path="/reception"
          element={
            <ProtectedRoute>
              <ReceptionDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
