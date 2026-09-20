import { useState } from "react";
import { FiNavigation, FiMapPin, FiCompass, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";

export default function LocationPicker({
  pickupRef,
  dropoffRef,
  suggestion = [],
  handleSelectPlace,
  fetchPlaces,
  showRoute,
  distance,
  setOpen,
}) {
  const [activeInput, setActiveInput] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (pickupRef.current) {
          pickupRef.current.location = { lat: latitude, lng: longitude };
          pickupRef.current.value = "Current Location (GPS)";
        }
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name && pickupRef.current) {
            pickupRef.current.value = data.display_name.split(",").slice(0, 3).join(",");
          }
        } catch (e) {}
        setIsLocating(false);
        toast.success("Location detected!");
        if (dropoffRef.current?.location) {
          showRoute();
        }
      },
      () => {
        setIsLocating(false);
        toast.error("Unable to retrieve GPS position.");
      }
    );
  };

  const quickPlaces = [
    { label: "City Center", query: "City Center" },
    { label: "Airport", query: "Airport Terminal" },
    { label: "Railway Station", query: "Central Railway Station" },
  ];

  const handleQuickPlaceClick = (query) => {
    if (dropoffRef.current) {
      dropoffRef.current.value = query;
      fetchPlaces(query, "dropoff");
      setActiveInput("dropoff");
    }
  };

  return (
    <div className="w-full relative space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-black dark:text-white">
          Where to?
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Set your route to see instant upfront pricing and driver ETAs.
        </p>
      </div>

      {/* Input Group */}
      <div className="space-y-3 relative">
        {/* Pickup Input Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 shadow-sm focus-within:border-black dark:focus-within:border-white transition-all flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 text-xs font-bold">
            <FiMapPin className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Pickup Point
            </label>
            <input
              type="text"
              placeholder="Enter pickup address..."
              ref={pickupRef}
              onFocus={() => setActiveInput("pickup")}
              className="w-full bg-transparent text-sm font-semibold text-black dark:text-white placeholder-neutral-400 outline-none"
              onChange={(e) => fetchPlaces(e.target.value, "pickup")}
            />
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            title="Use current GPS location"
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-zinc-700 shadow-sm border border-neutral-200 dark:border-zinc-700 transition-all text-xs flex items-center gap-1 shrink-0 active:scale-95"
          >
            <FiNavigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline font-bold text-[11px]">GPS</span>
          </button>
        </div>

        {/* Dropoff Input Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 shadow-sm focus-within:border-black dark:focus-within:border-white transition-all flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center shrink-0 text-xs font-bold">
            <FiNavigation className="w-4 h-4 rotate-45" />
          </div>
          <div className="grow min-w-0">
            <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Destination
            </label>
            <input
              type="text"
              placeholder="Where to?"
              ref={dropoffRef}
              onFocus={() => setActiveInput("dropoff")}
              className="w-full bg-transparent text-sm font-semibold text-black dark:text-white placeholder-neutral-400 outline-none"
              onChange={(e) => fetchPlaces(e.target.value, "dropoff")}
            />
          </div>
        </div>

        {/* Suggestions Autocomplete Floating Menu */}
        {suggestion.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-56 overflow-y-auto z-50 p-1 divide-y divide-neutral-100 dark:divide-zinc-800 animate-in fade-in slide-in-from-top-2 duration-150">
            {suggestion.map((place, idx) => (
              <div
                key={idx}
                className="px-3.5 py-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-start gap-3"
                onClick={() => {
                  handleSelectPlace(place);
                  setActiveInput(null);
                }}
              >
                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-zinc-800 text-black dark:text-white shrink-0 mt-0.5">
                  <FiMapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-black dark:text-white truncate">
                    {place.name.split(",")[0]}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {place.name.split(",").slice(1, 4).join(",")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Destination Chips */}
      <div className="space-y-2">
        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
          Frequent Destinations
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPlaces.map((place) => (
            <button
              key={place.label}
              type="button"
              onClick={() => handleQuickPlaceClick(place.query)}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-800 border border-neutral-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white transition-all active:scale-95"
            >
              <span>{place.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Distance & Calculated Route Summary */}
      {distance && (
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-black dark:text-white flex items-center justify-between">
          <div>
            <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">Distance</p>
            <p className="text-xl font-black font-display">
              {distance} km
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">Approx. Duration</p>
            <p className="text-sm font-bold">
              ~{Math.max(5, Math.round(parseFloat(distance) * 2.5))} mins
            </p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={showRoute}
        className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        <FiSearch className="w-4 h-4" />
        <span>Calculate Fare & Compare Tiers</span>
      </button>
    </div>
  );
}
