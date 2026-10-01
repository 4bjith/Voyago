import { useCallback, useEffect, useState } from "react";
import api from "../api/axiosClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import UserStore from "../zustand/UserStore";
import { FiX, FiShield } from "react-icons/fi";
import { FaCar } from "react-icons/fa";

export default function Timer({ setSelect, rideId, socketRef }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const duration = 45;
  const navigate = useNavigate();
  const token = UserStore((state) => state.token);

  const rideStatus = useCallback(async () => {
    if (!rideId) return;
    try {
      const res = await api.get("/ride/status", {
        params: { rideId },
      });
      const data = res.data;
      if (data.data?.status === "accepted") {
        setRunning(false);
        toast.success("Driver accepted your ride!");
        setSelect("");
        navigate(`/currentride?rideid=${rideId}`);
      } else if (data.data?.status === "cancelled") {
        setRunning(false);
        toast.error("Ride request was declined or timed out.");
        setSelect("");
      }
    } catch (error) {
      console.error("Error fetching ride status:", error);
    }
  }, [rideId, navigate, setSelect]);

  // Real-time socket listener for instant driver match
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !rideId) return;

    const handleStatusUpdate = (data) => {
      if (data?.rideId === rideId && data?.status === "accepted") {
        setRunning(false);
        toast.success(`Driver ${data.driver?.name || "Partner"} accepted your ride!`);
        setSelect("");
        navigate(`/currentride?rideid=${rideId}`);
      } else if (data?.rideId === rideId && data?.status === "cancelled") {
        setRunning(false);
        toast.error("Ride was cancelled.");
        setSelect("");
      }
    };

    socket.on("ride:status:update", handleStatusUpdate);
    return () => {
      socket.off("ride:status:update", handleStatusUpdate);
    };
  }, [socketRef, rideId, navigate, setSelect]);

  useEffect(() => {
    let interval;
    const triggerTimes = new Set([3, 6, 9, 12, 15, 18, 21, 24, 27, 30]);

    if (running) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (triggerTimes.has(next)) {
            rideStatus();
          }
          if (next >= duration) {
            clearInterval(interval);
            setRunning(false);
            return duration;
          }
          return next;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running, rideStatus, duration]);

  const handleCancel = async () => {
    setRunning(false);
    setSeconds(0);
    setSelect("");
    try {
      await api.put(
        "/ride/cancel",
        { rideId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info("Ride search cancelled.");
    } catch (err) {
      console.error("Failed to cancel ride request", err);
    }
  };

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const currentSeconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${currentSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`${
        !running ? "pointer-events-none opacity-0" : "opacity-100 z-[999]"
      } fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300 p-4`}
    >
      <div className="bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-sm flex flex-col items-center relative text-center">
        
        {/* Monochromatic Radar Node */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center animate-radar">
            <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-zinc-800 flex items-center justify-center animate-ping opacity-50"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg text-lg">
              <FaCar />
            </div>
          </div>
        </div>

        <h2 className="text-xl font-black font-display text-black dark:text-white mb-1">
          Finding Your Driver
        </h2>
        <div className="text-3xl font-black font-mono tracking-wider text-black dark:text-white my-2">
          {formatTime(seconds)}
        </div>

        <p className="text-xs text-neutral-500 min-h-[32px] flex items-center justify-center px-2">
          Contacting nearest verified drivers via automated cascade...
        </p>

        <div className="my-4 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-zinc-900 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
          <FiShield />
          <span>Voyago Telemetry Dispatch</span>
        </div>

        <button
          onClick={handleCancel}
          className="w-full py-3 rounded-2xl font-bold text-xs bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-zinc-800 transition-colors border border-neutral-200 dark:border-zinc-800 flex items-center justify-center gap-1.5 active:scale-95"
        >
          <FiX />
          <span>Cancel Search</span>
        </button>
      </div>
    </div>
  );
}
