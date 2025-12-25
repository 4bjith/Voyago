import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import UserStore from "../zustand/UserStore";
import api from "../api/axiosClient";
import { FiMapPin, FiNavigation, FiCalendar, FiClock, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function RideHistory() {
  const [rides, setRides] = useState([]);
  const token = UserStore((state) => state.token);
  const [page, setPage] = useState(1);
  const [openRow, setOpenRow] = useState(null);

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading && rides.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isLoading && rides.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
          <FiCalendar size={48} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No rides found</h3>
        <p className="mt-1 text-gray-500">You haven't taken any rides yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 text-left font-medium">Ride ID</th>
              <th className="p-4 text-left font-medium">Route</th>
              <th className="p-4 text-left font-medium">Date</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-center font-medium">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rides.map((ride) => (
              <>
                <tr
                  key={ride._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="p-4 text-sm font-mono text-gray-500">
                    #{ride._id.slice(-6)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <FiMapPin className="text-green-600 shrink-0" size={14} />
                        <span className="truncate max-w-[200px]" title={ride.pickup}>{ride.pickup}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <FiNavigation className="text-red-600 shrink-0" size={14} />
                        <span className="truncate max-w-[200px]" title={ride.dropoff}>{ride.dropoff}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(ride.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        ride.status
                      )}`}
                    >
                      {ride.status}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        setOpenRow(openRow === ride._id ? null : ride._id)
                      }
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                      {openRow === ride._id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </td>
                </tr>

                {/* Expanded details */}
                {openRow === ride._id && (
                  <tr className="bg-gray-50/50">
                    <td colSpan={5} className="p-0">
                      <div className="p-6 grid grid-cols-2 gap-6 text-sm border-t border-gray-100 shadow-inner">
                        <div>
                          <p className="text-gray-500 mb-1">Driver</p>
                          <p className="font-medium text-gray-900">{ride.driver?.name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Distance</p>
                          <p className="font-medium text-gray-900">{ride.distance} km</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Requested At</p>
                          <p className="font-medium text-gray-900">{new Date(ride.requestedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Completed At</p>
                          <p className="font-medium text-gray-900">
                            {ride.completedAt ? new Date(ride.completedAt).toLocaleString() : "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {rides.map((ride) => (
          <div key={ride._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono text-gray-400">#{ride._id.slice(-6)}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  ride.status
                )}`}
              >
                {ride.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <FiMapPin className="text-green-600 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Pickup</p>
                  <p className="text-sm font-medium text-gray-900">{ride.pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiNavigation className="text-red-600 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Dropoff</p>
                  <p className="text-sm font-medium text-gray-900">{ride.dropoff}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FiCalendar />
                <span>{new Date(ride.requestedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{ride.distance} km</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`p-2 rounded-full border transition-colors ${page === 1
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-black"
            }`}
        >
          <FiChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={rides.length < 6} // Assuming limit is 6
          className={`p-2 rounded-full border transition-colors ${rides.length < 6
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-black"
            }`}
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
