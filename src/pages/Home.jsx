import { useEffect, useState } from "react";
import NavMenu from "../components/NavMenu";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";
import CurrentMap from "../components/CurrentMap";

// Optional utility if you plan to handle expired tokens later
const removeTokenIfExpired = (error, removeToken) => {
  if (error?.response?.status === 403) {
    removeToken();
  }
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);


  const slides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1400&q=80",
      title: "Ride with Comfort",
      subtitle: "Book your ride anytime, anywhere.",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
      title: "Drive and Earn",
      subtitle: "Join us as a driver and make extra income.",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=1400&q=80",
      title: "Safe and Reliable",
      subtitle: "Every ride is monitored for your safety.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // ✅ Main Page
  return (
    <div className="w-full min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <div className="w-full h-[14%] bg-black text-white flex justify-between items-center px-5 py-3 relative z-50">
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

      {menuOpen && (
        <div className="absolute top-[14%] left-0 w-full bg-black flex flex-col items-center py-5 z-50 md:hidden">
          <NavMenu />
        </div>
      )}

      {/* Hero Section */}
      <div className="relative w-full h-[66vh] overflow-hidden">
        <div
          className="flex transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}vw)`,
            width: `${slides.length * 100}vw`,
          }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="w-screen h-[66vh] shrink-0 relative flex justify-center items-center bg-center bg-cover"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex flex-col justify-center items-center text-center px-4">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 z-20">
                  {slide.title}
                </h1>
                <p className="text-white text-lg md:text-2xl z-20">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-5 w-full flex justify-center gap-2 z-30">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full ${
                currentSlide === i ? "bg-white" : "bg-gray-400"
              }`}
            ></span>
          ))}
        </div>
      </div>

      {/* Book Ride Section */}
      <div className="w-full max-w-6xl mx-auto my-12 px-4 flex flex-col md:flex-row items-center justify-between min-h-[400px] gap-8">
        <div className="md:w-1/2 w-full text-center md:text-left space-y-6 flex flex-col justify-center items-center md:items-start">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            Book the Ride
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-md">
            Experience a smooth and reliable ride anytime you need it. Choose
            your destination, confirm your driver, and enjoy the journey with
            comfort and safety at every step.
          </p>
          <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition duration-300 font-semibold shadow-md">
            Book Now
          </button>
        </div>

        <div className="md:w-1/2 w-full flex justify-center items-center">
          <div className="bg-blue-400 rounded-2xl shadow-lg w-full h-[260px] md:h-[340px] flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0">
              <CurrentMap />
            </div>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="w-full max-w-6xl mx-auto my-12 px-4 flex flex-col md:flex-row lg:flex-row-reverse items-center justify-between min-h-[400px] gap-8">
        <div className="md:w-1/2 w-full text-center md:text-left space-y-6 flex flex-col justify-center items-center md:items-start">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            Log in to see your account details
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-md">
            View past trips, manage your payment methods, and access exclusive
            offers. Stay up to date with your ride history and enjoy a
            personalized experience every time you travel with Uber.
          </p>
          <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition duration-300 font-semibold shadow-md">
            Log in to your account
          </button>
        </div>

        <div className="md:w-1/2 w-full flex justify-center items-center">
          <div className="bg-blue-400 rounded-2xl shadow-lg w-full h-[260px] md:h-[340px] flex items-center justify-center overflow-hidden">
            <img
              src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=2144/height=2144/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8xODM0ZTZmZC0zM2UzLTRjOTUtYWQ3YS1mNDg0YThjODEyZDcuanBn"
              alt="Account"
              className="object-cover w-full h-full rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white pt-10 pb-0 mt-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
          {/* Routes */}
          <div>
            <h2 className="font-bold text-lg mb-4">Routes</h2>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Book Ride
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Account
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h2 className="font-bold text-lg mb-4">Company</h2>
            <p className="mb-2">Uber Technologies Inc.</p>
            <p className="mb-2">Contact: +1 800-123-4567</p>
            <p className="mb-2">Email: support@uber.com</p>
          </div>

          {/* Social Media */}
          <div>
            <h2 className="font-bold text-lg mb-4">Follow Us</h2>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="hover:text-blue-400" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className="hover:text-pink-400"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="hover:text-blue-300" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-black text-center py-4 w-full mt-8">
          <p className="text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} Voyago Technologies Inc. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
