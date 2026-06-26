import { useState } from "react";
import NavMenu from "./NavMenu";
import { Link } from "react-router-dom";

const Navbar = ({ isHero }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div
        className={`w-[95%] border rounded-xl backdrop-blur-2xl transition-colors duration-300
        ${isHero ? "text-white border-white bg-transparent" : "text-black border-black/20 bg-white/80"}
        flex justify-between items-center px-5 py-4 relative z-50`}
      >
        <div className="font-semibold tracking-wider text-xl">
          <Link to="/">Voyago</Link>
        </div>

        <div className="hidden w-[50%] md:flex md:w-[40%] md:justify-end">
          <NavMenu isHero={isHero} />
        </div>

        {/* Hamburger */}
        <div
          className="flex flex-col items-end space-y-1.5 cursor-pointer md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="h-0.5 bg-current w-6 rounded transition-all duration-300" />
          <span className="h-0.5 bg-current w-4 rounded transition-all duration-300" />
          <span className="h-0.5 bg-current w-6 rounded transition-all duration-300" />
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-full bg-black text-white flex flex-col items-center py-5 z-50 md:hidden">
          <NavMenu isHero />
        </div>
      )}
    </>
  );
};

export default Navbar;
