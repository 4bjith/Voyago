import { MapContainer, TileLayer } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css";
import io from "socket.io-client"
import { useEffect, useRef, useState } from "react";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = defaultIcon;

// 🚗 Custom icon for driver (car)
const carIcon = new L.Icon({
  iconUrl:
    "https://images.vexels.com/media/users/3/127711/isolated/preview/384e0b3361d99d9c370b4037115324b9-flat-vintage-car-icon.png", // TODO: Add your car image URL here
  iconSize: [35, 35],
  iconAnchor: [25, 55],
});

// 🧍 Custom icon for user (pickup/current)
const userIcon = new L.Icon({
  iconUrl:
    "https://www.nicepng.com/png/full/128-1280406_view-user-icon-png-user-circle-icon-png.png", // TODO: Add user image URL here
  iconSize: [20, 20],
  iconAnchor: [25, 25],
});


function FitBounds({
  route,
  pickupLocation,
  dropoffLocation,
  currentLocation,
}) {
  const map = useMap();

  useEffect(() => {
    // Collect valid lat-lng points
    const validPoints = [
      ...(route?.filter((p) => p?.lat && p?.lng).map((p) => [p.lat, p.lng]) ||
        []),
      pickupLocation?.lat && pickupLocation?.lng
        ? [pickupLocation.lat, pickupLocation.lng]
        : null,
      dropoffLocation?.lat && dropoffLocation?.lng
        ? [dropoffLocation.lat, dropoffLocation.lng]
        : null,
      currentLocation?.lat && currentLocation?.lng
        ? [currentLocation.lat, currentLocation.lng]
        : null,
    ].filter(Boolean);

    if (validPoints.length >= 2) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (validPoints.length === 1) {
      map.flyTo(validPoints[0], 14, { animate: true });
    }
  }, [route, pickupLocation, dropoffLocation, currentLocation, map]);

  return null;
}

// 🚘 Utility component to keep the map centered on the moving driver
function FollowDriver({ driverLocation }) {
  const map = useMap();
  const prevLocation = useRef(null);

  useEffect(() => {
    if (!driverLocation) return;

    const prev = prevLocation.current;

    // Only pan if driver moved significantly
    if (
      !prev ||
      Math.abs(driverLocation.lat - prev.lat) > 0.0003 ||
      Math.abs(driverLocation.lng - prev.lng) > 0.0003
    ) {
      map.panTo([driverLocation.lat, driverLocation.lng], { animate: true });
      prevLocation.current = driverLocation;
    }
  }, [driverLocation, map]);

  return null;
}
export default function CurrentRide({ socketRef }) {
    const [currentLocation, setCurrentLocation] = useState(null);   
    const center = [20.5937, 78.9629]; // Default: India center (fallback)
    // const center = driverLocation
    // ? [driverLocation.lat, driverLocation.lng]
    // : currentLocation
    // ? [currentLocation.lat, currentLocation.lng]
    // : pickupLocation
    // ? [pickupLocation.lat, pickupLocation.lng]
    // : dropoffLocation
    // ? [dropoffLocation.lat, dropoffLocation.lng]
    // : [20.5937, 78.9629]; // Default: India center (fallback)

  return (
    <div className="w-screen h-80vh flex flex-col overflow-x-hidden bg-gray-50">

        <MapContainer 
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "80vh", width: "100vw" }}
      >
        {/* Map layers and markers go here */}
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

        {/* FitBounds and FollowDriver components go here */}
      </MapContainer>
    </div>
  )
}
