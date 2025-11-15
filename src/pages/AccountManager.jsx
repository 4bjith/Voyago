import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import InfoCard from "../components/InfoCard";
import Navbar from "../components/Navbar";

function AccountManager() {
  const [active, setActive] = useState("profile");
  return (
    <>
      <div className="w-screen h-screen">
        {/* Navbar */}
        <Navbar />
        {/* Body */}
        <div className="w-full h-auto  md:flex  ">
          <div className="w-full lg:w-[20%] md:w-[25%] h-[6vh] md:h-[92vh] bg-gray-100 flex  md:flex-col md:justify-start">
            <button
              onClick={() => setActive("profile")}
              className="px-10 py-2 focus:bg-gray-700 focus:text-white md:text-start"
            >
              Profile info
            </button>
            <button
              onClick={() => setActive("preference")}
              className="px-10 py-2 focus:bg-gray-700 focus:text-white md:text-start"
            >
              Preferences
            </button>
            <button
              onClick={() => setActive("history")}
              className="px-10 py-2 focus:bg-gray-700 focus:text-white md:text-start"
            >
              Ride history
            </button>
          </div>
          <div className="w-full lg:w-[80%] md:w-[75%] p-6 ">
            <h1 className="font-semibold text-xl">User Info</h1>
            <div className="w-full h-auto pt-4">
              {active === "profile" && <InfoCard />}
              {active === "history" && <h1> history</h1>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountManager;
