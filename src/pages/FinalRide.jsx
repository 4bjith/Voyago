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
import {  useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom"

// Default marker icons
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";


const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = defaultIcon;


const carIcon = new L.Icon({
  iconUrl:
    "https://png.pngtree.com/png-vector/20221117/ourmid/pngtree-map-pinpoint-with-car-inside-color-icon-marker-pointer-isolated-vector-png-image_41730976.jpg",
  iconSize: [35, 35],
  iconAnchor: [25, 55],
});

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    const valid = points
      .filter((p) => p?.lat && p?.lng)
      .map((p) => [p.lat, p.lng]);

    if (valid.length >= 2) {
      map.fitBounds(L.latLngBounds(valid), { padding: [50, 50] });
    }
  }, [points]);

  return null;
}




export default function FinalRide({socketRef}) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [route, setRoute] = useState([]);
    const location = useLocation();
    const rideId = new URLSearchParams(location.search).get("id");
    const navigate = useNavigate();
    

    socketRef.current?.on("ride:started", (data) => {
        const { destination,currentLocation } = data;
        setDestination(destination);
        setCurrentLocation(currentLocation);
    });

    // Route drawing
  const getRoute = async () => {
    if (!currentLocation || !destination) return;

    try {
      const apiKey =
        "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM2OTg1ZDk4ZjVkNTQxMWU5OTAzZjVmMGNjMjZlYWIxIiwiaCI6Im11cm11cjY0In0=";
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${currentLocation.lng},${currentLocation.lat}&end=${destination.lng},${destination.lat}&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.features) return;

      setRoute(
        data.features[0].geometry.coordinates.map((c) => ({
          lat: c[1],
          lng: c[0],
        }))
      );
    } catch (e) {
      console.error(e);
      toast.error("Route fetch failed");
    }
  };
  useEffect(() => {
    getRoute();
  }, [currentLocation, destination]);

  const center = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : destination
    ? [destination.lat, destination.lng]
    : [20.5937, 78.9629];

   
  const handleEndRide = () => {
    if(!currentLocation || !destination) return;
    const distance = calculateDistance(currentLocation,destination);
    toast.success(`Ride Ended! Total Distance: ${distance} km`);
    console.log("Ride Ended",distance);
  };

  useEffect(() => {
  socketRef.current?.on("ride:end", (data) => {
    if (data.status === "completed") {
      toast.success("Ride completed! Thank you for using Voyago.");
      navigate("/");
    }
  });

  return () => {
    socketRef.current?.off("ride:end");
  };
}, []);
  
  return (<>
    <div className="w-full h-screen relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* <FitBounds points={[currentLocation, destination].filter(Boolean)} /> */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={carIcon}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}  
        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination</Popup>
          </Marker>
        )}  
        {route.length > 0 && <Polyline positions={route} weight={5} color="blue" />}
      </MapContainer>
       <div className="w-full h-[70px] fixed bottom-0 z-999 bg-white flex justify-center items-center">
        <button>End Ride</button>
      </div>
    </div>
     
    </>
  )
}
