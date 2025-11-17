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
import { useEffect, useRef, useState } from "react";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { toast } from "react-toastify";
const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = defaultIcon;

// 🚗 Driver icon
const carIcon = new L.Icon({
  iconUrl:
    "https://images.vexels.com/media/users/3/127711/isolated/preview/384e0b3361d99d9c370b4037115324b9-flat-vintage-car-icon.png",
  iconSize: [35, 35],
  iconAnchor: [25, 55],
});

// 🧍 User icon
const userIcon = new L.Icon({
  iconUrl:
    "https://www.nicepng.com/png/full/128-1280406_view-user-icon-png-user-circle-icon-png.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ✅ Auto-center component
function MapAutoCenter({ location }) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    map.setView([location.lat, location.lng], 15, { animate: true });
  }, [location, map]);
  return null;
}

// 🟦 Fit bounds (User + Driver)
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const validPoints = points
      .filter((p) => p?.lat && p?.lng)
      .map((p) => [p.lat, p.lng]);

    if (validPoints.length >= 2) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

export default function CurrentRide({ socketRef }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [error, setError] = useState("");
  const [route, setRoute] = useState([]);

  // 🌍 Fetching user current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 🚗 Receive driver location via socket
  useEffect(() => {
    if (!socketRef.current) return;

    // Event from general driver updates
    socketRef.current.on("driver:location", (location) => {
      console.log("General driver location:", location);
      setDriverLocation(location);
    });

    // Event from ride page updates
    socketRef.current.on("driver:location:currentride", (location) => {
      console.log("Ridepage driver location:", location);
      setDriverLocation(location);
    });
  }, []);

  // console.log("Current Location:", currentLocation);
  // console.log("Driver Location:", driverLocation);
  const center = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : [20.5937, 78.9629];

  // 📌 Points for FitBounds
  const pointsForFit = [currentLocation, driverLocation].filter(Boolean);

  // show route
  const showRoute = async () => {
    const userLocation = currentLocation;
    const driverLoc = driverLocation;

    if (!userLocation || !driverLoc) {
      toast.error("User or Driver location is missing.");
      return;
    }
    try {
      const apiKey =
        "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM2OTg1ZDk4ZjVkNTQxMWU5OTAzZjVmMGNjMjZlYWIxIiwiaCI6Im11cm11cjY0In0=";
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${userLocation.lng},${userLocation.lat}&end=${driverLoc.lng},${driverLoc.lat}&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.features) {
        toast.error("No route found");
        return;
      }
      const coords = data.features[0].geometry.coordinates.map((c) => ({
        lat: c[1],
        lng: c[0],
      }));

      setRoute(coords);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch route. Please try again.");
    }
  };

  useEffect(() => {
    if (currentLocation && driverLocation) {
      showRoute();
    }
  }, [currentLocation, driverLocation]);

  return (
    <div className="w-screen h-80vh flex flex-col overflow-x-hidden bg-gray-50">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "80vh", width: "100vw" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-center user only */}
        {/* <MapAutoCenter location={currentLocation} /> */}

        {/* Auto-fit user + driver */}
        <FitBounds points={pointsForFit} />

        {/* 🧍 User Marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={userIcon}
          >
            <Popup>Your Current Location</Popup>
          </Marker>
        )}

        {/* 🚗 Driver Marker */}
        {driverLocation && (
          <Marker
            position={[driverLocation.lat, driverLocation.lng]}
            icon={carIcon}
          >
            <Popup>Driver's Current Location</Popup>
          </Marker>
        )}

        {/* 🛣 Route Line (User ↔ Driver) */}
        {route && route.length > 0 && (
          <Polyline positions={route} color="blue"weight={5}
              opacity={0.7} />
        )}
      </MapContainer>
    </div>
  );
}
