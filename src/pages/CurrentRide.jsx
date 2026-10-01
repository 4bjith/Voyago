import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import {
  FiPhone,
  FiShare2,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiCopy,
} from "react-icons/fi";

const createCustomIcon = (htmlString, className = "", size = [36, 36], anchor = [18, 18]) => {
  return L.divIcon({
    html: htmlString,
    className: `custom-leaflet-icon ${className}`,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -anchor[1]],
  });
};

const userIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center">
    <div class="absolute w-7 h-7 bg-black/20 dark:bg-white/20 rounded-full animate-ping"></div>
    <div class="relative w-6 h-6 bg-black text-white dark:bg-white dark:text-black border-2 border-white dark:border-black rounded-full flex items-center justify-center shadow-lg font-bold">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 fill-current" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/></svg>
    </div>
  </div>
`, "user-pin");

const carIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center p-1.5 bg-black text-white dark:bg-white dark:text-black border-2 border-white dark:border-black rounded-xl shadow-xl">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
      <circle cx="7.5" cy="14.5" r="1.5"/>
      <circle cx="16.5" cy="14.5" r="1.5"/>
    </svg>
  </div>
`, "driver-car-pin", [34, 34], [17, 17]);

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const valid = points.filter((p) => p?.lat && p?.lng).map((p) => [p.lat, p.lng]);
    if (valid.length >= 2) {
      map.fitBounds(L.latLngBounds(valid), { padding: [80, 80], maxZoom: 16 });
    }
  }, [points, map]);
  return null;
}

export default function CurrentRide({ socketRef }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const token = UserStore((state) => state.token);
  const { isDark } = useTheme();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rideId = queryParams.get("rideid");
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCurrentLocation(coords);
        if (socketRef.current) {
          socketRef.current.emit("user:location:update", {
            coordinates: coords,
          });
        }
      },
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleDriverLocation = (loc) => setDriverLocation(loc);
    socket.on("driver:location", handleDriverLocation);
    return () => {
      socket.off("driver:location", handleDriverLocation);
    };
  }, [socketRef]);

  const getRoute = async () => {
    if (!currentLocation || !driverLocation) return;
    try {
      const res = await api.get(`/ride/route`, {
        params: {
          startLng: driverLocation.lng,
          startLat: driverLocation.lat,
          endLng: currentLocation.lng,
          endLat: currentLocation.lat,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      if (!data.features) return;
      setRoute(
        data.features[0].geometry.coordinates.map((c) => ({
          lat: c[1],
          lng: c[0],
        }))
      );
    } catch (e) {}
  };

  useEffect(() => {
    getRoute();
  }, [currentLocation, driverLocation]);

  const { data: rideInfo } = useQuery({
    queryKey: ["ridedetails", rideId],
    queryFn: async () => {
      const res = await api.get("/ride/info", {
        params: { rideId },
      });
      return res.data.data;
    },
    enabled: !!rideId,
  });

  useEffect(() => {
    if (rideInfo?.driver?.location?.coordinates && !driverLocation) {
      const [lng, lat] = rideInfo.driver.location.coordinates;
      if (lng && lat) {
        setDriverLocation({ lat, lng });
      }
    }
  }, [rideInfo, driverLocation]);

  useEffect(() => {
    if (rideInfo?.status === "in_progress") {
      navigate(`/finalride?id=${rideId}`);
    }
  }, [rideInfo, rideId, navigate]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleRideStatus = (data) => {
      if (data.status === "in_progress") {
        navigate(`/finalride?id=${rideId}`);
      }
    };
    socket.on("ride:status", handleRideStatus);
    return () => {
      socket.off("ride:status", handleRideStatus);
    };
  }, [rideId, socketRef, navigate]);

  const copyOtp = () => {
    if (rideInfo?.otp) {
      navigator.clipboard.writeText(rideInfo.otp.toString());
      setCopiedOtp(true);
      toast.success("OTP copied!");
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  const center = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : [28.6139, 77.2090];

  return (
    <div className="w-full h-screen relative flex flex-col overflow-hidden bg-white dark:bg-black font-sans">
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>

      <div className={`absolute inset-0 z-0 ${isDark ? "map-dark-filter" : ""}`}>
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
          <FitBounds points={[currentLocation, driverLocation].filter(Boolean)} />

          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="p-1 font-bold text-xs">Pickup Location</div>
              </Popup>
            </Marker>
          )}

          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
              <Popup>
                <div className="p-1 font-bold text-xs">Driver En Route</div>
              </Popup>
            </Marker>
          )}

          {route.length > 0 && (
            <Polyline
              positions={route}
              color={isDark ? "#ffffff" : "#000000"}
              weight={4}
              opacity={0.9}
            />
          )}
        </MapContainer>
      </div>

      {/* Floating Driver Arrival Dashboard */}
      <div className="absolute bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-[420px] z-30">
        <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-xl border border-neutral-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white animate-ping"></div>
              <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white font-display">
                Driver En Route
              </span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white">
              ~2-3 mins away
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 overflow-hidden shadow-sm shrink-0">
                <img
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  alt="Driver"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-black dark:text-white">
                  {rideInfo?.driver?.name || "Verified Driver"}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span className="font-bold">★ 4.9</span>
                  <span>•</span>
                  <span>{rideInfo?.driver?.vehicleName || "Sedan"}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                License Plate
              </span>
              <span className="inline-block px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white font-mono font-black text-xs sm:text-sm border border-neutral-200 dark:border-zinc-800">
                {rideInfo?.driver?.vehicle || "SH-X55"}
              </span>
            </div>
          </div>

          {/* Secure Monochromatic OTP Card */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white">
                <FiShield />
                <span>Start Ride OTP</span>
              </div>
              <p className="text-[11px] text-neutral-500">Share with driver to begin trip</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black font-mono tracking-widest text-black dark:text-white">
                {rideInfo?.otp || "----"}
              </span>
              <button
                onClick={copyOtp}
                title="Copy OTP"
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-neutral-100 shadow-sm border border-neutral-200 dark:border-zinc-700 active:scale-95 transition-all"
              >
                {copiedOtp ? <FiCheckCircle /> : <FiCopy />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => toast.info(`Calling driver: ${rideInfo?.driver?.mobile || "Simulated"}`)}
              className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-800 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiPhone />
              <span>Call Driver</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Live trip tracking link copied!");
              }}
              className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-800 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiShare2 />
              <span>Share ETA</span>
            </button>
          </div>

          <button
            onClick={() => toast.warn("SOS Emergency Alert Dispatched to Voyago Safety Command Center")}
            className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-2 border border-neutral-200 dark:border-zinc-800 transition-colors"
          >
            <FiAlertTriangle />
            <span>Voyago Emergency SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
