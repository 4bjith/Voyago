import { CgClose } from "react-icons/cg";

export default function NavMenu() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-13 text-white text-lg font-medium">
        <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">Home</div>
        <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">Ride</div>
        <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">Account</div>
        <div className="hover:font-bold hover:border-b-2 border-white cursor-pointer">Log in</div>
      </div>
    </>
  );
}
