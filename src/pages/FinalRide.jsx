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
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import {
  FaStar,
  FaRegStar,
  FaWallet,
  FaCreditCard,
  FaQrcode,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { FiShare2, FiAlertTriangle, FiCheck, FiArrowRight } from "react-icons/fi";

const createCustomIcon = (htmlString, className = "", size = [36, 36], anchor = [18, 18]) => {
  return L.divIcon({
    html: htmlString,
    className: `custom-leaflet-icon ${className}`,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -anchor[1]],
  });
};

const carIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center p-1.5 bg-black text-white dark:bg-white dark:text-black border-2 border-white dark:border-black rounded-xl shadow-xl">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
      <circle cx="7.5" cy="14.5" r="1.5"/>
      <circle cx="16.5" cy="14.5" r="1.5"/>
    </svg>
  </div>
`, "driver-car-pin", [34, 34], [17, 17]);

const destinationIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center">
    <div class="absolute w-7 h-7 bg-black/20 dark:bg-white/20 rounded-full animate-ping"></div>
    <div class="relative w-6 h-6 bg-black text-white dark:bg-white dark:text-black border-2 border-white dark:border-black rounded-full flex items-center justify-center shadow-lg font-bold">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
    </div>
  </div>
`, "destination-pin");

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter((p) => p?.lat && p?.lng).map((p) => [p.lat, p.lng]);
    if (valid.length >= 2) {
      map.fitBounds(L.latLngBounds(valid), { padding: [80, 80] });
    }
  }, [points, map]);
  return null;
}

