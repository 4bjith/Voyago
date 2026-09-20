import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosClient";
import { useTheme } from "../context/ThemeContext";
import Logo from "../components/Logo";
import {
  FiSun,
  FiMoon,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiUser,
  FiPhone,
  FiMail,
  FiLock,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const nameRef = useRef();
  const mobileRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();

  const registerSubmit = async () => {
    const name = nameRef.current?.value;
    const mobile = mobileRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!name || !mobile || !email || !password) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/register", {
        name,
        email,
        password,
        mobile,
      });
      if (res.data) {
        toast.success("Account created successfully! Please sign in.");
        navigate("/login");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-12 bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
      
      {/* Left Brand Showcase Column */}
      <div className="hidden lg:flex lg:col-span-6 bg-black text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-r border-neutral-200 dark:border-zinc-800">
        
        <div className="z-10 flex items-center justify-between">
          <Logo size="md" />

          <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white border border-white/20">
            Join Voyago
          </span>
        </div>

        <div className="z-10 space-y-6 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-white text-xs font-bold">
            <FiShield className="w-3.5 h-3.5" />
            <span>Voyago Shield 24/7 Verified</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Seamless Mobility <br />
            <span className="text-zinc-400">At Your Fingertips.</span>
          </h2>

          <p className="text-zinc-400 text-sm leading-relaxed">
            Create an account in less than a minute. Enjoy instant booking, transparent upfront fares, and priority support.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <FiCheckCircle className="w-4 h-4 text-white" />
                <span>Quick Onboarding</span>
              </div>
              <p className="text-zinc-400 text-[11px]">Instant phone & email verification.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <FiCheckCircle className="w-4 h-4 text-white" />
                <span>Cashfree Ready</span>
              </div>
              <p className="text-zinc-400 text-[11px]">Unified digital checkout & wallet.</p>
            </div>
          </div>
        </div>

        <div className="z-10 text-xs text-zinc-500 flex items-center justify-between pt-8 border-t border-zinc-800">
          <span>&copy; {new Date().getFullYear()} Voyago Technologies Inc.</span>
          <span className="text-zinc-400">Encrypted User Vault</span>
        </div>
      </div>

      {/* Right Register Form Column */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
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

        {/* Center Register Form */}
        <div className="max-w-md w-full mx-auto space-y-6 my-auto">
          <div>
            <h1 className="text-3xl font-black font-display text-black dark:text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Enter your basic details to start booking trips instantly.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1 pl-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-3.5 text-neutral-400" />
                <input
                  type="text"
                  ref={nameRef}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1 pl-1">
                Mobile Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-3.5 text-neutral-400" />
                <input
                  type="tel"
                  ref={mobileRef}
                  placeholder="+91 98765 43210"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1 pl-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-3.5 text-neutral-400" />
                <input
                  type="email"
                  ref={emailRef}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1 pl-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-3.5 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  ref={passwordRef}
                  placeholder="Create a strong password"
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
              onClick={registerSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-black text-sm tracking-wide shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Already have a Voyago account?{" "}
            <Link to="/login" className="font-black text-black dark:text-white underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>

        <div className="pt-6 text-center text-[11px] text-neutral-400">
          By signing up, you consent to Voyago's Safety Policies and Terms.
        </div>
      </div>

    </div>
  );
}
