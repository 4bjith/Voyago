import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  Marker,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// import default marker icons from leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// ✅ Set default leaflet marker icon
const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = defaultIcon;

// Car icon (for driver)
const carIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/743/743007.png", // Example car icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: iconShadow,
});

// User icon (for pickup)
const userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Example user icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: iconShadow,
});

// Utility component to fit map bound to all key points(route, pickup etc)
function FitBounds({
  route,
  pickupLocation,
  dropoffLocation,
  currentLocation,
}) {
  const map = useMap();

  useEffect(() => {
    // collect valid lat-lng points
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
  }, [route, pickupLocation, dropoffLocation, currentLocation]);
  return null;
}

// 🚗 Utility function to keep the map centered on moving driver
function FollowDriver({ driverLocation }) {
  const map = useMap();
  const prevLocation = useRef(null);

  useEffect(() => {
    if (!driverLocation) return;

    const prev = prevLocation.current;

    // Only pan if driver moved singnificantly
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

// Utility function to check valid lat/lng
function isValidLatLng(obj) {
  return (
    obj &&
    typeof obj.lat === "number" &&
    typeof obj.lng === "number" &&
    !isNaN(obj.lat) &&
    !isNaN(obj.lng)
  );
}

// Main
const CurrentMap = ({
  currentLocation, // User's current locationn
  driverLocation, // driver location
  pickupLocation, // pickup point
  dropoffLocation, // Dropoff Point
  route, // Array of route coordinates [{lat,lng}, ....]
}) => {
  //   const [driverLocation, setDriverLocation] = useState();

  // Defensive center calculation
  const center = isValidLatLng(driverLocation)
    ? [driverLocation.lat, driverLocation.lng]
    : isValidLatLng(currentLocation)
    ? [currentLocation.lat, currentLocation.lng]
    : isValidLatLng(pickupLocation)
    ? [pickupLocation.lat, pickupLocation.lng]
    : isValidLatLng(dropoffLocation)
    ? [dropoffLocation.lat, dropoffLocation.lng]
    : [20.5937, 78.9629]; // Default: India center

  return (
    <div className="overflow-hidden w-full ">
      {center ? (
        // Leaflet map container
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          className=" rounded-2xl z-10"
          style={{ height: "400px", width: "600px" }}
        >
          {/*  Base map tiles from OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* User Marker */}
          {isValidLatLng(currentLocation) && (
            <Marker position={[currentLocation.lat, currentLocation.lng]}>
              <Popup>User location</Popup>
            </Marker>
          )}

          {isValidLatLng(driverLocation) && (
            <Marker
              position={[driverLocation.lat, driverLocation.lng]}
              icon={carIcon}
            >
              <Popup>Driver 🚗</Popup>
            </Marker>
          )}

          {/* 🟢 Pickup marker */}
          {isValidLatLng(pickupLocation) && (
            <Marker
              position={[pickupLocation.lat, pickupLocation.lng]}
              icon={userIcon}
            >
              <Popup>Pickup</Popup>
            </Marker>
          )}

          {/* 🔴 Dropoff marker */}
          {isValidLatLng(dropoffLocation) && (
            <Marker position={[dropoffLocation.lat, dropoffLocation.lng]}>
              <Popup>Dropoff</Popup>
            </Marker>
          )}

          {/* 🛣️ Draw route polyline */}
          {route && route.length > 0 && (
            <Polyline
              positions={route.filter(isValidLatLng).map((p) => [p.lat, p.lng])}
              color="blue"
              weight={5}
              opacity={0.7}
            />
          )}
          {/* 📍 Auto-fit map to show all relevant points */}
          <FitBounds
            route={route}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            currentLocation={currentLocation}
          />

          {/* 🚘 Keep camera following driver */}
          <FollowDriver driverLocation={driverLocation} />
        </MapContainer>
      ) : (
        <div className="w-full h-full bg-gray-300 flex flex-col justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 text-gray-600 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <p>Loading map</p>
        </div>
      )}
    </div>
  );
};

export default CurrentMap;
