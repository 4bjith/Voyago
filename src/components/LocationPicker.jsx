import { FaDotCircle } from "react-icons/fa";
import { FiNavigation } from "react-icons/fi";
import { TbSquareDotFilled } from "react-icons/tb";

export default function LocationPicker({
  pickupRef,
  dropoffRef,
  suggestion = [],
  handleSelectPlace,
  fetchPlaces,
  showRoute,
  distance,
}) {
  const handleBookRide = () => {
    alert("Ride booked! (Demo)");
  };

  return (
    <div className="w-full h-auto">
      <h1 className="text-[1.7rem] font-semibold pt-2 mb-4">
        Go anywhere with{" "}
        <span className="font-bold tracking-wider text-[1.8rem] text-black">
          Voyago
        </span>
      </h1>
      <p className="text-[0.95rem] text-gray-600 tracking-wide mb-6 leading-relaxed">
        Discover the convenience of Voyago. Request a ride now, or schedule one
        for later — all in just a few clicks.
      </p>

      {/* Pickup Input */}
      <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4 w-full shadow-sm mb-6 relative">
        <div className="flex items-center space-x-3 w-full">
          <div className="flex flex-col items-center relative">
            <FaDotCircle className="text-black text-xl" />
            <div className="w-0.5 h-[50px] bg-black absolute top-[22px]" />
          </div>

          <input
            type="text"
            placeholder="Pickup location"
            ref={pickupRef}
            className="bg-transparent outline-none text-gray-800 text-md w-full placeholder-gray-500"
            onChange={(e) => fetchPlaces(e.target.value, "pickup")}
          />
        </div>
        <FiNavigation className="text-black text-xl rotate-45" />
      </div>

      {/* Dropoff Input */}
      <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4 w-full shadow-sm mb-4 relative">
        <div className="flex items-center space-x-3 w-full">
          <TbSquareDotFilled className="text-black text-xl" />
          <input
            type="text"
            placeholder="Dropoff location"
            ref={dropoffRef}
            className="bg-transparent outline-none text-gray-800 text-md w-full placeholder-gray-500"
            onChange={(e) => fetchPlaces(e.target.value, "dropoff")}
          />
        </div>
      </div>

      {/* Suggestions */}
      {suggestion.length > 0 && (
        <div className="bg-white border rounded-lg shadow-md mt-2 mb-3 max-h-48 overflow-y-auto z-10">
          {suggestion.map((place, idx) => (
            <div
              key={idx}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
              onClick={() => handleSelectPlace(place)}
            >
              {place.name}
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mt-6">
        <button
          className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-800 transition"
          onClick={showRoute}
        >
          Show Route
        </button>
        <button
          className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-700 transition"
          onClick={handleBookRide}
        >
          Book Ride
        </button>
      </div>

      {/* Distance Display */}
      {distance && (
        <div className="mt-6 text-lg font-medium text-gray-700 bg-gray-50 p-3 rounded-lg shadow-sm text-center">
          Distance: {distance} km
        </div>
      )}
    </div>
  );
}
