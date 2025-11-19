import { CgClose } from "react-icons/cg";
import UserStore from "../zustand/UserStore";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function NavMenu() {
  const token = UserStore((state) => state.token);
  const logout = UserStore((state) => state.logout);
  const handleLogout = async () => {
    logout();
    toast.success("Logged out successfully");
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-13 text-white text-lg font-medium">
        <Link to={"/"}>
          <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">
            Home
          </div>
        </Link>
        <Link to={"/bookride"}>
          <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">
            Ride
          </div>
        </Link>
        <Link to={"/account"}>
        <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">
          Account
        </div></Link>
        {token ? (
          <div onClick={handleLogout} className="hover:font-bold hover:border-b-2 border-white cursor-pointer">
            Log out
          </div>
        ) : (
          <Link to={"/login"}>
            <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">
              Log in
            </div>
          </Link>
        )}
      </div>
    </>
  );
}
