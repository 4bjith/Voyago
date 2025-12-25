import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";
import CurrentMap from "../components/CurrentMap";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Optional utility if you plan to handle expired tokens later
const removeTokenIfExpired = (error, removeToken) => {
  if (error?.response?.status === 403) {
    removeToken();
  }
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigate = useNavigate();

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
    <div className="w-full min-h-screen bg-white overflow-hidden font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-[80vh] overflow-hidden">
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
              className="w-screen h-[80vh] shrink-0 relative flex justify-center items-center bg-center bg-cover"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/60 z-10 flex flex-col justify-center items-center text-center px-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 z-20 tracking-tight max-w-4xl">
                  {slide.title}
                </h1>
                <p className="text-gray-200 text-lg md:text-2xl z-20 font-light max-w-2xl">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 w-full flex justify-center gap-3 z-30">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${currentSlide === i ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
                }`}
            ></span>
          ))}
        </div>
      </div>

      {/* Book Ride Section */}
      <div className="w-full max-w-7xl mx-auto my-20 px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black">
            Book the Ride
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Experience a smooth and reliable ride anytime you need it. Choose
            your destination, confirm your driver, and enjoy the journey with
            comfort and safety at every step.
          </p>
          <button onClick={() => navigate("/bookride")} className="bg-black text-white px-10 py-4 rounded-full text-lg hover:bg-gray-900 transition-all duration-300 font-medium shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
            Book Now
          </button>
        </div>

        <div className="w-full h-full min-h-[400px] flex items-center justify-center">
          <div className="bg-gray-100 w-full h-[400px] rounded-3xl overflow-hidden relative shadow-2xl border border-gray-200">
            <CurrentMap />
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="w-full bg-black py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 w-full flex justify-center items-center">
            <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative">
              <img
                src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=2144/height=2144/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8xODM0ZTZmZC0zM2UzLTRjOTUtYWQ3YS1mNDg0YThjODEyZDcuanBn"
                alt="Account"
                className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-8 text-center md:text-left text-white">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Unlock your account
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              View past trips, manage your payment methods, and access exclusive
              offers. Stay up to date with your ride history and enjoy a
              personalized experience.
            </p>
            <button onClick={() => navigate("/login")} className="bg-white text-black px-10 py-4 rounded-full text-lg hover:bg-gray-200 transition-all duration-300 font-medium shadow-xl transform hover:-translate-y-1">
              Log in to your account
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="">
        <Footer />
      </div>
    </div>
  );
}
