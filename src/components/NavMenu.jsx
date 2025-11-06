import { CgClose } from "react-icons/cg";
import UserStore from "../zustand/UserStore";

export default function NavMenu() {
  const token = UserStore((state) => state.token)
  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-13 text-white text-lg font-medium">
        <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">Home</div>
        <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">Ride</div>
        <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">Account</div>
        {token ? (<div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">Log out</div>):(<div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">Log in</div>)}
      </div>
    </>
  );
}
