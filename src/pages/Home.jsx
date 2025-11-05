import { useEffect, useState } from "react";
import NavMenu from "../components/NavMenu";

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

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="w-full min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <div className="w-full h-[14%] bg-black text-white flex justify-between items-center px-5 py-3 relative z-50">
        <div className="font-semibold tracking-wider text-xl">Uber</div>

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

      {/* ✅ Hero Section */}
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
              className="w-screen h-[66vh] shrink-0 relative flex justify-center items-center"
            >
              {/* Dark Overlay + Text */}
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
          <div className="bg-blue-400 rounded-2xl shadow-lg w-full h-[260px] md:h-[340px] flex items-center justify-center">
            {/* You can add an image or illustration here for visual appeal */}
            <span className="text-white text-2xl font-bold">
              Your Ride Awaits!
            </span>
          </div>
        </div>
      </div>

      {/* account section */}
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
          {/* Company Details */}
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
              <a href="#" aria-label="Facebook" className="hover:text-blue-400">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-blue-400">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.555-2.005.959-3.127 1.184A4.916 4.916 0 0016.616 3c-2.717 0-4.92 2.206-4.92 4.917 0 .386.044.762.127 1.124C7.728 8.77 4.1 6.797 1.671 3.149c-.423.722-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89-.386.105-.793.162-1.213.162-.297 0-.583-.029-.862-.082.584 1.823 2.277 3.151 4.287 3.188A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.212c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.025 10.025 0 0024 4.557z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-pink-400"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.414 3.635 1.381 2.668 2.348 2.385 3.521 2.326 4.798 2.267 6.078 2.254 6.487 2.254 12c0 5.513.013 5.922.072 7.202.059 1.277.342 2.45 1.309 3.417.967.967 2.14 1.25 3.417 1.309 1.28.059 1.689.072 7.202.072s5.922-.013 7.202-.072c1.277-.059 2.45-.342 3.417-1.309.967-.967 1.25-2.14 1.309-3.417.059-1.28.072-1.689.072-7.202s-.013-5.922-.072-7.202c-.059-1.277-.342-2.45-1.309-3.417C19.398.414 18.225.131 16.948.072 15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-blue-300">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.156 1.459-2.156 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.604v5.592z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="bg-black text-center py-4 w-full mt-8">
          <p className="text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} Uber Technologies Inc. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
