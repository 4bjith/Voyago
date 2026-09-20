import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import Logo from "../components/Logo";
import {
  FiLock,
  FiMail,
  FiArrowRight,
  FiActivity,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiDollarSign,
  FiShield,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiXCircle,
  FiTruck,
} from "react-icons/fi";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || null);
  const [email, setEmail] = useState("admin@voyago.com");
  const [password, setPassword] = useState("admin123");
  const [activeTab, setActiveTab] = useState("kyc");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/login", { email, password });
      const token = res.data?.token;
      setAdminToken(token);
      localStorage.setItem("adminToken", token);
      toast.success("Administrator Authenticated!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid Admin Credentials");
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem("adminToken");
    toast.info("Admin signed out");
  };

  const { data: metricsData, isLoading: loadingMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["adminMetrics", adminToken],
    queryFn: async () => {
      const res = await api.get("/admin/metrics", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return res.data?.data;
    },
    enabled: !!adminToken,
  });

  const { data: driversData, isLoading: loadingDrivers, refetch: refetchDrivers } = useQuery({
    queryKey: ["adminDrivers", adminToken],
    queryFn: async () => {
      const res = await api.get("/admin/drivers", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return res.data?.data;
    },
    enabled: !!adminToken,
  });

  const { data: liveRidesData, isLoading: loadingLiveRides, refetch: refetchLiveRides } = useQuery({
    queryKey: ["adminLiveRides", adminToken],
    queryFn: async () => {
      const res = await api.get("/admin/rides/live", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return res.data?.data;
    },
    enabled: !!adminToken,
    refetchInterval: 5000,
  });

  const kycMutation = useMutation({
    mutationFn: async ({ driverId, kycStatus, notes }) => {
      const res = await api.put(
        "/admin/driver/kyc",
        { driverId, kycStatus, notes },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "KYC updated successfully");
      queryClient.invalidateQueries(["adminDrivers"]);
      queryClient.invalidateQueries(["adminMetrics"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update KYC status");
    },
  });

  const filteredDrivers = driversData?.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.name?.toLowerCase().includes(term) ||
      d.email?.toLowerCase().includes(term) ||
      d.vehicle?.toLowerCase().includes(term) ||
      d.kycStatus?.toLowerCase().includes(term)
    );
  });

  if (!adminToken) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
        <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
          <Navbar />
        </div>
        <div className="h-28"></div>

        <main className="grow flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-sm border border-neutral-200 dark:border-zinc-800 p-8 max-w-md w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-2xl mx-auto font-black shadow-sm">
                <FiShield />
              </div>
              <h1 className="text-2xl font-black font-display">Voyago Command Portal</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Authorized administrator credentials required.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 pl-1">
                  Admin Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 pl-1">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Authorize Session</span>
                <FiArrowRight />
              </button>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>
      <div className="h-24"></div>

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Admin Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Command Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-black dark:text-white">
              Operations & KYC Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchMetrics();
                refetchDrivers();
                refetchLiveRides();
                toast.success("Metrics synchronized!");
              }}
              className="p-2.5 rounded-xl bg-neutral-100 dark:bg-zinc-900 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-zinc-800 transition-all text-xs flex items-center gap-1.5 font-bold"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-4 py-2.5 rounded-xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white hover:bg-neutral-300 dark:hover:bg-zinc-700 text-xs font-bold transition-all border border-neutral-300 dark:border-zinc-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase">Total Passengers</span>
              <FiUsers className="text-black dark:text-white" />
            </div>
            <p className="text-2xl font-black font-display text-black dark:text-white">
              {metricsData?.totalUsers || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase">Active Fleet</span>
              <FiTruck className="text-black dark:text-white" />
            </div>
            <p className="text-2xl font-black font-display text-black dark:text-white">
              {metricsData?.totalDrivers || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase">Completed Trips</span>
              <FiCheckCircle className="text-black dark:text-white" />
            </div>
            <p className="text-2xl font-black font-display text-black dark:text-white">
              {metricsData?.completedRides || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase">Platform Gross</span>
              <FiDollarSign className="text-black dark:text-white" />
            </div>
            <p className="text-2xl font-black font-display text-black dark:text-white">
              ₹{(metricsData?.totalRevenue || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: "kyc", label: "Driver KYC Vetting" },
              { id: "live", label: "Live Active Rides" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "bg-neutral-100 dark:bg-zinc-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "kyc" && (
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3.5 top-3 text-neutral-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search driver by name, plate..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          )}
        </div>

        {/* Tab 1: KYC Approvals */}
        {activeTab === "kyc" && (
          <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-sm border border-neutral-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-neutral-50 dark:bg-zinc-900 text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-4 text-left">Driver Name</th>
                    <th className="p-4 text-left">Vehicle Details</th>
                    <th className="p-4 text-left">License & Reg</th>
                    <th className="p-4 text-left">KYC Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-zinc-900 text-xs">
                  {filteredDrivers?.map((driver) => (
                    <tr key={driver._id} className="hover:bg-neutral-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-black dark:text-white">{driver.name}</div>
                        <div className="text-[11px] text-neutral-400">{driver.email} • {driver.mobile}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{driver.vehicleName || "Sedan"}</span>
                        <span className="block text-[11px] text-neutral-400 font-mono font-bold">Plate: {driver.vehicle}</span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-neutral-600 dark:text-neutral-300">
                        {driver.licence || "DL-992019"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                            driver.kycStatus === "approved"
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                              : driver.kycStatus === "rejected"
                              ? "bg-neutral-200 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-zinc-700"
                              : "bg-neutral-100 dark:bg-zinc-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-zinc-700"
                          }`}
                        >
                          {driver.kycStatus || "pending"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              kycMutation.mutate({
                                driverId: driver._id,
                                kycStatus: "approved",
                                notes: "Documents verified by Admin",
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                          >
                            <FiCheckCircle className="text-[10px]" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() =>
                              kycMutation.mutate({
                                driverId: driver._id,
                                kycStatus: "rejected",
                                notes: "Document scan unclear",
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-zinc-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 text-xs font-bold transition-all border border-neutral-200 dark:border-zinc-800"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Live Active Rides */}
        {activeTab === "live" && (
          <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-sm border border-neutral-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black font-display text-black dark:text-white">
                Live Active Trips In Transit
              </h3>
              <span className="text-[11px] font-bold text-neutral-400">Auto-refreshing every 5s</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveRidesData?.map((ride) => (
                <div
                  key={ride._id}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-neutral-400">#{ride._id.slice(-6)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black animate-pulse">
                      {ride.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">From: {ride.pickup}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 truncate">To: {ride.dropoff}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-200 dark:border-zinc-800 flex justify-between text-xs text-neutral-400">
                    <span>Driver: {ride.driver?.name || "Assigned"}</span>
                    <span className="font-black text-black dark:text-white">₹{ride.earnings || "0"}</span>
                  </div>
                </div>
              ))}

              {(!liveRidesData || liveRidesData.length === 0) && (
                <div className="col-span-full text-center py-12 text-neutral-400 text-xs">
                  No active rides currently in transit.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
