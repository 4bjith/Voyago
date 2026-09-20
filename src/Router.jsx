import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RideBooking from "./pages/RideBooking";
import io from "socket.io-client";
import { useEffect, useRef } from "react";

import AccountManager from "./pages/AccountManager";
import CurrentRide from "./pages/CurrentRide";
import FinalRide from "./pages/FinalRide";
import ProfileImgUpdateForm from "./components/ProfileImageUpdateForm";
import RideHistory from "./pages/RideHistory";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import Wallet from "./pages/Wallet";
import HelpCenter from "./pages/HelpCenter";
import PaymentCallback from "./pages/PaymentCallback";

const baseUrl2 = "http://localhost:8080";

function Router() {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(baseUrl2, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to Socket.IO:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from Socket.IO");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookride" element={<RideBooking socketRef={socketRef} />} />
          <Route path="/account" element={<AccountManager />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/support" element={<HelpCenter />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/currentride" element={<CurrentRide socketRef={socketRef} />} />
          <Route path="/finalride" element={<FinalRide socketRef={socketRef} />} />
          <Route path="/payment/callback" element={<PaymentCallback socketRef={socketRef} />} />
          <Route path="/update/image" element={<ProfileImgUpdateForm />} />
          <Route path="/ride-history" element={<RideHistory />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
      </BrowserRouter>
    </>
  );
}

export default Router;
