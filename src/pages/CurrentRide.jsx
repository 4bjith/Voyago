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

// Default marker icon fix
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
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

// FitBounds component
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
  const [route, setRoute] = useState([]);

  // Get user's live location
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCurrentLocation(coords);

        console.log("User location: ", currentLocation);
        // Send user location to server
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

  // Receive driver live location
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("driver:location", (location) => {
      setDriverLocation(location);
    });
  }, []);

  // Compute route between user & driver
  const getRoute = async () => {
    if (!currentLocation || !driverLocation) return;

    try {
      const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM2OTg1ZDk4ZjVkNTQxMWU5OTAzZjVmMGNjMjZlYWIxIiwiaCI6Im11cm11cjY0In0=";
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

  return (
    <div className="w-screen h-80vh flex flex-col bg-gray-50">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "80vh", width: "100vw" }}
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
          <Polyline positions={route} color="blue" weight={5} opacity={0.7} />
        )}
      </MapContainer>

      <div className="h-20 flex justify-evenly items-center bg-green-900 text-yellow-400">
        <p>OTP: </p>
        <p>Distance: </p>
        <p>Driver Name: </p>
      </div>
    </div>
  );
}
