import { useState, useRef } from "react";
import NavMenu from "../components/NavMenu";
import { Link } from "react-router-dom";
import InfoCard from "../components/InfoCard";

function AccountManager() {
  const [menuOpen, setMenuOpen] = useState();

  const [active, setActive] = useState("profile");
  return (
    <>
      <div className="w-screen h-screen">
        {/* Navbar */}
        <div className="w-full h-[8%] bg-black text-white flex justify-between items-center px-5 py-3 relative z-50">
          <Link to={"/"}>
            <div className="font-semibold tracking-wider text-xl cursor-pointer">
              Voyago
            </div>
          </Link>

          <div className="hidden md:flex md:w-[40%] md:justify-end">
            <NavMenu />
          </div>

          {/* Hamburger */}
          <div
            className="flex flex-col items-end space-y-1.5 cursor-pointer md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span
              className={`h-0.5 bg-white w-6 rounded transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`h-0.5 bg-white w-4 rounded transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`h-0.5 bg-white w-6 rounded transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute top-[6%] left-0 w-full bg-black flex flex-col items-center py-5 z-50 md:hidden">
            <NavMenu />
          </div>
        )}
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
