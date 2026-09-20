import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiEdit2, FiShield, FiSettings, FiCreditCard } from "react-icons/fi";

export default function InfoCard({ user }) {
  const profileImgSrc = user?.profileImg
    ? user.profileImg.startsWith("http")
      ? user.profileImg
      : `http://localhost:8080${user.profileImg}`
    : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-zinc-950 rounded-3xl shadow-sm overflow-hidden border border-neutral-200 dark:border-zinc-800 transition-all">
      {/* Header Monochromatic Banner */}
      <div className="h-32 sm:h-36 bg-black text-white p-6 flex justify-end items-start">
        <Link
          to="/update/image"
          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-zinc-700"
        >
          <FiEdit2 size={13} />
          <span>Change Avatar</span>
        </Link>
      </div>

      <div className="px-6 sm:px-8 pb-8">
        {/* Profile Image & Member Pill */}
        <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="relative">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl ring-4 ring-white dark:ring-zinc-950 shadow-md bg-neutral-100 dark:bg-zinc-900 overflow-hidden">
              <img
                src={profileImgSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <Link
              to="/update/image"
              className="absolute bottom-1 right-1 p-2 bg-black text-white dark:bg-white dark:text-black rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95"
              title="Update profile picture"
            >
              <FiEdit2 size={12} />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white text-xs font-bold border border-neutral-200 dark:border-zinc-800">
              Verified Passenger
            </span>
          </div>
        </div>

        {/* User Info Details */}
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black font-display text-black dark:text-white">
              {user?.name || "Passenger"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Voyago Member • Cashfree Escrow Verified
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-neutral-50 dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 flex items-center gap-4">
              <div className="p-3 bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white rounded-xl shrink-0">
                <FiMail size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-black dark:text-white font-bold text-xs sm:text-sm truncate" title={user?.email}>
                  {user?.email || "Not specified"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 flex items-center gap-4">
              <div className="p-3 bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white rounded-xl shrink-0">
                <FiPhone size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Mobile Number
                </p>
                <p className="text-black dark:text-white font-bold text-xs sm:text-sm">
                  {user?.mobile || "Not specified"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 flex items-center justify-between md:col-span-2">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white rounded-xl shrink-0">
                  <FiShield size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    Voyago Shield Telemetry
                  </p>
                  <p className="text-black dark:text-white font-bold text-xs sm:text-sm">
                    Active on all trips with OTP authorization
                  </p>
                </div>
              </div>
              <Link
                to="/settings"
                className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
