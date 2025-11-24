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
      const {  status } = data;
      if(status === "in_progress"){
        // navigate to final ride page
        navigate(`/finalride?id=${rideId}`);
      }
    });
  }, [rideId, socketRef, currentLocation]);

  return (
    <div className="w-screen h-80vh flex flex-col bg-gray-50">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "80vh", width: "100vw" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <FitBounds
          points={[currentLocation, driverLocation].filter(Boolean)}
        />

        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={userIcon}
          >
            <Popup>You</Popup>
          </Marker>
        )}

        {driverLocation && (
          <Marker
            position={[driverLocation.lat, driverLocation.lng]}
            icon={carIcon}
          >
            <Popup>Driver</Popup>
          </Marker>
        )}

        {route.length > 0 && (
          <Polyline positions={route} color="blue" weight={5} opacity={0.7} />
        )}
      </MapContainer>

      <div className="h-20 flex justify-evenly items-center bg-green-900 text-yellow-400">
        <p>OTP: {rideInfo?.otp ?? "..."}</p>
        <p>Distance: {rideInfo?.distance ?? "..."} km</p>
        <p>Driver Name: {rideInfo?.driver?.name ?? "..."}</p>
      </div>
    </div>
  );
}
