import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import UserStore from "../zustand/UserStore";
import api from "../api/axiosClient";
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
} from "react-icons/fi";

export default function RideHistory() {
  const [rides, setRides] = useState([]);
  const token = UserStore((state) => state.token);
  const [page, setPage] = useState(1);
  const [openRow, setOpenRow] = useState(null);
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["user", "allrides", page],
    queryFn: async () => {
      const response = await api.get(`/user-ridehistory?page=${page}&limit=6`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data) {
      setRides(data?.data || []);
    }
  }, [data]);

  const filteredRides = rides.filter((r) => {
    if (filter === "completed") return r.status?.toLowerCase() === "completed";
    if (filter === "cancelled") return r.status?.toLowerCase() === "cancelled";
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black">
            <FiCheckCircle className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-200 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-zinc-700">
            <FiXCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      case "ongoing":
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-zinc-800 text-black dark:text-white border border-black/20 dark:border-white/20 animate-pulse">
            <FiClock className="w-3.5 h-3.5" />
            <span>In Transit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-zinc-700">
            {status || "Pending"}
          </span>
        );
    }
  };

  if (isLoading && rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium text-neutral-500">Loading trip logs...</p>
      </div>
    );
  }

  if (!isLoading && rides.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-neutral-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-neutral-300 dark:border-zinc-800">
        <div className="w-14 h-14 rounded-2xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center mx-auto mb-3 text-2xl">
          <FiCalendar />
        </div>
        <h3 className="text-lg font-black font-display text-black dark:text-white">No Trips Recorded Yet</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
          You haven't taken any rides yet. Book your first ride to track live history and download receipts.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-2">
        {["all", "completed", "cancelled"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === tab
                ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                : "bg-neutral-100 dark:bg-zinc-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {tab} Rides
          </button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-zinc-950 shadow-sm rounded-2xl overflow-hidden border border-neutral-200 dark:border-zinc-800">
        <table className="w-full border-collapse">
          <thead className="bg-neutral-50 dark:bg-zinc-900 text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-zinc-800">
            <tr>
              <th className="p-4 text-left">Trip ID</th>
              <th className="p-4 text-left">Pickup & Dropoff</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Receipt</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 dark:divide-zinc-900">
            {filteredRides.map((ride) => (
              <tr key={ride._id} className="group hover:bg-neutral-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                <td className="p-4 text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">
                  #{ride._id.slice(-6)}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2 text-black dark:text-white font-semibold">
                      <div className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0" />
                      <span className="truncate max-w-[220px]" title={ride.pickup}>
                        {ride.pickup}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <div className="w-2 h-2 rounded-sm border border-black dark:border-white shrink-0" />
                      <span className="truncate max-w-[220px]" title={ride.dropoff}>
                        {ride.dropoff}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {new Date(ride.requestedAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="p-4">{getStatusBadge(ride.status)}</td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => setOpenRow(openRow === ride._id ? null : ride._id)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-neutral-500 dark:text-neutral-400"
                  >
                    {openRow === ride._id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded Details Drawer for Open Row */}
      {openRow && filteredRides.find((r) => r._id === openRow) && (
        (() => {
          const ride = filteredRides.find((r) => r._id === openRow);
          return (
            <div className="p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-neutral-50 dark:bg-zinc-900 rounded-xl border border-neutral-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Assigned Driver</span>
                <span className="font-bold text-black dark:text-white">{ride.driver?.name || "Verified Partner"}</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-zinc-900 rounded-xl border border-neutral-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Total Distance</span>
                <span className="font-bold text-black dark:text-white">{ride.distance || "5.0"} km</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-zinc-900 rounded-xl border border-neutral-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Fare Settled</span>
                <span className="font-black text-black dark:text-white">₹{ride.earnings || "85.00"}</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-zinc-900 rounded-xl border border-neutral-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Safety Clearance</span>
                <span className="font-bold text-black dark:text-white flex items-center gap-1">
                  <FiShield className="w-3.5 h-3.5" /> Voyago Shield
                </span>
              </div>
            </div>
          );
        })()
      )}

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {filteredRides.map((ride) => (
          <div
            key={ride._id}
            className="p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-neutral-400">
                #{ride._id.slice(-6)}
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

            <div className="pt-3 border-t border-neutral-100 dark:border-zinc-900 flex items-center justify-between text-xs text-neutral-500">
              <span>{new Date(ride.requestedAt || Date.now()).toLocaleDateString()}</span>
              <span className="font-black text-black dark:text-white">₹{ride.earnings || "85.00"} • {ride.distance || "5.0"} km</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pt-4 flex justify-center items-center gap-3">
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
        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
          Page {page}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={rides.length < 6}
          className={`p-2.5 rounded-xl border transition-all ${
            rides.length < 6
              ? "bg-neutral-100 dark:bg-zinc-900 text-neutral-400 border-transparent cursor-not-allowed"
              : "bg-white dark:bg-zinc-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-zinc-800 hover:bg-neutral-100"
          }`}
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
