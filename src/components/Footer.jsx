import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-0 mt-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
        {/* Routes */}
        <div>
          <h2 className="font-bold text-lg mb-4">Routes</h2>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="/bookride" className="hover:underline">
                Book Ride
              </a>
            </li>
            <li>
              <a href="/account" className="hover:underline">
                Account
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
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
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400" aria-label="Facebook">
              <img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="Facebook" className="h-6 w-6" />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400" aria-label="Twitter">
              <img src="https://img.icons8.com/ios-filled/50/ffffff/twitter.png" alt="Twitter" className="h-6 w-6" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400" aria-label="Instagram">
              <img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new--v1.png" alt="Instagram" className="h-6 w-6" />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300" aria-label="LinkedIn">
              <img src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" alt="LinkedIn" className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-black text-center py-4 w-full mt-8">
        <p className="text-gray-300 text-sm">
          &copy; {new Date().getFullYear()} Voyago Technologies Inc. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
