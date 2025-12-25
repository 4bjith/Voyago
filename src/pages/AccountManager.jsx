import { useState, useEffect } from "react";
import InfoCard from "../components/InfoCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";
import RideHistory from "./RideHistory";
import { FiUser, FiSettings, FiClock } from "react-icons/fi";

export default function AccountManager() {
  const [active, setActive] = useState("profile");
  const token = UserStore((state) => state.token);
  const [user, setUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["userinfo"],
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
    { id: "profile", label: "Profile Info", icon: <FiUser size={20} /> },
    { id: "preference", label: "Preferences", icon: <FiSettings size={20} /> },
    { id: "history", label: "Ride History", icon: <FiClock size={20} /> },
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100 bg-gray-900 text-white">
                <h2 className="text-lg font-bold">Account</h2>
                <p className="text-sm text-gray-400 mt-1">Manage your settings</p>
              </div>
              <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible p-2 gap-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${active === item.id
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grow">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {menuItems.find((item) => item.id === active)?.label}
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage your {menuItems.find((item) => item.id === active)?.label.toLowerCase()} here
                </p>
              </div>

              <div className="mt-6">
                {active === "profile" && user && <InfoCard user={user} />}
                {active === "preference" && (
                  <div className="text-center py-12 text-gray-500">
                    <FiSettings className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
                    <p>User preferences settings coming soon.</p>
                  </div>
                )}
                {active === "history" && <RideHistory />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
