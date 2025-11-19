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
    <div className="w-full min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <Navbar />

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
          <button onClick={()=>navigate("/bookride")} className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition duration-300 font-semibold shadow-md">
            Book Now
          </button>
        </div>

        <div className="md:w-1/2 w-[80%] flex justify-center items-center">
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
          <button onClick={()=>navigate("/login")} className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition duration-300 font-semibold shadow-md">
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
      <div className="">
        <Footer />
      </div>
    </div>
  );
}
