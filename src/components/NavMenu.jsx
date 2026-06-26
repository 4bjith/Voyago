import UserStore from "../zustand/UserStore";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function NavMenu({ isHero }) {
  const token = UserStore((state) => state.token);
  const logout = UserStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div
      className={`flex flex-col md:flex-row items-center gap-6 text-lg font-medium transition-colors duration-300
      ${isHero ? "text-white" : "text-black"}`}
    >
      <Link to="/">Home</Link>
      <Link to="/bookride">Ride</Link>
      <a href="http://localhost:5174/" target="_blank">Driver</a>
      <Link to="/account">Account</Link>

      {token ? (
        <button onClick={handleLogout}>Log out</button>
      ) : (
        <Link to="/login">Log in</Link>
      )}
    </div>
  );
}
