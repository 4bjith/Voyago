import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";
import CurrentMap from "../components/CurrentMap";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FiArrowRight,
  FiShield,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiChevronRight,
  FiStar,
  FiCompass,
  FiActivity,
} from "react-icons/fi";
import { FaMotorcycle, FaCar, FaCarSide, FaQrcode, FaShieldAlt } from "react-icons/fa";

export default function Home() {
  const token = UserStore((state) => state.token);
  const setToken = UserStore((state) => state.addToken);
  const [isHero, setIsHero] = useState(false);
  const navigate = useNavigate();

  const [quickPickup, setQuickPickup] = useState("Connaught Place, New Delhi");
  const [quickDropoff, setQuickDropoff] = useState("Cyber Hub, Gurugram");
  const [selectedTier, setSelectedTier] = useState("Sedan");

  // Token verify
  const { data: auth } = useQuery({
    queryKey: ["authcheck", token],
    queryFn: async () => {
      const res = await api.get("/tockencheck", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (auth?.token === null) {
      setToken(null);
    }
  }, [auth, setToken]);

  // Active Ride check & redirect
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
        navigate(`/bookride`);
      }
    }
  }, [activeRide, navigate]);

  const handleQuickBook = () => {
    navigate("/bookride");
  };

  const fleetTiers = [
    {
      id: "moto",
      name: "Voyago Moto",
      icon: <FaMotorcycle className="text-2xl" />,
      desc: "Beat peak traffic with swift, affordable solo rides.",
      eta: "2 min ETA",
      basePrice: "₹35",
      capacity: "1 Rider",
      perKm: "₹8/km",
    },
    {
      id: "go",
      name: "Voyago Go Sedan",
      icon: <FaCar className="text-2xl" />,
      desc: "Everyday comfortable, air-conditioned compact sedans.",
      eta: "3 min ETA",
      basePrice: "₹70",
      capacity: "4 Seats",
      perKm: "₹14/km",
      popular: true,
    },
    {
      id: "max",
      name: "Voyago Max SUV",
      icon: <FaCarSide className="text-2xl" />,
      desc: "Roomy 6-seater premium transport for groups and luggage.",
      eta: "5 min ETA",
      basePrice: "₹120",
      capacity: "6 Seats",
      perKm: "₹22/km",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors overflow-x-hidden font-sans">
      
      {/* Floating Header */}
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar isHero={isHero} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-28 pb-16 border-b border-neutral-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white text-xs font-bold border border-neutral-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
              <span>Geospatial Matching • Cashfree PG Protected</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-black dark:text-white leading-[1.05]">
              Go anywhere. <br />
              Zero surprises.
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Request rides in seconds, track verified drivers in real-time on live Leaflet maps, and settle fares securely with instant Cashfree UPI.
            </p>

            {/* Quick Interactive Estimator Widget */}
            <div className="bg-white dark:bg-zinc-950 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4 max-w-xl mx-auto lg:mx-0 border border-neutral-200 dark:border-zinc-800">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
                <span>Instant Ride Dispatch</span>
                <span className="text-black dark:text-white font-bold flex items-center gap-1">
                  <FiActivity className="w-3.5 h-3.5" /> Live Rates
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-3.5 text-neutral-400 text-sm" />
                  <input
                    type="text"
                    value={quickPickup}
                    onChange={(e) => setQuickPickup(e.target.value)}
                    placeholder="Pickup location"
                    className="w-full bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                  />
                </div>
                <div className="relative">
                  <FiCompass className="absolute left-3.5 top-3.5 text-neutral-400 text-sm" />
                  <input
                    type="text"
                    value={quickDropoff}
                    onChange={(e) => setQuickDropoff(e.target.value)}
                    placeholder="Destination"
                    className="w-full bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                  />
                </div>
              </div>

              {/* Tier Quick Select */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTier("Bike")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedTier === "Bike"
                      ? "border-black dark:border-white bg-neutral-100 dark:bg-zinc-900 font-bold"
                      : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  }`}
                >
                  <div className="text-base mb-0.5">🏍️</div>
                  <div className="text-xs font-bold text-black dark:text-white">Moto</div>
                  <div className="text-[10px] text-neutral-500 font-mono font-bold">₹85 • 2m</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier("Sedan")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedTier === "Sedan"
                      ? "border-black dark:border-white bg-neutral-100 dark:bg-zinc-900 font-bold"
                      : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  }`}
                >
                  <div className="text-base mb-0.5">🚗</div>
                  <div className="text-xs font-bold text-black dark:text-white">Go Sedan</div>
                  <div className="text-[10px] text-neutral-500 font-mono font-bold">₹180 • 3m</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier("SUV")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedTier === "SUV"
                      ? "border-black dark:border-white bg-neutral-100 dark:bg-zinc-900 font-bold"
                      : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  }`}
                >
                  <div className="text-base mb-0.5">🚙</div>
                  <div className="text-xs font-bold text-black dark:text-white">Max SUV</div>
                  <div className="text-[10px] text-neutral-500 font-mono font-bold">₹260 • 5m</div>
                </button>
              </div>

              <button
                onClick={handleQuickBook}
                className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Book Ride</span>
                <FiArrowRight />
              </button>
            </div>

            {/* Platform Trust Highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-neutral-500 font-semibold">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-black dark:text-white" />
                <span>Zero Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <FiShield className="text-black dark:text-white" />
                <span>Voyago Shield Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <FaQrcode className="text-black dark:text-white" />
                <span>Cashfree Instant UPI</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Map Teaser Display */}
          <div className="lg:col-span-5 relative">
            <div className="w-full h-[450px] sm:h-[500px] rounded-3xl overflow-hidden shadow-sm border border-neutral-200 dark:border-zinc-800 relative">
              <CurrentMap />
              
              <div className="absolute bottom-4 inset-x-4 z-[400] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-4 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm font-bold">
                    <FaCar />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-black dark:text-white">Active Fleet Available</h4>
                    <p className="text-[10px] text-neutral-500">Nearest pickup in ~2 mins</p>
                  </div>
                </div>
                <Link
                  to="/bookride"
                  className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Fleet Tiers Section */}
      <section id="fleet" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
            Precision Mobility
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-black dark:text-white">
            Our Vehicle Categories
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Choose from agile city bikes to spacious multi-passenger carriers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {fleetTiers.map((tier) => (
            <div
              key={tier.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                tier.popular
                  ? "border-black dark:border-white bg-neutral-50 dark:bg-zinc-950 shadow-md md:-translate-y-1.5"
                  : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-neutral-400"
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center mb-6">
                  {tier.icon}
                </div>
                <h3 className="text-xl font-black font-display text-black dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                  {tier.desc}
                </p>

                <div className="space-y-2 py-4 border-y border-neutral-100 dark:border-zinc-900 text-xs">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Capacity</span>
                    <span className="font-bold text-black dark:text-white">{tier.capacity}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Average Arrival</span>
                    <span className="font-bold text-black dark:text-white">{tier.eta}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Standard Rate</span>
                    <span className="font-bold text-black dark:text-white">{tier.perKm}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs text-neutral-400 uppercase font-bold">From</span>
                  <span className="text-2xl font-black font-display text-black dark:text-white">
                    {tier.basePrice}
                  </span>
                </div>
                <Link
                  to="/bookride"
                  className="w-full py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider text-center block shadow-sm"
                >
                  Select {tier.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Voyago Shield Safety Section */}
      <section id="safety" className="py-20 bg-black text-white relative border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold border border-zinc-800">
                <FaShieldAlt />
                <span>Voyago Shield™ Protection</span>
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
                Safety by Design. <br />
                Monitored 24/7.
              </h2>
              
              <p className="text-neutral-400 text-sm leading-relaxed">
                Every trip on Voyago is tracked in real-time by automated safety telemetry. With instant OTP authorization and encrypted Cashfree settlements, you ride with absolute security.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <FiShield />
                    <span>Driver KYC Vetting</span>
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Comprehensive background, driving license, and vehicle registration verification.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <FiClock />
                    <span>Real-Time Telemetry</span>
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Live GPS route tracking and deviation alerts with one-click trip sharing.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <FaQrcode />
                    <span>Secure Start OTP</span>
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Rides begin only after the driver verifies your 4-digit unique trip pin.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <FiStar />
                    <span>Emergency SOS Dispatch</span>
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Instant one-tap emergency beacon dispatching location to emergency response.
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Illustration Card */}
            <div className="flex justify-center">
              <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl max-w-md w-full space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center text-xl font-bold">
                      <FiShield />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Voyago Safety Engine</h4>
                      <p className="text-xs text-neutral-400">Active on all rides</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold border border-zinc-800">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900">
                    <span className="text-neutral-300">Live Driver Identity Check</span>
                    <span className="text-white font-bold">✓ 100% Verified</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900">
                    <span className="text-neutral-300">Cashfree Escrow Protection</span>
                    <span className="text-white font-bold">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900">
                    <span className="text-neutral-300">Trip Telemetry Anomaly Guard</span>
                    <span className="text-white font-bold">✓ Monitored</span>
                  </div>
                </div>

                <Link
                  to="/bookride"
                  className="w-full py-3.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider text-center block shadow-lg"
                >
                  Book Protected Trip
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Driver Partner CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-neutral-100 dark:bg-zinc-950 text-black dark:text-white p-8 sm:p-14 border border-neutral-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Voyago Driver Partner Wing
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
              Drive with Voyago. <br />
              Instant Daily Payouts.
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-xl leading-relaxed">
              Join thousands of driver-partners enjoying flexible working hours, low platform fees, and direct UPI settlements.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 justify-center">
            <a
              href="http://localhost:5174/"
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-6 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider text-center shadow-md transition-all"
            >
              Open Driver Portal
            </a>
            <Link
              to="/bookride"
              className="py-4 px-6 rounded-2xl bg-neutral-200 dark:bg-zinc-900 text-black dark:text-white font-bold text-xs uppercase tracking-wider text-center border border-neutral-300 dark:border-zinc-800 transition-all"
            >
              Book Passenger Ride
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
