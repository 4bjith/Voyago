import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  FiHelpCircle,
  FiSearch,
  FiShield,
  FiFileText,
  FiMessageSquare,
  FiPhoneCall,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiSend,
} from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      q: "How does upfront pricing work on Voyago?",
      a: "Voyago calculates your fare upfront based on exact road network distance, estimated traffic duration, and the selected vehicle tier. Once confirmed, you pay the exact calculated price with zero unexpected surge additions.",
    },
    {
      q: "How does the Start Ride OTP ensure my safety?",
      a: "Each booking generates a secure 4-digit OTP displayed on your screen. The driver cannot start the meter or navigation until they input your valid OTP into their app, guaranteeing you are in the correct vehicle.",
    },
    {
      q: "What payment methods are supported via Cashfree?",
      a: "We support Cashfree Instant UPI (GPay, PhonePe, Paytm, BHIM), all major Credit/Debit cards (Visa, Mastercard, RuPay), NetBanking, and the prepaid Voyago Express Wallet.",
    },
    {
      q: "What should I do if I left an item behind in a car?",
      a: "You can find your driver's contact info directly in your Ride History tab for up to 24 hours post-trip, or submit a support dispute ticket below with your Trip ID.",
    },
    {
      q: "How does the Emergency SOS button work?",
      a: "Pressing the Emergency SOS button immediately transmits your live coordinates, vehicle plate number, and driver details to our 24/7 safety command center.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) {
      toast.error("Please provide both a subject and description.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Support ticket #VY-8842 submitted! Our team will respond within 15 minutes.");
      setTicketSubject("");
      setTicketDescription("");
    }, 800);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>
      <div className="h-24"></div>

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        
        {/* Help Center Hero */}
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800 p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mx-auto text-xl font-bold">
            <FiHelpCircle />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-black dark:text-white">
            How can we help you?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Search our knowledge base or submit a direct inquiry to our 24/7 passenger support team.
          </p>

          <div className="relative max-w-lg mx-auto pt-2">
            <FiSearch className="absolute left-4 top-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics: OTP, payments, lost item, fares..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-all"
            />
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl font-black font-display text-black dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-950 rounded-2xl border border-neutral-200 dark:border-zinc-800 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-black dark:text-white"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-zinc-900 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Ticket Section */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black font-display text-black dark:text-white">
              Report an Issue or Submit a Ticket
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Have a dispute regarding a recent trip, incorrect fare, or driver feedback?
            </p>
          </div>

          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 pl-1">
                Subject
              </label>
              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="E.g., Fare discrepancy on Trip #9921"
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 pl-1">
                Description & Trip Details
              </label>
              <textarea
                rows={4}
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Please describe what occurred in detail..."
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <FiSend />
              <span>{isSubmitting ? "Submitting..." : "Send to Support Team"}</span>
            </button>
          </form>
        </div>

      </main>

      <Footer />
    </div>
  );
}
