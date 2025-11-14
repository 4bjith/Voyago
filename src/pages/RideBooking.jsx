import { useEffect, useRef, useState } from "react";
import UserStore from "../zustand/UserStore";
import NavMenu from "../components/NavMenu";
import LocationPicker from "../components/LocationPicker";
import { toast } from "react-toastify";
import CurrentMap2 from "../components/CurrentMap2";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import DriverCards from "../components/DriverCards";
import RideForm from "../components/RideForm";

export default function RideBooking({ socketRef }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pickupRef = useRef();
  const dropoffRef = useRef();
  const [suggestion, setSuggestion] = useState([]);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [coords, setCoords] = useState(null); // ✅ store geolocation here

  const token = UserStore((state) => state.token);

  // ✅ Calculate distance (Haversine formula)
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

  // ✅ Get Current Location (async)
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  };

  // ✅ Fetch current coordinates once
  useEffect(() => {
    getCurrentLocation()
      .then(setCoords)
      .catch((err) => console.error("Error getting location:", err));
  }, []);

  // ✅ Show route
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

  // ✅ Fetch suggestions
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

  // ✅ Handle selection
  const handleSelectPlace = (place) => {
    if (place.type === "pickup") {
      pickupRef.current.value = place.name;
      pickupRef.current.location = { lat: place.lat, lng: place.lon };
    } else if (place.type === "dropoff") {
      dropoffRef.current.value = place.name;
      dropoffRef.current.location = { lat: place.lat, lng: place.lon };
    }

    if (pickupRef.current?.location && dropoffRef.current?.location) {
      showRoute();
    }

    setSuggestion([]);
  };

  // ✅ React Query: Fetch nearby drivers
  const {
    data: nearbyData,
    isLoading: loadingDrivers,
    error: driverError,
  } = useQuery({
    queryKey: ["nearbyDrivers", coords],
    queryFn: async () => {
      const res = await api.get(
        `/nearby?lat=${coords.latitude}&lng=${coords.longitude}`
      );
      return res.data;
    },
    enabled: !!coords,
  });

  // ✅ Update driver list when data changes
  useEffect(() => {
    if (nearbyData?.drivers) {
      setDrivers(nearbyData.drivers);
    }
  }, [nearbyData]);

  console.log("Drivers:", drivers);

  return (
    <div className="w-screen h-100vh flex flex-col overflow-x-hidden bg-gray-50">
      {/* Navbar */}
      <div className="w-full bg-black text-white flex justify-between items-center px-5 py-4 relative z-50">
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

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-[60px] left-0 w-full bg-black flex flex-col items-center py-5 z-50 md:hidden">
          <NavMenu />
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col-reverse md:flex-row grow overflow-hidden">
        {/* Left: Location Picker */}
        <div className="w-full md:w-[40%] bg-white p-6 overflow-y-auto max-h-[calc(100vh-64px)]">
          <LocationPicker
            pickupRef={pickupRef}
            dropoffRef={dropoffRef}
            suggestion={suggestion}
            handleSelectPlace={handleSelectPlace}
            fetchPlaces={fetchPlaces}
            showRoute={showRoute}
            distance={distance}
          />

         <div className=" w-full h-auto mt-8 ">
           {drivers
           .filter((d)=> d.status === "online")
           .map((items) => ( 
            <DriverCards
              name={items.name}
              mobile={items.mobile}
              profile={items.profileImg}
              vehicle={items.vehicle}
              licence={items.licence}
            />
          ))}
         </div>
         <div className="">
          <RideForm />
         </div>
        </div>

        {/* Right: Map */}
        <div className="w-full md:w-[58%] h-[50vh] md:h-auto overflow-hidden">
          <CurrentMap2 route={route} drivers={drivers} />
        </div>
      </div>
    </div>
  );
}
