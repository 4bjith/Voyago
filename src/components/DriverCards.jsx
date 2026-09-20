import { FiStar, FiCheckCircle } from "react-icons/fi";

export default function DriverCards(props) {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md rounded-3xl p-5 border border-neutral-200 dark:border-zinc-800 transition-all duration-200 mb-4">
      {/* Profile Image */}
      <div className="w-20 h-20 shrink-0">
        <div className="w-full h-full rounded-2xl border border-neutral-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          {props.profile ? (
            <img
              src={props.profile}
              alt="Driver"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              className="w-full h-full object-cover"
              alt="Default"
            />
          )}
        </div>
      </div>

      {/* Driver Details */}
      <div className="flex flex-col items-center sm:items-start grow text-center sm:text-left">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-black font-display text-black dark:text-white">
            {props.name}
          </h3>
          <span className="text-black dark:text-white text-xs">
            <FiCheckCircle />
          </span>
        </div>

        <div className="flex items-center gap-1.5 my-1">
          <span className="text-black dark:text-white flex items-center text-xs">
            <FiStar className="fill-current" />
          </span>
          <span className="text-black dark:text-white text-xs font-bold">4.9</span>
          <span className="text-neutral-500 dark:text-neutral-400 text-xs">• {props.vehicle || "Sedan"}</span>
        </div>

        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-mono font-semibold">
          Plate: {props.licence || "DL-992019"}
        </p>
      </div>

      {/* Booking Button */}
      <div className="flex items-center justify-center shrink-0 w-full sm:w-auto">
        <button
          onClick={() => {
            props.setDriverInfo({
              name: props.name,
              id: props.id,
            });
            props.setOpen("rideForm");
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all"
        >
          Select Driver
        </button>
      </div>
    </div>
  );
}
