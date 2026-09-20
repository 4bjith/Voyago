import { useState, useEffect } from "react";
import InfoCard from "../components/InfoCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";
import RideHistory from "./RideHistory";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiSettings,
  FiClock,
  FiCreditCard,
  FiHelpCircle,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";

export default function AccountManager() {
  const [active, setActive] = useState("profile");
  const token = UserStore((state) => state.token);
  const [user, setUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["userinfo", token],
    queryFn: async () => {
      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data]);

  const menuItems = [
    { id: "profile", label: "Profile Info", icon: <FiUser size={18} /> },
    { id: "history", label: "Ride History", icon: <FiClock size={18} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-black">
        <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>
      <div className="h-24"></div>

      <div className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-72 shrink-0 space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-sm border border-neutral-200 dark:border-zinc-800 overflow-hidden sticky top-28">
              <div className="p-6 border-b border-neutral-100 dark:border-zinc-800 bg-black text-white">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  <FiShield />
                  <span>Passenger Account</span>
                </div>
                <h2 className="text-xl font-black font-display">{user?.name || "Account Hub"}</h2>
                <p className="text-xs text-neutral-400 mt-0.5 truncate">{user?.email}</p>
              </div>

              <nav className="p-3 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                      active === item.id
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                {/* Direct Links to Full Production Pages */}
                <Link
                  to="/wallet"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <FiCreditCard size={18} />
                    <span>Wallet & Cards</span>
                  </span>
                  <FiArrowRight className="w-3.5 h-3.5 opacity-50" />
                </Link>

                <Link
                  to="/settings"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <FiSettings size={18} />
                    <span>Settings</span>
                  </span>
                  <FiArrowRight className="w-3.5 h-3.5 opacity-50" />
                </Link>

                <Link
                  to="/support"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <FiHelpCircle size={18} />
                    <span>Help & FAQ</span>
                  </span>
                  <FiArrowRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grow w-full min-w-0">
            <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-sm border border-neutral-200 dark:border-zinc-800 min-h-[550px] p-6 sm:p-8">
              
              <div className="mb-6 border-b border-neutral-100 dark:border-zinc-800 pb-4">
                <h1 className="text-2xl sm:text-3xl font-black font-display text-black dark:text-white">
                  {menuItems.find((item) => item.id === active)?.label || "Overview"}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Manage your personal details and previous travel logs.
                </p>
              </div>

              {active === "profile" && user && <InfoCard user={user} />}
              {active === "history" && <RideHistory />}

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
