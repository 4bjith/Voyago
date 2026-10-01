import { useEffect, useRef, useState } from "react";
import UserStore from "../zustand/UserStore";
import Navbar from "../components/Navbar";
import LocationPicker from "../components/LocationPicker";
import { toast } from "react-toastify";
import CurrentMap2 from "../components/CurrentMap2";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import Timer from "../components/Timer";
import Footer from "../components/Footer";
import FareEstimator from "../components/FareEstimator";
import { useNavigate } from "react-router-dom";

export default function RideBooking({ socketRef }) {
  const pickupRef = useRef();
  const dropoffRef = useRef();
  const [suggestion, setSuggestion] = useState([]);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [coords, setCoords] = useState(null);
  const [open, setOpen] = useState("");
  const [select, setSelect] = useState("");
  const token = UserStore((state) => state.token);
  const [rideId, setRideId] = useState(null);
  const navigate = useNavigate();

  // Active ride verification on mount
  const { data: activeRide } = useQuery({
    queryKey: ["activeRide", token],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await api.get("/ride/active", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.data;
      } catch (err) {
        return null;
      }
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (activeRide) {
      if (activeRide.status === "accepted") {
        navigate(`/currentride?rideid=${activeRide._id}`);
      } else if (activeRide.status === "in_progress") {
        navigate(`/finalride?id=${activeRide._id}`);
      } else if (activeRide.status === "requested") {
        setRideId(activeRide._id);
        setSelect("timer");
      }
    }
  }, [activeRide, navigate]);

  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
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

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(err)
        );
      }
    });
  };

  useEffect(() => {
    getCurrentLocation()
      .then((c) => {
        setCoords(c);
        if (pickupRef.current && !pickupRef.current.value) {
          pickupRef.current.location = { lat: c.latitude, lng: c.longitude };
          pickupRef.current.value = "Current Location";
        }
      })
      .catch((err) => console.log("Location not auto-fetched:", err));
  }, []);

  const showRoute = async () => {
    const pickupLocation = pickupRef.current?.location;
    const dropoffLocation = dropoffRef.current?.location;

    if (!pickupLocation || !dropoffLocation) {
      toast.error("Please specify both pickup and dropoff points.");
      return;
    }

    try {
      const res = await api.get(`/ride/route`, {
        params: {
          startLng: pickupLocation.lng,
          startLat: pickupLocation.lat,
          endLng: dropoffLocation.lng,
          endLat: dropoffLocation.lat,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      if (!data.features) {
        toast.error("No valid driving route found.");
        return;
      }

      const points = data.features[0].geometry.coordinates.map((c) => ({
        lat: c[1],
        lng: c[0],
      }));

      setRoute(points);
      const calculatedDist = calculateDistance(pickupLocation, dropoffLocation);
      setDistance(calculatedDist);
      toast.success(`Route plotted: ${calculatedDist} km`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate route polyline.");
    }
  };

  const fetchPlaces = async (query, type) => {
    if (query.length < 3) return;
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

  const handleSelectPlace = (place) => {
    if (place.type === "pickup") {
      pickupRef.current.value = place.name.split(",").slice(0, 3).join(",");
      pickupRef.current.location = { lat: place.lat, lng: place.lon };
    } else if (place.type === "dropoff") {
      dropoffRef.current.value = place.name.split(",").slice(0, 3).join(",");
      dropoffRef.current.location = { lat: place.lat, lng: place.lon };
    }

    if (pickupRef.current?.location && dropoffRef.current?.location) {
      showRoute();
    }

    setSuggestion([]);
  };

  const { data: nearbyData } = useQuery({
    queryKey: ["nearby", pickupRef.current?.location],
    queryFn: async () => {
      const pickupLocation = pickupRef.current?.location;
      if (!pickupLocation) return null;
      const res = await api.get(
        `/nearby?lat=${pickupLocation.lat}&lng=${pickupLocation.lng}`
      );
      return res.data;
    },
    enabled: !!coords,
  });

  useEffect(() => {
    if (nearbyData?.drivers) {
      setDrivers(nearbyData.drivers);
    }
  }, [nearbyData]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors font-sans overflow-x-hidden">
      
      {/* Floating Header */}
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>
      <div className="h-24"></div>

      {select === "timer" && (
        <Timer setSelect={setSelect} rideId={rideId} socketRef={socketRef} />
      )}

      {/* Main Responsive Grid Layout */}
      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Monochromatic Booking Studio */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-7 shadow-sm border border-neutral-200 dark:border-zinc-800 overflow-y-auto max-h-[calc(100vh-140px)]">
            <LocationPicker
              pickupRef={pickupRef}
              dropoffRef={dropoffRef}
              suggestion={suggestion}
              handleSelectPlace={handleSelectPlace}
              fetchPlaces={fetchPlaces}
              showRoute={showRoute}
              distance={distance}
              setOpen={setOpen}
            />

            {distance && (
              <FareEstimator
                distance={distance}
                pickupRef={pickupRef}
                dropoffRef={dropoffRef}
                setRideId={setRideId}
                setSelect={setSelect}
              />
            )}
          </div>

          {/* Right: Map Canvas */}
          <div className="lg:col-span-7 h-[480px] lg:h-[calc(100vh-140px)] min-h-[420px] sticky top-28 rounded-3xl overflow-hidden shadow-sm border border-neutral-200 dark:border-zinc-800">
            <CurrentMap2
              route={route}
              drivers={drivers}
              pickupLocation={pickupRef?.current?.location}
              dropoffLocation={dropoffRef?.current?.location}
              currentLocation={coords ? { lat: coords.latitude, lng: coords.longitude } : null}
              className="w-full h-full"
            />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
