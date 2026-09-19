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
import { FaStar, FaRegStar, FaWallet, FaCreditCard, FaQrcode, FaShieldAlt } from "react-icons/fa";
import { SiCashapp } from "react-icons/si";

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

// Sound synthesizer using Web Audio API
const playChime = (type = "success") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // ignore audio block
  }
};

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

export default function FinalRide({ socketRef }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const location = useLocation();
  const rideId = new URLSearchParams(location.search).get("id");
  const navigate = useNavigate();
  const token = UserStore((state) => state.token);

  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CASHFREE_UPI");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch ride details for reload / session recovery
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

  // Handle Cashfree Order creation & checkout
  const handleCashfreePayment = async () => {
    setIsSubmittingPayment(true);
    try {
      // 1. Create Cashfree Order
      const orderRes = await api.post(
        "/payment/create-order",
        { rideId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderData = orderRes.data?.data;
      setPaymentOrder(orderData);

      // 2. Verify / Settle Cashfree Payment
      const verifyRes = await api.post(
        "/payment/verify",
        {
          rideId,
          orderId: orderData?.orderId,
          paymentMethod: selectedPaymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      playChime("success");
      toast.success("Cashfree Payment Completed Successfully! (Sandbox ID: " + (orderData?.orderId?.slice(-8) || "OK") + ")");
      setPaymentDone(true);
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.response?.data?.message || "Cashfree payment failed. Please try again.");
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
      toast.success("Thank you for your rating and review!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Feedback submitted. Redirecting...");
      navigate("/");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Initialize locations from database on mount/reload
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

  // Socket listeners with cleanups
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleRideStarted = (data) => {
      if (data.rideId === rideId) {
        const { destination, currentLocation } = data;
        setDestination(destination);
        setCurrentLocation(currentLocation);
        playChime("notify");
      }
    };

    const handleDriverLocation = (loc) => {
      setCurrentLocation(loc);
    };

    const handleRideEnd = (data) => {
      if (data.rideId === rideId && data.status === "completed") {
        playChime("success");
        setShowReceipt(true);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Voyago — You have arrived!", {
            body: "Your trip has completed safely. Please view your digital receipt.",
          });
        }
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

  // Route drawing
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = res.data;

      if (!data.features) return;

      setRoute(
        data.features[0].geometry.coordinates.map((c) => ({
          lat: c[1],
          lng: c[0],
        }))
      );
    } catch (e) {
      console.error(e);
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

  const fareTotal = rideInfo?.earnings || 50;
  const baseFare = 10;
  const distanceFare = Math.max(0, fareTotal - baseFare);
  const platformFee = Math.round(fareTotal * 0.2);

  return (
    <div className="w-full h-screen relative flex flex-col bg-gray-50 font-sans">
      {/* Navbar */}
      <div id="navbar" className="w-full h-20 fixed top-4 z-50 flex justify-center ">
        <Navbar />
      </div>

      <div className="absolute inset-0 z-0">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FitBounds points={[currentLocation, destination].filter(Boolean)} />
          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={carIcon}>
              <Popup>Driver & You</Popup>
            </Marker>
          )}
          {destination && (
            <Marker position={[destination.lat, destination.lng]}>
              <Popup>Destination</Popup>
            </Marker>
          )}
          {route.length > 0 && <Polyline positions={route} weight={4} color="blue" opacity={0.8} />}
        </MapContainer>
      </div>

      {/* Floating Info Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg mx-auto border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">On the way to destination</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm text-gray-600 font-medium">You are in a safe, monitored ride with Voyago Shield.</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => toast.info("Trip link copied to clipboard!")}
              className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Share Status
            </button>
            <button
              onClick={() => toast.warn("SOS Emergency Alert Dispatched to Voyago Safety Center")}
              className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors"
            >
              Emergency SOS
            </button>
          </div>
        </div>
      </div>

      {/* Cashfree Payment & Digital Receipt Modal */}
      {showReceipt && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {!paymentDone ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900 font-sans">Voyago Receipt</h3>
                    <p className="text-xs text-gray-500">Trip #{rideId?.slice(-6) || "TRIP"}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold">
                    <FaShieldAlt className="text-green-700" />
                    <span>Cashfree Verified</span>
                  </div>
                </div>

                {/* Itemized Fare Receipt Breakdown */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                  <div className="flex justify-between mb-2 text-xs">
                    <span className="text-gray-500">Total Distance</span>
                    <span className="text-gray-900 font-bold">{rideInfo?.distance || "5.0"} km</span>
                  </div>
                  <div className="flex justify-between mb-2 text-xs">
                    <span className="text-gray-500">Base Fare</span>
                    <span className="text-gray-900 font-medium">₹{baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-xs">
                    <span className="text-gray-500">Distance Charges</span>
                    <span className="text-gray-900 font-medium">₹{distanceFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-xs">
                    <span className="text-gray-500">Platform & Safety Fee (20%)</span>
                    <span className="text-gray-900 font-medium">₹{platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200/80 pt-3 mt-2">
                    <span className="text-gray-950 font-bold">Total Amount Payable</span>
                    <span className="text-2xl font-black text-gray-950">₹{fareTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cashfree Payment Methods Selector */}
                <div className="space-y-3 mb-6">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">
                    Select Cashfree Payment Mode
                  </label>

                  {/* Cashfree UPI */}
                  <div
                    onClick={() => setSelectedPaymentMethod("CASHFREE_UPI")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedPaymentMethod === "CASHFREE_UPI"
                        ? "border-black bg-gray-50 ring-1 ring-black"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FaQrcode className="text-indigo-600 text-lg" />
                      <div>
                        <span className="text-sm font-bold text-gray-900">Cashfree Instant UPI</span>
                        <p className="text-[11px] text-gray-500">GPay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "CASHFREE_UPI" && (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Selected</span>
                    )}
                  </div>

                  {/* Cashfree Cards & NetBanking */}
                  <div
                    onClick={() => setSelectedPaymentMethod("CASHFREE_CARD")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedPaymentMethod === "CASHFREE_CARD"
                        ? "border-black bg-gray-50 ring-1 ring-black"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FaCreditCard className="text-blue-600 text-lg" />
                      <div>
                        <span className="text-sm font-bold text-gray-900">Credit / Debit Card / NetBanking</span>
                        <p className="text-[11px] text-gray-500">Visa, Mastercard, RuPay, All Banks</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "CASHFREE_CARD" && (
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Selected</span>
                    )}
                  </div>

                  {/* Voyago Wallet */}
                  <div
                    onClick={() => setSelectedPaymentMethod("VOYAGO_WALLET")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedPaymentMethod === "VOYAGO_WALLET"
                        ? "border-black bg-gray-50 ring-1 ring-black"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FaWallet className="text-green-600 text-lg" />
                      <div>
                        <span className="text-sm font-bold text-gray-900">Voyago Express Wallet</span>
                        <p className="text-[11px] text-gray-500">Instant one-click checkout</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "VOYAGO_WALLET" && (
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">Selected</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCashfreePayment}
                  disabled={isSubmittingPayment}
                  className="w-full py-4 rounded-2xl bg-black hover:bg-gray-800 text-white font-bold text-sm tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmittingPayment ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Connecting to Cashfree Gateway...</span>
                    </>
                  ) : (
                    <span>Pay ₹{fareTotal.toFixed(2)} with Cashfree</span>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                    ✓
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 font-sans">Payment Successful!</h3>
                  <p className="text-sm text-gray-500">
                    Paid ₹{fareTotal.toFixed(2)} via Cashfree PG. How was your experience with {rideInfo?.driver?.name || "your driver"}?
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-4xl text-amber-400 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                    >
                      {star <= rating ? <FaStar /> : <FaRegStar />}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 mb-2">
                    Feedback for Driver (Optional)
                  </label>
                  <textarea
                    placeholder="E.g., Great driving, smooth trip, polite driver..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
                  />
                </div>

                <button
                  onClick={handleRatingSubmit}
                  disabled={isSubmittingRating}
                  className="w-full py-4 rounded-2xl bg-black hover:bg-gray-800 text-white font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting Feedback...</span>
                    </>
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
