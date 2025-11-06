import { useRef, useState } from "react";
import UserStore from "../zustand/UserStore";
import NavMenu from "../components/NavMenu";
import CurrentMap from "../components/CurrentMap";
import LocationPicker from "../components/LocationPicker";
import { toast } from "react-toastify";

export default function RideBooking() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pickupRef = useRef();
  const dropoffRef = useRef();
  const [suggestion, setSuggestion] = useState([]);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);

  const token = UserStore((state) => state.token);

  // ✅ Calculate distance using Haversine formula
  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  // ✅ Fetch and display route on map
  const showRoute = async () => {
    const pickupLocation = pickupRef.current.location;
    const dropoffLocation = dropoffRef.current.location;

    if (!pickupLocation || !dropoffLocation) {
      toast.error("Please select both pickup and dropoff locations");
      return;
    }

    try {
      const apiKey =
        "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM2OTg1ZDk4ZjVkNTQxMWU5OTAzZjVmMGNjMjZlYWIxIiwiaCI6Im11cm11cjY0In0=";
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${pickupLocation.lng},${pickupLocation.lat}&end=${dropoffLocation.lng},${dropoffLocation.lat}&geometries=geojson`;
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
      setDistance(calculateDistance(pickupLocation, dropoffLocation));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch route. Please try again.");
    }
  };

  // ✅ Fetch place suggestions
  const fetchPlaces = async (query, type) => {
    if (!query.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      setSuggestion(
        data.map((place) => ({
          name: place.display_name,
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
          type,
        }))
      );
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  // ✅ Handle suggestion click
  const handleSelectPlace = (place) => {
    if (place.type === "pickup") {
      pickupRef.current.value = place.name;
      pickupRef.current.location = { lat: place.lat, lng: place.lon };
    } else if (place.type === "dropoff") {
      dropoffRef.current.value = place.name;
      dropoffRef.current.location = { lat: place.lat, lng: place.lon };
    }

    // Show route if both locations selected
    if (pickupRef.current?.location && dropoffRef.current?.location) {
      showRoute();
    }

    setSuggestion([]);
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Navbar */}
      <div className="w-full h-[14%] bg-black text-white flex justify-between items-center px-5 py-3 relative z-50">
        <div className="font-semibold tracking-wider text-xl">Voyago</div>

        <div className="hidden md:flex md:w-[40%] md:justify-end">
          <NavMenu />
        </div>

        {/* Hamburger */}
        <div
          className="flex flex-col items-end space-y-1.5 cursor-pointer md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span
            className={`h-0.5 bg-white w-6 rounded transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`h-0.5 bg-white w-4 rounded transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`h-0.5 bg-white w-6 rounded transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-[14%] left-0 w-full bg-black flex flex-col items-center py-5 z-50 md:hidden">
          <NavMenu />
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* Left: Location Picker (40%) */}
        <div className="w-full md:w-[40%] bg-white p-6 overflow-y-auto border-r">
          <LocationPicker
            pickupRef={pickupRef}
            dropoffRef={dropoffRef}
            suggestion={suggestion}
            handleSelectPlace={handleSelectPlace}
            fetchPlaces={fetchPlaces}
            showRoute={showRoute}
            distance={distance}
          />
        </div>

        {/* Right: Map (60%) */}
        <div className="w-full md:w-[60%] h-[50vh] md:h-auto relative">
          <CurrentMap route={route} />
        </div>
      </div>
    </div>
  );
}
