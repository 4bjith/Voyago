import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import UserStore from "../zustand/UserStore";
import Logo from "./Logo";
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiArrowRight,
  FiSettings,
  FiCreditCard,
  FiHelpCircle,
  FiClock,
  FiBriefcase,
} from "react-icons/fi";
import { toast } from "react-toastify";

export default function Navbar({ isHero = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const token = UserStore((state) => state.token);
  const user = UserStore((state) => state.user);
  const logout = UserStore((state) => state.logout);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate("/");
    setMenuOpen(false);
  };

  const navLinks = [
    { label: "Ride", path: "/bookride" },
    { label: "Activity", path: "/ride-history" },
    { label: "Wallet", path: "/wallet" },
    { label: "Support", path: "/support" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header
        className={`w-[94%] max-w-7xl mx-auto rounded-2xl transition-all duration-200 z-50 px-4 sm:px-6 py-3.5 flex items-center justify-between
          ${
            scrolled || !isHero
              ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-neutral-200 dark:border-zinc-800 shadow-sm"
              : "bg-white/80 dark:bg-black/80 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800/60"
          }`}
      >
        {/* Brand Logo */}
        <Logo to="/" size="md" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive(link.path)
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-zinc-900"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <a
            href="http://localhost:5174/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-all flex items-center gap-1.5"
          >
            <FiBriefcase className="text-xs" />
            <span>Driver Wing</span>
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-zinc-800 border border-neutral-200 dark:border-zinc-800 transition-all active:scale-95"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <FiSun className="w-4 h-4 text-white" /> : <FiMoon className="w-4 h-4 text-black" />}
          </button>

          {/* User Auth Controls */}
          {token ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/account"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-800 border border-neutral-200 dark:border-zinc-800 transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] font-black">
                  {user?.name ? user.name[0].toUpperCase() : <FiUser className="w-3 h-3" />}
                </div>
                <span className="text-xs font-bold text-black dark:text-white max-w-[90px] truncate">
                  {user?.name || "Account"}
                </span>
              </Link>
              <Link
                to="/settings"
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-800 border border-neutral-200 dark:border-zinc-800 text-black dark:text-white transition-all"
                title="Settings"
              >
                <FiSettings className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-all active:scale-95"
                title="Sign Out"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/bookride"
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-black shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Request Ride</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 rounded-xl md:hidden text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-x-4 top-20 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2 mb-6">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive("/")
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-900"
              }`}
            >
              <span>Home</span>
              <FiArrowRight className="w-4 h-4 opacity-70" />
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive(link.path)
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-900"
                }`}
              >
                <span>{link.label}</span>
                <FiArrowRight className="w-4 h-4 opacity-70" />
              </Link>
            ))}

            <Link
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive("/settings")
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <FiSettings />
                <span>Settings</span>
              </span>
              <FiArrowRight className="w-4 h-4 opacity-70" />
            </Link>

            <a
              href="http://localhost:5174/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-900"
            >
              <span className="flex items-center gap-2">
                <FiBriefcase />
                <span>Driver Wing</span>
              </span>
              <span className="text-[10px] uppercase font-bold bg-neutral-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-neutral-500">
                Portal
              </span>
            </a>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-zinc-800 flex flex-col gap-3">
            {token ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white font-bold text-center text-sm"
                >
                  Manage Account ({user?.name || "Profile"})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white font-bold text-center text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 rounded-xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white font-bold text-center text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-center text-sm shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
