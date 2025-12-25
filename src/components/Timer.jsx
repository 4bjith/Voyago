import { useCallback, useEffect, useState } from "react";
import api from "../api/axiosClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Timer({ setSelect, rideId }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const duration = 30;
  const navigate = useNavigate();

  console.log(rideId)
  const rideStatus = useCallback(async () => {
    try {
      const res = await api.get("/ride/status", {
        params: { rideId: rideId },
      });
      const data = res.data;
      if (data.data?.status === "accepted") {
        setRunning(false);
        toast.success("Your ride has been accepted!");
        setSelect("");
        navigate(`/currentride?rideid=${rideId}`);
      }
    } catch (error) {
      console.error("Error fetching ride status:", error);
    }
  }, [rideId]);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        rideStatus();
        setSeconds((prev) => {
          if (prev >= duration) {
            setRunning(false);
            clearInterval(interval);
            return duration;
          }
          return prev + 1;
        });
      }, 6000);
    }

    return () => clearInterval(interval);
  }, [running, rideStatus]);

  const handleReset = () => {
    setRunning(false);
    setSeconds(0);
    setSelect("");
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
      className={`${!running ? "pointer-events-none opacity-0" : "opacity-100 z-50"
        } fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300`}
    >
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-[90%] max-w-sm flex flex-col items-center relative animate-in fade-in zoom-in duration-300">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Finding your ride...
        </h2>

        {/* Circular Timer Visual */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * seconds) / duration}
              className="text-black transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-900 tabular-nums">
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        {/* Status Text */}
        <p className="text-gray-500 text-center mb-8 text-sm px-4">
          {running
            ? "Contacting nearby drivers..."
            : seconds >= duration
              ? "Taking longer than expected..."
              : "Search paused."}
        </p>

        {/* Controls */}
        <div className="flex gap-4 w-full">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  );
}