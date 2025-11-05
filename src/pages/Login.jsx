import { useRef, useState } from "react";
import { toast } from "react-toastify";
import UserStore from "../zustand/UserStore";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your system.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude],
        };
        try {
          const response = await api.post("/login", {
            email,
            password,
            location,
          });
          addToken(response.data.token);
          toast.success("Log in successfull !!");
          navigate("/");
        } catch (err) {
          console.error("Login error:", err);
          toast.error(err.response?.data?.message || "Login failed");
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center">
        {/* Left Section: Info (hidden on mobile) */}
        <div className="hidden md:flex flex-col justify-center items-start w-1/2 pr-8">
          <h2 className="text-4xl font-bold text-white mb-4">Welcome Back!</h2>
          <p className="text-lg text-gray-300">
            Log in to your Voyago account to book rides, view your trip history,
            and manage your profile securely. Enjoy seamless travel with Voyago.
          </p>
        </div>
        {/* Right Section: Login Form */}
        <div className="w-full md:w-1/2 flex justify-center items-center h-full min-h-[480px]">
          <div className="w-full max-w-md min-h-[480px] bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center space-y-6 border border-white border-opacity-20">
            <h1 className="text-3xl font-bold text-black mb-6">
              Log in to Voyago
            </h1>
            <input
              type="email"
              name="email"
              id="email"
              ref={emailRef}
              placeholder="Enter email .."
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-white mb-3 border border-gray-300"
            />
            <div className="w-full relative mb-3">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                ref={passwordRef}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-white border border-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-60 px-2 py-1 rounded focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.122-6.13m1.664-1.664A9.96 9.96 0 0112 3c5.523 0 10 4.477 10 10a9.96 9.96 0 01-1.664 6.13m-1.664 1.664A10.05 10.05 0 0112 21c-1.125 0-2.217-.165-3.25-.475M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.25 2.25l3.75 3.75m-3.75-3.75A9.96 9.96 0 0021 12c0-5.523-4.477-10-10-10S1 6.477 1 12c0 2.21.72 4.25 1.93 5.93m3.75-3.75l-3.75 3.75"
                    />
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={loginSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-lg bg-black text-white font-semibold transition duration-300 border border-white border-opacity-30 shadow flex items-center justify-center ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-white hover:text-black"
              }`}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Logging in..." : "Log in"}
            </button>
            <p className="text-black text-sm mt-2">
              Don't have an account?{" "}
              <a href="#" className="underline hover:text-blue-700">
                Register
              </a>{" "}
              now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
