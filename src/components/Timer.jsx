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
    //   console.log("Ride status data: ", data);
      // TODO: Do something with the ride status data
      if(data.data?.status==="accepted" ){
        setRunning(false);
        toast.success("Your ride has been accepted!");
        setSelect("");
        navigate("/currentride");
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
    <div className={`${!running ?"-z-10" : "z-30"}  flex flex-col items-center justify-center bg-linear-to-b from-slate-50 to-slate-200 p-6`}>
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-slate-200 text-center">
        {/* Timer Display */}
        <div className="text-6xl font-bold text-slate-800 mb-6">
          {formatTime(seconds)}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 mb-6">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(seconds / duration) * 100}%` }}
          ></div>
        </div>

        {/* Status */}
        <div className="text-sm text-slate-600 mb-4">
          {running
            ? "Timer is running..."
            : seconds >= duration
            ? "Time's up!"
            : "Timer stopped."}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => setRunning((prev) => !prev)}
            className={`px-5 py-2 rounded-xl font-medium transition active:scale-95 ${
              running
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {running ? "Pause" : "Resume"}
          </button>
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}