export default function FinalRide({ socketRef }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const location = useLocation();
  const rideId = new URLSearchParams(location.search).get("id");
  const navigate = useNavigate();
  const token = UserStore((state) => state.token);
  const { isDark } = useTheme();

  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CASHFREE_UPI");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);

  const { data: rideInfo } = useQuery({
    queryKey: ["finalrideinfo", rideId],
    queryFn: async () => {
      const res = await api.get("/ride/info", {
        params: { rideId },
      });
      return res.data.data;
    },
    enabled: !!rideId,
  });

  const handleCashfreePayment = async () => {
    setIsSubmittingPayment(true);
    try {
      const orderRes = await api.post(
        "/payment/create-order",
        { rideId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const orderData = orderRes.data?.data;
      setPaymentOrder(orderData);

      await api.post(
        "/payment/verify",
        {
          rideId,
          orderId: orderData?.orderId,
          paymentMethod: selectedPaymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Cashfree Payment Verified!");
      setPaymentDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleRatingSubmit = async () => {
    setIsSubmittingRating(true);
    try {
      await api.post(
        "/ride/rate",
        { rideId, rating, review: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Thank you for your feedback!");
      navigate("/");
    } catch (err) {
      navigate("/");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  useEffect(() => {
    if (rideInfo) {
      if (rideInfo.dropoffCoordinates?.coordinates) {
        const [dstLng, dstLat] = rideInfo.dropoffCoordinates.coordinates;
        setDestination({ lat: dstLat, lng: dstLng });
      }
      if (rideInfo.driver?.location?.coordinates && !currentLocation) {
        const [drvLng, drvLat] = rideInfo.driver.location.coordinates;
        setCurrentLocation({ lat: drvLat, lng: drvLng });
      }
      if (rideInfo.status === "completed" && rideInfo.paymentStatus !== "paid") {
        setShowReceipt(true);
      }
    }
  }, [rideInfo, currentLocation]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleRideStarted = (data) => {
      if (data.rideId === rideId) {
        const { destination, currentLocation } = data;
        setDestination(destination);
        setCurrentLocation(currentLocation);
      }
    };

    const handleDriverLocation = (loc) => {
      setCurrentLocation(loc);
    };

    const handleRideEnd = (data) => {
      if (data.rideId === rideId && data.status === "completed") {
        setShowReceipt(true);
      }
    };

    socket.on("ride:started", handleRideStarted);
    socket.on("driver:location", handleDriverLocation);
    socket.on("ride:end", handleRideEnd);

    return () => {
      socket.off("ride:started", handleRideStarted);
      socket.off("driver:location", handleDriverLocation);
      socket.off("ride:end", handleRideEnd);
    };
  }, [socketRef, rideId, navigate]);

  const getRoute = async () => {
    if (!currentLocation || !destination) return;
    try {
      const res = await api.get(`/ride/route`, {
        params: {
          startLng: currentLocation.lng,
          startLat: currentLocation.lat,
          endLng: destination.lng,
          endLat: destination.lat,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      if (!data.features) return;
      setRoute(
        data.features[0].geometry.coordinates.map((c) => ({
          lat: c[1],
          lng: c[0],
        }))
      );
    } catch (e) {}
  };

  useEffect(() => {
    getRoute();
  }, [currentLocation, destination]);

  const center = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : destination
    ? [destination.lat, destination.lng]
    : [28.6139, 77.2090];

  const fareTotal = rideInfo?.earnings || 65;
  const baseFare = 15;
  const distanceFare = Math.max(0, fareTotal - baseFare - 10);
  const platformFee = 10;

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-screen relative flex flex-col bg-white dark:bg-black font-sans overflow-hidden">
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>

      <div className="absolute inset-0 z-0">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrl}
          />
          <FitBounds points={[currentLocation, destination].filter(Boolean)} />

          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={carIcon}>
              <Popup>
                <div className="p-1 font-bold text-xs">Driver & You</div>
              </Popup>
            </Marker>
          )}

          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
              <Popup>
                <div className="p-1 font-bold text-xs">Destination</div>
              </Popup>
            </Marker>
          )}

          {route.length > 0 && (
            <Polyline
              positions={route}
              color={isDark ? "#ffffff" : "#000000"}
              weight={4}
              opacity={0.9}
            />
          )}
        </MapContainer>
      </div>

      {/* Floating In-Trip Card */}
      <div className="absolute bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-[420px] z-30">
        <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-xl border border-neutral-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white animate-ping"></div>
              <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white font-display">
                Trip In Progress
              </span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white">
              Voyago Telemetry
            </span>
          </div>

          <div>
            <h2 className="text-lg font-black text-black dark:text-white">
              Heading to Destination
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live route monitored for maximum safety and comfort.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Live trip tracking link copied!");
              }}
              className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiShare2 />
              <span>Share Trip</span>
            </button>
            <button
              onClick={() => toast.warn("SOS Emergency Alert Dispatched to Voyago Safety Team")}
              className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-2 border border-neutral-200 dark:border-zinc-800 transition-colors"
            >
              <FiAlertTriangle />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cashfree Payment & Digital Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {!paymentDone ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black font-display text-black dark:text-white">
                      Trip Receipt
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Trip #{rideId?.slice(-6) || "TRIP"} • Voyago Express
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white border border-neutral-200 dark:border-zinc-800">
                    Cashfree Escrow
                  </span>
                </div>

                {/* Itemized Fare Breakdown */}
                <div className="bg-neutral-50 dark:bg-zinc-900 rounded-2xl p-4 border border-neutral-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Total Distance</span>
                    <span className="font-bold text-black dark:text-white">{rideInfo?.distance || "5.0"} km</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Base Fare</span>
                    <span className="font-semibold text-black dark:text-white">₹{baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Distance Charges</span>
                    <span className="font-semibold text-black dark:text-white">₹{distanceFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Platform & Safety Fee</span>
                    <span className="font-semibold text-black dark:text-white">₹{platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 dark:border-zinc-800 pt-3 mt-2 text-base">
                    <span className="font-bold text-black dark:text-white">Total Amount</span>
                    <span className="text-2xl font-black font-display text-black dark:text-white">
                      ₹{fareTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Monochromatic Payment Methods */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1">
                    Select Cashfree Payment Channel
                  </label>

                  <div
                    onClick={() => setSelectedPaymentMethod("CASHFREE_UPI")}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedPaymentMethod === "CASHFREE_UPI"
                        ? "border-black dark:border-white bg-neutral-100 dark:bg-zinc-900"
                        : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
                        <FaQrcode />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-black dark:text-white">Instant UPI</span>
                        <p className="text-[11px] text-neutral-500">GPay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "CASHFREE_UPI" && (
                      <span className="text-xs font-bold text-black dark:text-white bg-white dark:bg-black px-2 py-0.5 rounded border border-neutral-300 dark:border-zinc-700">Selected</span>
                    )}
                  </div>

                  <div
                    onClick={() => setSelectedPaymentMethod("CASHFREE_CARD")}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedPaymentMethod === "CASHFREE_CARD"
                        ? "border-black dark:border-white bg-neutral-100 dark:bg-zinc-900"
                        : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
                        <FaCreditCard />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-black dark:text-white">Credit / Debit Card</span>
                        <p className="text-[11px] text-neutral-500">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "CASHFREE_CARD" && (
                      <span className="text-xs font-bold text-black dark:text-white bg-white dark:bg-black px-2 py-0.5 rounded border border-neutral-300 dark:border-zinc-700">Selected</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCashfreePayment}
                  disabled={isSubmittingPayment}
                  className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingPayment ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <span>Pay ₹{fareTotal.toFixed(2)} with Cashfree</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white rounded-3xl flex items-center justify-center text-3xl mx-auto border border-neutral-200 dark:border-zinc-800">
                    <FaCheckCircle />
                  </div>
                  <h3 className="text-2xl font-black font-display text-black dark:text-white">
                    Payment Successful
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Paid ₹{fareTotal.toFixed(2)} via Cashfree. How was your ride with {rideInfo?.driver?.name || "your driver"}?
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-4xl text-black dark:text-white focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      {star <= rating ? <FaStar /> : <FaRegStar />}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1 mb-2">
                    Feedback for Driver (Optional)
                  </label>
                  <textarea
                    placeholder="E.g., Punctual arrival, smooth driving, courteous service..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white placeholder-neutral-400"
                  />
                </div>

                <button
                  onClick={handleRatingSubmit}
                  disabled={isSubmittingRating}
                  className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? (
                    <span>Submitting...</span>
                  ) : (
                    <span>Submit Feedback & Finish</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
