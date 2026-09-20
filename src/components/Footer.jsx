import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { FiShield, FiExternalLink, FiSettings, FiHelpCircle, FiCreditCard } from "react-icons/fi";
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-neutral-400 pt-16 pb-8 border-t border-neutral-800 transition-colors font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-neutral-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Voyago is an intelligent on-demand urban mobility platform engineered with real-time matching, transparent upfront fares, and Cashfree-protected digital transactions.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <a href="#" className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-white hover:text-black transition-all flex items-center justify-center text-neutral-400 text-xs">
                <FaTwitter />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-white hover:text-black transition-all flex items-center justify-center text-neutral-400 text-xs">
                <FaFacebookF />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-white hover:text-black transition-all flex items-center justify-center text-neutral-400 text-xs">
                <FaInstagram />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-white hover:text-black transition-all flex items-center justify-center text-neutral-400 text-xs">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4 font-display">
              Passenger Platform
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/bookride" className="hover:text-white transition-colors">Book a Ride</Link>
              </li>
              <li>
                <Link to="/ride-history" className="hover:text-white transition-colors">Trip Activity Log</Link>
              </li>
              <li>
                <Link to="/wallet" className="hover:text-white transition-colors">Wallet & Payments</Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-white transition-colors">Account Settings</Link>
              </li>
            </ul>
          </div>

          {/* Drivers & Admin */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4 font-display">
              Partners & Admin
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="http://localhost:5174/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Driver Portal</span>
                  <FiExternalLink className="text-[10px]" />
                </a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">Command Center</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors">Help & FAQ Desk</Link>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4 font-display">
              Trust & Safety
            </h3>
            <div className="space-y-3 text-xs text-neutral-400">
              <div className="flex items-center gap-2 text-white font-semibold">
                <FiShield className="text-sm shrink-0" />
                <span>Voyago Shield™ 24/7</span>
              </div>
              <p>Cashfree Sandbox PG encrypted checkout with instant digital invoicing.</p>
              <div className="pt-2 text-neutral-500">
                <span>Support: support@voyago.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Voyago Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/support" className="hover:text-neutral-300 transition-colors">Help Center</Link>
            <Link to="/settings" className="hover:text-neutral-300 transition-colors">Privacy Preferences</Link>
            <a href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
