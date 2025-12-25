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

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";

const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = defaultIcon;

// Icons
const userIcon = new L.Icon({
  iconUrl:
    "https://www.nicepng.com/png/full/128-1280406_view-user-icon-png-user-circle-icon-png.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const carIcon = new L.Icon({
  iconUrl:
    "https://images.vexels.com/media/users/3/127711/isolated/preview/384e0b3361d99d9c370b4037115324b9-flat-vintage-car-icon.png",
  iconSize: [35, 35],
  iconAnchor: [25, 55],
});

// FitBounds
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const valid = points
      .filter((p) => p?.lat && p?.lng)
      .map((p) => [p.lat, p.lng]);

    if (valid.length >= 2) {
      const bounds = L.latLngBounds(valid);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

export default function CurrentRide({ socketRef }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [route, setRoute] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rideId = queryParams.get("rideid");

  const navigate = useNavigate();

  // Live user location
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
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Driver location from socket
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("driver:location", (loc) => {
      setDriverLocation(loc);
    });
  }, []);

  // Fetch route
  const getRoute = async () => {
    if (!currentLocation || !driverLocation) return;

    try {
      const apiKey =
        "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM2OTg1ZDk4ZjVkNTQxMWU5OTAzZjVmMGNjMjZlYWIxIiwiaCI6Im11cm11cjY0In0=";

      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${driverLocation.lng},${driverLocation.lat}&end=${currentLocation.lng},${currentLocation.lat}&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.features) return;

      const coords = data.features[0].geometry.coordinates.map((c) => ({
        lat: c[1],
        lng: c[0],
      }));

      setRoute(coords);
    } catch (e) {
      console.error(e);
      toast.error("Route fetch failed");
    }
  };

  useEffect(() => {
    getRoute();
  }, [currentLocation, driverLocation]);

  const center = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : [20.5937, 78.9629];

  // 🔥 FIXED REACT QUERY
  const { data: rideInfo } = useQuery({
    queryKey: ["ridedetails", rideId],
    queryFn: async () => {
      const res = await api.get("/ride/info", {
        params: { rideId },
      });

      return res.data.data; // backend returns { message, data }
    },
    enabled: !!rideId,
  });

  useEffect(() => {
    socketRef.current?.on("ride:status", (data) => {
      const { status } = data;
      if (status === "in_progress") {
        // navigate to final ride page
        navigate(`/finalride?id=${rideId}`);
      }
    });
  }, [rideId, socketRef, currentLocation]);

  return (
    <div className="w-full h-screen flex flex-col relative overflow-hidden bg-gray-50">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds points={[currentLocation, driverLocation].filter(Boolean)} />

          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
              <Popup>You</Popup>
            </Marker>
          )}

          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
              <Popup>Driver</Popup>
            </Marker>
          )}

          {route.length > 0 && (
            <Polyline positions={route} color="black" weight={4} opacity={0.8} />
          )}
        </MapContainer>
      </div>

      {/* Floating Info Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-2">

          {/* Driver Info Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                {/* Placeholder or actual driver image */}
                <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Driver" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{rideInfo?.driver?.name || "Driver"}</h2>
                <p className="text-gray-500 text-sm">★ 4.9 • {rideInfo?.driver?.vehicleName || "Sedan"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Vehicle No</p>
              <p className="text-lg font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md mt-1">{rideInfo?.driver?.vehicle || "SH-X55"}</p>
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* OTP Section */}
          <div className="flex items-center justify-between bg-green-50 rounded-xl p-4 border border-green-100">
            <div>
              <p className="text-green-800 text-sm font-medium mb-1">Share this OTP with driver</p>
              <p className="text-green-600 text-xs">To start your ride securely</p>
            </div>
            <div className="text-4xl font-mono font-bold text-green-700 tracking-widest">
              {rideInfo?.otp || "...."}
            </div>
          </div>
        </div>

        <div className="bg-black text-white rounded-2xl p-4 text-center shadow-lg cursor-pointer active:scale-95 transition-transform" onClick={() => toast.info("Sharing functionality coming soon")}>
          Share Trip Status
        </div>
      </div>
    </div>
  );
}
