import { useState } from "react";
import NavMenu from "./NavMenu";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-black text-white flex justify-between items-center px-5 py-4 relative z-50">
        <div className="font-semibold tracking-wider text-xl"><Link to="/">Voyago</Link></div>

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

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-[60px] left-0 w-full bg-black flex flex-col items-center py-5 z-50 md:hidden">
          <NavMenu />
        </div>
      )}
    </>
  );
};

export default Navbar;
