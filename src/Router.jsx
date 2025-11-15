import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RideBooking from "./pages/RideBooking";
import io from "socket.io-client"
import { useEffect, useRef, useState } from "react";

import AccountManager from "./pages/AccountManager";

const baseUrl = "https://backend-uber-model.onrender.com" //"http://localhost:8080"

function Router() {
  const socketRef = useRef();
  
  useEffect(() => {
    socketRef.current=io(baseUrl,{
      transports: ["websocket"],
      reconnection: true,
    })

    socketRef.current.on("connect",()=>{
      console.log("connected to Socket.IO: ",socketRef.current.id);
    })

    socketRef.current.on("disconnecte",()=>{
      console.log("Disconnected from socket.IO");
    })
  }, [socketRef])
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookride" element={<RideBooking socketRef={socketRef}  />}/>
          <Route path="/account" element={<AccountManager />} />
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
