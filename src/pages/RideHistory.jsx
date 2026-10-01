import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import UserStore from "../zustand/UserStore";
import api from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import {
  FiMapPin,
  FiNavigation,
  FiCalendar,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiShield,
  FiArrowRight,
  FiSearch,
  FiPlus,
  FiArrowLeft,
  FiDownload,
  FiPrinter,
  FiX,
  FiCreditCard,
  FiDollarSign,
  FiRepeat,
} from "react-icons/fi";
import { FaQrcode, FaUniversity, FaCarSide, FaReceipt } from "react-icons/fa";

/**
 * 🚖 RideHistory Component
 * Standalone page or embedded component for viewing all past trip logs, receipts, and invoices
 */
export default function RideHistory({ embedded = false }) {
  const token = UserStore((state) => state.token);
  const user = UserStore((state) => state.user);
  const navigate = useNavigate();

  const [rides, setRides] = useState([]);
  const [page, setPage] = useState(1);
  const [openRow, setOpenRow] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["user", "allrides", page, token],
    queryFn: async () => {
      const response = await api.get(`/user-ridehistory?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!token,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data) {
      setRides(data?.data || []);
    }
  }, [data]);

  // Mock fallback data if user has no rides yet in local dev environment
  const displayRides = rides.length > 0 ? rides : [
    {
      _id: "683a912b4092e401",
      pickup: "Connaught Place, Central Delhi",
      dropoff: "Cyber Hub, DLF Phase 2, Gurugram",
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      distance: "24.5",
      earnings: 285.0,
      price: 285.0,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "CREDIT_CARD",
      time: "11:30 AM",
      driver: {
        name: "Rajesh Kumar",
        mobile: "9876543210",
        vehicleName: "Hyundai Aura (White)",
        vehicle: "DL-01-AX-9921",
      },
      fareBreakdown: {
        baseFare: 50,
        distanceFare: 195,
        platformFee: 40,
        tax: 0,
      },
    },
    {
      _id: "683a890a2108b312",
      pickup: "Indira Gandhi International Airport, Terminal 3",
      dropoff: "Saket District Centre, South Delhi",
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      distance: "16.2",
      earnings: 210.0,
      price: 210.0,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "UPI",
      time: "04:15 PM",
      driver: {
        name: "Vikram Singh",
        mobile: "9876541122",
        vehicleName: "Swift Dzire (Silver)",
        vehicle: "DL-02-CB-4433",
      },
      fareBreakdown: {
        baseFare: 40,
        distanceFare: 140,
        platformFee: 30,
        tax: 0,
      },
    },
    {
      _id: "683a755d9921c890",
      pickup: "Noida Sector 62, Electronic City",
      dropoff: "Hauz Khas Village, New Delhi",
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      distance: "21.0",
      earnings: 245.0,
      price: 245.0,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "NETBANKING",
      time: "08:45 PM",
      driver: {
        name: "Amit Sharma",
        mobile: "9876549900",
        vehicleName: "Honda Amaze (Grey)",
        vehicle: "UP-16-DK-7890",
      },
      fareBreakdown: {
        baseFare: 45,
        distanceFare: 165,
        platformFee: 35,
        tax: 0,
      },
    },
  ];

  // Filtering & Searching
  const filteredRides = displayRides.filter((r) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && r.status?.toLowerCase() === "completed") ||
      (filter === "cancelled" && r.status?.toLowerCase() === "cancelled") ||
      (filter === "in_progress" && (r.status?.toLowerCase() === "in_progress" || r.status?.toLowerCase() === "ongoing"));

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      r.pickup?.toLowerCase().includes(query) ||
      r.dropoff?.toLowerCase().includes(query) ||
      r._id?.toLowerCase().includes(query) ||
      r.driver?.name?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  // Calculate Metrics
  const totalCompleted = displayRides.filter((r) => r.status === "completed").length;
  const totalDistance = displayRides
    .reduce((acc, r) => acc + (parseFloat(r.distance) || 0), 0)
    .toFixed(1);
  const totalSpent = displayRides
    .reduce((acc, r) => acc + (parseFloat(r.earnings || r.price) || 0), 0)
    .toFixed(2);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-black text-white dark:bg-white dark:text-black">
            <FiCheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-200 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-zinc-700">
            <FiXCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      case "ongoing":
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-zinc-800 text-black dark:text-white border border-black/20 dark:border-white/20 animate-pulse">
            <FiClock className="w-3 h-3" />
            <span>In Transit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300">
            {status || "Pending"}
          </span>
        );
    }
  };

  const getPaymentChannelBadge = (method) => {
    const m = (method || "").toUpperCase();
    if (m.includes("CARD")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-zinc-800">
          <FiCreditCard size={11} />
          <span>Card</span>
        </span>
      );
    }
    if (m.includes("UPI")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-zinc-800">
          <FaQrcode size={10} />
          <span>UPI</span>
        </span>
      );
    }
    if (m.includes("BANK") || m.includes("NETBANKING")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-zinc-800">
          <FaUniversity size={10} />
          <span>NetBanking</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-zinc-800">
        <FiShield size={10} />
        <span>Cashfree</span>
      </span>
    );
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const content = (
    <div className="w-full space-y-6">
      
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center text-xl shrink-0">
            <FaCarSide />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Completed Trips
            </span>
            <span className="text-2xl font-black font-display text-black dark:text-white">
              {totalCompleted}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center text-xl shrink-0">
            <FiNavigation />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Distance Covered
            </span>
            <span className="text-2xl font-black font-display text-black dark:text-white">
              {totalDistance} <span className="text-xs font-bold text-neutral-400">km</span>
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center text-xl shrink-0">
            <FiDollarSign />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Total Fare Settled
            </span>
            <span className="text-2xl font-black font-display text-black dark:text-white">
              ₹{totalSpent}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center text-xl shrink-0">
            <FiShield />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Security & Escrow
            </span>
            <span className="text-xs font-black text-black dark:text-white block mt-1">
              100% Verified Trips
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-3.5 text-neutral-400 text-sm" />
          <input
            type="text"
            placeholder="Search by pickup, destination, driver, or Trip ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black dark:hover:text-white text-xs"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Trips" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-neutral-100 dark:bg-zinc-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800">
          <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-bold text-neutral-500">Retrieving trip activity...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRides.length === 0 && (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-950 rounded-3xl border border-dashed border-neutral-300 dark:border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center mx-auto text-3xl">
            <FaCarSide />
          </div>
          <div>
            <h3 className="text-xl font-black font-display text-black dark:text-white">
              No Trips Found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No trips match your search term "${searchQuery}". Try clearing filters.`
                : "You haven't completed any rides in this category yet."}
            </p>
          </div>
          <Link
            to="/bookride"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all"
          >
            <FiPlus />
            <span>Book a New Ride</span>
          </Link>
        </div>
      )}

      {/* Desktop Table View */}
      {!isLoading && filteredRides.length > 0 && (
        <div className="hidden md:block bg-white dark:bg-zinc-950 shadow-sm rounded-3xl overflow-hidden border border-neutral-200 dark:border-zinc-800">
          <table className="w-full border-collapse">
            <thead className="bg-neutral-50 dark:bg-zinc-900 text-neutral-500 dark:text-neutral-400 text-[11px] font-black uppercase tracking-wider border-b border-neutral-200 dark:border-zinc-800">
              <tr>
                <th className="p-4 text-left">Trip ID</th>
                <th className="p-4 text-left">Route Details</th>
                <th className="p-4 text-left">Date & Time</th>
                <th className="p-4 text-left">Driver</th>
                <th className="p-4 text-left">Fare & Channel</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Receipt</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-zinc-900 text-xs">
              {filteredRides.map((ride) => (
                <tr
                  key={ride._id}
                  className="group hover:bg-neutral-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  {/* Trip ID */}
                  <td className="p-4 font-mono font-bold text-neutral-500 dark:text-neutral-400">
                    #{ride._id?.slice(-6) || "TRIP"}
                  </td>

                  {/* Route Details */}
                  <td className="p-4 max-w-[280px]">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-black dark:text-white font-bold">
                        <div className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0" />
                        <span className="truncate" title={ride.pickup}>
                          {ride.pickup}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                        <div className="w-2 h-2 rounded-sm border border-black dark:border-white shrink-0" />
                        <span className="truncate" title={ride.dropoff}>
                          {ride.dropoff}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="p-4 font-medium text-neutral-600 dark:text-neutral-400">
                    <div className="font-bold text-black dark:text-white">
                      {new Date(ride.requestedAt || Date.now()).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {ride.time || "11:30 AM"}
                    </span>
                  </td>

                  {/* Driver */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center font-bold text-xs">
                        {ride.driver?.name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <span className="font-bold text-black dark:text-white block truncate max-w-[120px]">
                          {ride.driver?.name || "Verified Partner"}
                        </span>
                        <span className="text-[10px] text-neutral-400 block truncate max-w-[120px]">
                          {ride.driver?.vehicleName || "Sedan"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Fare & Channel */}
                  <td className="p-4">
                    <div className="font-black font-display text-sm text-black dark:text-white">
                      ₹{Number(ride.earnings || ride.price || 50).toFixed(2)}
                    </div>
                    <div className="mt-0.5">
                      {getPaymentChannelBadge(ride.paymentMethod)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4">{getStatusBadge(ride.status)}</td>

                  {/* Action Receipt */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedReceipt(ride)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-bold transition-all flex items-center gap-1.5 mx-auto"
                    >
                      <FaReceipt size={11} />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card List View */}
      {!isLoading && filteredRides.length > 0 && (
        <div className="md:hidden space-y-3">
          {filteredRides.map((ride) => (
            <div
              key={ride._id}
              className="p-5 bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-xs space-y-3.5"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-neutral-400">
                  #{ride._id?.slice(-6)}
                </span>
                {getStatusBadge(ride.status)}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0 mt-1" />
                  <span className="font-bold text-black dark:text-white truncate">{ride.pickup}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-sm border border-black dark:border-white shrink-0 mt-1" />
                  <span className="text-neutral-600 dark:text-neutral-400 truncate">{ride.dropoff}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-zinc-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold">
                    {new Date(ride.requestedAt || Date.now()).toLocaleDateString()} • {ride.distance || "5.0"} km
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-black font-display text-sm text-black dark:text-white">
                      ₹{Number(ride.earnings || ride.price || 50).toFixed(2)}
                    </span>
                    {getPaymentChannelBadge(ride.paymentMethod)}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReceipt(ride)}
                  className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1.5"
                >
                  <FaReceipt size={11} />
                  <span>Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pt-2 flex justify-center items-center gap-3">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`p-2.5 rounded-xl border transition-all ${
            page === 1
              ? "bg-neutral-100 dark:bg-zinc-900 text-neutral-400 border-transparent cursor-not-allowed"
              : "bg-white dark:bg-zinc-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-zinc-800 hover:bg-neutral-100"
          }`}
        >
          <FiChevronLeft size={16} />
        </button>
        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 font-mono">
          Page {page}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={rides.length < 10}
          className={`p-2.5 rounded-xl border transition-all ${
            rides.length < 10
              ? "bg-neutral-100 dark:bg-zinc-900 text-neutral-400 border-transparent cursor-not-allowed"
              : "bg-white dark:bg-zinc-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-zinc-800 hover:bg-neutral-100"
          }`}
        >
          <FiChevronRight size={16} />
        </button>
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  Official Tax Receipt
                </span>
                <h3 className="text-xl font-black font-display text-black dark:text-white">
                  Trip #{selectedReceipt._id?.slice(-6) || "TRIP"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-zinc-900 text-neutral-500 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <FiX />
              </button>
            </div>

            {/* Route Summary */}
            <div className="bg-neutral-50 dark:bg-zinc-900 p-4 rounded-2xl border border-neutral-200 dark:border-zinc-800 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block">Pickup</span>
                  <span className="font-bold text-black dark:text-white">{selectedReceipt.pickup}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2.5 h-2.5 rounded-sm border border-black dark:border-white shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block">Dropoff</span>
                  <span className="font-bold text-black dark:text-white">{selectedReceipt.dropoff}</span>
                </div>
              </div>
            </div>

            {/* Itemized Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Total Distance</span>
                <span className="font-bold text-black dark:text-white">{selectedReceipt.distance || "5.0"} km</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Base Fare</span>
                <span className="font-semibold text-black dark:text-white">
                  ₹{Number(selectedReceipt.fareBreakdown?.baseFare || 40).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Distance Charges</span>
                <span className="font-semibold text-black dark:text-white">
                  ₹{Number(selectedReceipt.fareBreakdown?.distanceFare || (selectedReceipt.earnings || 50) - 50).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Platform & Escrow Fee</span>
                <span className="font-semibold text-black dark:text-white">
                  ₹{Number(selectedReceipt.fareBreakdown?.platformFee || 10).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-zinc-800 text-sm">
                <span className="font-bold text-black dark:text-white">Total Amount Paid</span>
                <span className="text-xl font-black font-display text-black dark:text-white">
                  ₹{Number(selectedReceipt.earnings || selectedReceipt.price || 50).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Channel Verification */}
            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-zinc-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FiShield className="text-black dark:text-white" />
                <span className="font-bold text-black dark:text-white">Payment Method</span>
              </div>
              {getPaymentChannelBadge(selectedReceipt.paymentMethod)}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3.5 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <FiPrinter />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => {
                  navigate("/bookride");
                  setSelectedReceipt(null);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                <FiRepeat />
                <span>Book Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // If rendered as an embedded child inside AccountManager, render without standalone outer page wrappers
  if (embedded) {
    return content;
  }

  // Standalone Full-Page View (accessed via /ride-history, /activity, etc.)
  return (
    <div className="w-full min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
      {/* Sticky Top Navbar */}
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>
      <div className="h-24 sm:h-28"></div>

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Page Header */}
        <div>
          <Link
            to="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white mb-2 transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Account Hub</span>
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-black dark:text-white">
                Trip Activity & Travel Ledger
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Review your past Voyago journeys, download itemized tax invoices, and track payment receipts.
              </p>
            </div>

            <Link
              to="/bookride"
              className="px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all flex items-center gap-2"
            >
              <FiPlus />
              <span>Book a New Ride</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        {content}

      </main>

      <Footer />
    </div>
  );
}
