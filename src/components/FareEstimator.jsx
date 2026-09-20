import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import { FaMotorcycle, FaCar, FaCarSide } from "react-icons/fa";
import { FiArrowRight, FiCalendar, FiShield, FiClock } from "react-icons/fi";
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

  const defaultEstimates = [
    {
      vehicleType: "Bike",
      name: "Voyago Moto",
      description: "Quick & agile bike for solo travel",
      capacity: "1 Rider",
      eta: 2,
      fare: Math.max(35, Math.round(parseFloat(distance || 5) * 8 + 20)),
    },
    {
      vehicleType: "Sedan",
      name: "Voyago Go Sedan",
      description: "Comfortable air-conditioned compacts",
      capacity: "4 Seats",
      eta: 3,
      fare: Math.max(70, Math.round(parseFloat(distance || 5) * 14 + 40)),
      popular: true,
    },
    {
      vehicleType: "SUV",
      name: "Voyago Max SUV",
      description: "Spacious 6-seater premium travel",
      capacity: "6 Seats",
      eta: 5,
      fare: Math.max(120, Math.round(parseFloat(distance || 5) * 22 + 60)),
    },
  ];

  const estimates = estimatesData?.estimates?.length ? estimatesData.estimates : defaultEstimates;

  const handleRequestRide = async () => {
    if (!pickupRef.current?.location || !dropoffRef.current?.location) {
      toast.error("Please specify both pickup and destination points.");
      return;
    }
    if (!token || !userId) {
      toast.info("Please sign in to confirm your ride request.");
      return;
    }

    setIsRequesting(true);
    try {
      const res = await api.post(
        "/bookride",
        {
          userId,
          pickup: pickupRef.current.value,
          dropoff: dropoffRef.current.value,
          pickupCoordinates: [pickupRef.current.location.lat, pickupRef.current.location.lng],
          dropoffCoordinates: [dropoffRef.current.location.lat, dropoffRef.current.location.lng],
          date: isScheduled ? date : new Date(),
          time: isScheduled ? time : new Date(),
          distance: parseFloat(distance),
          vehicleType: selectedTier,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && res.data.rideId) {
        setRideId(res.data.rideId);
        setSelect("timer");
        toast.success("Matching with nearest available driver...");
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || "Could not find nearby driver.");
    } finally {
      setIsRequesting(false);
    }
  };

  const renderTierIcon = (vehicleType) => {
    switch (vehicleType) {
      case "Bike":
        return <FaMotorcycle className="text-lg" />;
      case "SUV":
        return <FaCarSide className="text-xl" />;
      default:
        return <FaCar className="text-lg" />;
    }
  };

  if (!distance) return null;

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800 p-5 sm:p-6 mt-6 transition-all shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-black font-display text-black dark:text-white">
            Select Your Ride
          </h3>
          <p className="text-xs text-neutral-500">Transparent upfront pricing</p>
        </div>
        <span className="text-xs font-black text-black dark:text-white bg-neutral-100 dark:bg-zinc-900 px-3 py-1 rounded-xl">
          {distance} km
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-neutral-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5 mb-5">
          {estimates.map((est) => {
            const isSelected = selectedTier === est.vehicleType;
            return (
              <div
                key={est.vehicleType}
                onClick={() => setSelectedTier(est.vehicleType)}
                className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-black dark:border-white bg-neutral-50 dark:bg-zinc-900 shadow-md scale-[1.01]"
                    : "border-neutral-200 dark:border-zinc-800 hover:border-neutral-400 bg-white dark:bg-zinc-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {renderTierIcon(est.vehicleType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-black dark:text-white text-sm">
                          {est.name}
                        </h4>
                        <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                          {est.eta || 3} min
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5 max-w-[180px] truncate">
                        {est.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black font-display text-black dark:text-white">
                      ₹{typeof est.fare === "number" ? est.fare.toFixed(2) : est.fare}
                    </span>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase">Upfront</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Option */}
      <div className="pt-3 border-t border-neutral-100 dark:border-zinc-900 mb-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsScheduled(!isScheduled)}
            className="text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <FiCalendar />
            <span>{isScheduled ? "✓ Scheduled Departure" : "Schedule for Later"}</span>
          </button>
          {isScheduled && (
            <button
              type="button"
              onClick={() => setIsScheduled(false)}
              className="text-[11px] text-neutral-400 hover:text-black font-semibold"
            >
              Reset
            </button>
          )}
        </div>

        {isScheduled && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-neutral-400 text-[10px] uppercase font-bold mb-1 block">Pick Date</label>
              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                className="w-full bg-neutral-50 dark:bg-zinc-900 text-black dark:text-white text-xs font-semibold py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-zinc-800 outline-none"
                dateFormat="MMM d, yyyy"
                minDate={new Date()}
              />
            </div>
            <div>
              <label className="text-neutral-400 text-[10px] uppercase font-bold mb-1 block">Pick Time</label>
              <DatePicker
                selected={time}
                onChange={(t) => setTime(t)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className="w-full bg-neutral-50 dark:bg-zinc-900 text-black dark:text-white text-xs font-semibold py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-zinc-800 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleRequestRide}
        disabled={isRequesting || isLoading}
        className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        {isRequesting ? (
          <>
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            <span>Contacting Drivers...</span>
          </>
        ) : (
          <>
            <span>Confirm Request ({selectedTier})</span>
            <FiArrowRight />
          </>
        )}
      </button>

      <div className="mt-3 text-center text-[10px] text-neutral-400 font-semibold flex items-center justify-center gap-1.5">
        <FiShield />
        <span>Cashfree Escrow Protected & Voyago Telemetry</span>
      </div>
    </div>
  );
}
