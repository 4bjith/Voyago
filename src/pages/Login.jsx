import { useRef, useState } from "react";
import { toast } from "react-toastify";
import UserStore from "../zustand/UserStore";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosClient";
import { useTheme } from "../context/ThemeContext";
import Logo from "../components/Logo";
import { FiSun, FiMoon, FiEye, FiEyeOff, FiArrowRight, FiShield, FiLock, FiMail, FiCheckCircle } from "react-icons/fi";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const emailRef = useRef();
  const passwordRef = useRef();
  const { addToken } = UserStore();
  const navigate = useNavigate();

  const loginSubmit = async () => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    const proceedLogin = async (location) => {
      try {
        const response = await api.post("/login", {
          email,
          password,
          location,
        });
        addToken(response.data.token);
        toast.success("Welcome back! Signed in successfully.");
        navigate("/");
      } catch (err) {
        console.error("Login error:", err);
        toast.error(err.response?.data?.message || "Invalid credentials.");
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          proceedLogin({
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude],
          });
        },
        () => {
          // Fallback coordinates if location permission is denied
          proceedLogin({
            type: "Point",
            coordinates: [77.2090, 28.6139],
          });
        }
      );
    } else {
      proceedLogin({
        type: "Point",
        coordinates: [77.2090, 28.6139],
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      loginSubmit();
    }
  };

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-12 bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
      
      {/* Left Brand Showcase Column */}
      <div className="hidden lg:flex lg:col-span-6 bg-black text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-r border-neutral-200 dark:border-zinc-800">
        
        <div className="z-10 flex items-center justify-between">
          <Logo size="md" />

          <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white border border-white/20">
            Passenger Portal
          </span>
        </div>

        <div className="z-10 space-y-6 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-white text-xs font-bold">
            <FiShield className="w-3.5 h-3.5" />
            <span>Voyago Verified Mobility Cloud</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Seamless Urban <br />
            <span className="text-zinc-400">Navigation.</span>
          </h2>

          <p className="text-zinc-400 text-sm leading-relaxed">
            Sign in to access your saved places, instant ride bookings, digital receipts, and real-time trip tracking.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <FiCheckCircle className="w-4 h-4 text-white" />
                <span>Zero Surge Shock</span>
              </div>
              <p className="text-zinc-400 text-[11px]">Strict upfront locked estimates.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <FiCheckCircle className="w-4 h-4 text-white" />
                <span>Voyago Shield</span>
              </div>
              <p className="text-zinc-400 text-[11px]">24/7 SOS & trip monitoring.</p>
            </div>
          </div>
        </div>

        <div className="z-10 text-xs text-zinc-500 flex items-center justify-between pt-8 border-t border-zinc-800">
          <span>&copy; {new Date().getFullYear()} Voyago Technologies Inc.</span>
          <span className="text-zinc-400">256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Right Login Form Column */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative">
        {/* Top bar controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-neutral-100 dark:bg-zinc-900 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white ml-auto border border-neutral-200 dark:border-zinc-800 transition-all"
            title="Toggle theme"
          >
            {isDark ? <FiSun className="w-4 h-4 text-amber-400" /> : <FiMoon className="w-4 h-4 text-black" />}
          </button>
        </div>

        {/* Center Form */}
        <div className="max-w-md w-full mx-auto space-y-8 my-auto">
          <div>
            <h1 className="text-3xl font-black font-display text-black dark:text-white tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Enter your credentials to manage rides and account settings.
            </p>
          </div>

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5 pl-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-3.5 text-neutral-400" />
                <input
                  type="email"
                  ref={emailRef}
                  placeholder="name@example.com"
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5 pl-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/support" className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                  Need help?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-3.5 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  ref={passwordRef}
                  placeholder="••••••••"
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-12 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              onClick={loginSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-black text-sm tracking-wide shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Don't have a Voyago account?{" "}
            <Link to="/register" className="font-black text-black dark:text-white underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>

        <div className="pt-8 text-center text-[11px] text-neutral-400">
          By continuing, you agree to Voyago's Terms of Service and Privacy Policy.
        </div>
      </div>

    </div>
  );
}
