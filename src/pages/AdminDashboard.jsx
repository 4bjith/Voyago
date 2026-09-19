import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaTaxi,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaDollarSign,
  FaShieldAlt,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || null);
  const [email, setEmail] = useState("admin@voyago.com");
  const [password, setPassword] = useState("admin123");
  const [activeTab, setActiveTab] = useState("kyc"); // "kyc", "live", "disputes", "metrics"
  const [searchTerm, setSearchTerm] = useState("");

  // Admin Login Mutation
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/login", { email, password });
      const token = res.data?.token;
      setAdminToken(token);
      localStorage.setItem("adminToken", token);
      toast.success("Welcome, Administrator!");
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

  // Queries (only when adminToken is present)
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
    refetchInterval: 5000, // auto-refresh every 5s for live fleet monitoring
  });

  // KYC Approval / Rejection Mutation
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

  // Dispute Refund Mutation
  const disputeMutation = useMutation({
    mutationFn: async ({ rideId, reason }) => {
      const res = await api.post(
        "/admin/disputes",
        { rideId, reason, action: "refund" },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Dispute resolved and refund processed via Cashfree");
      queryClient.invalidateQueries(["adminLiveRides"]);
      queryClient.invalidateQueries(["adminMetrics"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to resolve dispute");
    },
  });

  if (!adminToken) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <div className="h-14 w-14 bg-black rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                <FaShieldAlt />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-gray-900 mb-1">Voyago Admin Portal</h2>
            <p className="text-sm text-center text-gray-500 mb-6">Enter administrative credentials to manage fleet and approvals.</p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95"
              >
                Access Admin Portal
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredDrivers = driversData?.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.name?.toLowerCase().includes(term) ||
      d.email?.toLowerCase().includes(term) ||
      d.licence?.toLowerCase().includes(term) ||
      d.vehicle?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 mt-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Operations Console</h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">Real-time driver verification, live trip dispatching, and Cashfree auditing.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchMetrics();
                refetchDrivers();
                refetchLiveRides();
                toast.info("Dashboard refreshed");
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <FaSyncAlt />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-all shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">₹{metricsData?.totalRevenue || 0}</h3>
              <p className="text-[11px] text-green-600 font-semibold mt-0.5">Platform Cut (20%): ₹{metricsData?.platformEarnings || 0}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl">
              <FaDollarSign />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending KYC</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{metricsData?.pendingKyc || 0}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Requires Verification</p>
            </div>
            <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
              <FaClock />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verified Drivers</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{metricsData?.verifiedDrivers || 0}</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{metricsData?.onlineDrivers || 0} Currently Online</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
              <FaTaxi />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Completed Rides</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{metricsData?.completedRides || 0}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{metricsData?.totalUsers || 0} Registered Users</p>
            </div>
            <div className="h-12 w-12 bg-gray-100 text-gray-800 rounded-xl flex items-center justify-center text-xl">
              <FaCheckCircle />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab("kyc")}
            className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "kyc"
                ? "border-black text-gray-950"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <span>Driver KYC Approvals</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
              {metricsData?.pendingKyc || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("live")}
            className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "live"
                ? "border-black text-gray-950"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <span>Live Fleet & Active Rides</span>
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">
              {liveRidesData?.length || 0}
            </span>
          </button>
        </div>

        {/* Tab 1: Driver KYC Approval Queue */}
        {activeTab === "kyc" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by driver name, email, license, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">Showing {filteredDrivers?.length || 0} registered drivers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Driver Details</th>
                    <th className="p-4">Vehicle Tier & Registration</th>
                    <th className="p-4">License Number</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">KYC State</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredDrivers?.map((driver) => (
                    <tr key={driver._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-sm">{driver.name}</div>
                        <div className="text-gray-400 text-xs">{driver.email} • {driver.mobile}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block bg-gray-100 px-2.5 py-1 rounded font-bold text-gray-800 text-[11px] mb-1">
                          {driver.vehicleType || "Sedan"}
                        </span>
                        <div className="text-gray-500 font-mono">{driver.vehicle} ({driver.vehicleName || "Fleet"})</div>
                      </td>
                      <td className="p-4 font-mono font-medium text-gray-700">
                        {driver.licence}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            driver.status === "online"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          ● {driver.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            driver.kycStatus === "verified"
                              ? "bg-green-100 text-green-800"
                              : driver.kycStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {driver.kycStatus?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {driver.kycStatus !== "verified" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => kycMutation.mutate({ driverId: driver._id, kycStatus: "verified" })}
                              disabled={kycMutation.isPending}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => kycMutation.mutate({ driverId: driver._id, kycStatus: "rejected" })}
                              disabled={kycMutation.isPending}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold text-xs transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => kycMutation.mutate({ driverId: driver._id, kycStatus: "pending" })}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium text-xs transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Live Fleet & Active Trips */}
        {activeTab === "live" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Active Fleet Dispatch Monitor</h3>
            {liveRidesData?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FaTaxi className="mx-auto text-3xl text-gray-300 mb-2" />
                <p className="text-gray-500 font-medium">No active trips currently in progress.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveRidesData?.map((ride) => (
                  <div key={ride._id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-400">Ride #{ride._id.slice(-6)}</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">
                        {ride.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-gray-900">
                        <strong className="text-gray-500">Passenger:</strong> {ride.passenger?.name || "N/A"} ({ride.passenger?.mobile})
                      </p>
                      <p className="text-gray-900">
                        <strong className="text-gray-500">Driver:</strong> {ride.driver?.name || "Unassigned"} ({ride.driver?.vehicle})
                      </p>
                      <p className="text-gray-700 truncate">
                        <strong className="text-gray-500">Route:</strong> {ride.pickup} → {ride.dropoff}
                      </p>
                      <p className="text-gray-700">
                        <strong className="text-gray-500">Fare:</strong> ₹{ride.earnings || 50} (OTP: <span className="font-mono font-bold text-green-700">{ride.otp}</span>)
                      </p>
                    </div>

                    <button
                      onClick={() => disputeMutation.mutate({ rideId: ride._id, reason: "Admin cancelled from live monitor" })}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors"
                    >
                      Emergency Cancel & Refund
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
