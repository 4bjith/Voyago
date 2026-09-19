import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import { FaCalendarAlt, FaClock, FaCar, FaMotorcycle, FaRoute } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";

export default function FareEstimator({ distance, pickupRef, dropoffRef, setRideId, setSelect }) {
  const [selectedTier, setSelectedTier] = useState("Sedan");
  const [isScheduled, setIsScheduled] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [isRequesting, setIsRequesting] = useState(false);
  const token = UserStore((state) => state.token);

  // Fetch logged-in user info
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: !!token,
  });

  const userId = userData?.data?._id;

  // Fetch fare estimates
  const { data: estimatesData, isLoading } = useQuery({
    queryKey: ["fare-estimates", distance],
    queryFn: async () => {
      const res = await api.get(`/ride/fare-estimates?distance=${distance}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!distance && !!token,
  });

  const estimates = estimatesData?.estimates || [];

  const handleRequestRide = async () => {
    if (!pickupRef.current?.location || !dropoffRef.current?.location) {
      toast.error("Please specify pickup and dropoff locations.");
      return;
    }
    if (!userId) {
      toast.error("Please log in to book a ride.");
      return;
    }

    setIsRequesting(true);
    try {
      const res = await api.post("/bookride", {
        userId,
        pickup: pickupRef.current.value,
        dropoff: dropoffRef.current.value,
        pickupCoordinates: [pickupRef.current.location.lat, pickupRef.current.location.lng],
        dropoffCoordinates: [dropoffRef.current.location.lat, dropoffRef.current.location.lng],
        date: isScheduled ? date : new Date(),
        time: isScheduled ? time : new Date(),
        distance: parseFloat(distance),
        vehicleType: selectedTier,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.rideId) {
        setRideId(res.data.rideId);
        setSelect("timer");
        toast.success("Matching with the nearest driver...");
      }
    } catch (err) {
      console.error("Booking error:", err);
      const msg = err.response?.data?.message || "Failed to find driver. Please try again.";
      toast.error(msg);
    } finally {
      setIsRequesting(false);
    }
  };

  const getTierIcon = (type) => {
    switch (type) {
      case "Bike":
        return <FaMotorcycle className="text-2xl" />;
      case "SUV":
        return <FaCar className="text-3xl text-indigo-600 animate-pulse" />;
      default:
        return <FaCar className="text-2xl text-gray-800" />;
    }
  };

  if (!distance) return null;

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mt-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FaRoute className="text-gray-500" />
          <span>Select your ride</span>
        </h3>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {distance} km away
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {estimates.map((est) => {
            const isSelected = selectedTier === est.vehicleType;
            return (
              <div
                key={est.vehicleType}
                onClick={() => setSelectedTier(est.vehicleType)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-black bg-gray-50 shadow-md transform -translate-y-0.5"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                    {getTierIcon(est.vehicleType)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm md:text-base flex items-center gap-1.5">
                      {est.name}
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        {est.eta} min ETA
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{est.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-gray-900">${est.fare.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking schedule option */}
      <div className="border-t border-gray-100 pt-4 mb-6">
        <button
          onClick={() => setIsScheduled(!isScheduled)}
          className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1.5 transition-colors"
        >
          {isScheduled ? "✓ Scheduled trip" : "📅 Schedule for later"}
        </button>

        {isScheduled && (
          <div className="grid grid-cols-2 gap-4 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col">
              <label className="text-gray-500 text-[10px] uppercase font-bold mb-1 pl-1">Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 z-10" />
                <DatePicker
                  selected={date}
                  onChange={(d) => setDate(d)}
                  className="w-full bg-gray-50 text-gray-900 text-sm py-2.5 pl-9 pr-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                  dateFormat="MMM d, yyyy"
                  minDate={new Date()}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-500 text-[10px] uppercase font-bold mb-1 pl-1">Time</label>
              <div className="relative">
                <FaClock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 z-10" />
                <DatePicker
                  selected={time}
                  onChange={(t) => setTime(t)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="w-full bg-gray-50 text-gray-900 text-sm py-2.5 pl-9 pr-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleRequestRide}
        disabled={isRequesting || isLoading}
        className={`w-full py-4 rounded-2xl bg-black text-white font-bold text-sm tracking-wide shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
          isRequesting || isLoading ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isRequesting ? (
          <>
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Requesting Ride...</span>
          </>
        ) : (
          <span>Confirm Request ({selectedTier})</span>
        )}
      </button>
    </div>
  );
}
