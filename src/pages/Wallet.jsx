import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UserStore from "../zustand/UserStore";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  FiCreditCard,
  FiPlus,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiShield,
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";
import { FaQrcode, FaWallet, FaShieldAlt } from "react-icons/fa";

export default function Wallet() {
  const token = UserStore((state) => state.token);
  const user = UserStore((state) => state.user);

  const [balance, setBalance] = useState(450.0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("500");

  const [transactions, setTransactions] = useState([
    {
      id: "TX-9921",
      title: "Trip Settlement — Connaught Place",
      date: "Today, 11:30 AM",
      amount: -180.0,
      status: "Settled via Cashfree UPI",
    },
    {
      id: "TX-9908",
      title: "Voyago Wallet Top-up",
      date: "Yesterday, 04:15 PM",
      amount: 500.0,
      status: "Cashfree Instant Deposit",
    },
    {
      id: "TX-9874",
      title: "Trip Settlement — Cyber Hub",
      date: "18 Sep 2026",
      amount: -260.0,
      status: "Settled via Cashfree Card",
    },
  ]);

  const handleAddFunds = () => {
    const val = parseFloat(topUpAmount);
    if (!val || val <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }
    setBalance((prev) => prev + val);
    setTransactions((prev) => [
      {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        title: "Voyago Wallet Top-up",
        date: "Just now",
        amount: val,
        status: "Cashfree Instant Deposit",
      },
      ...prev,
    ]);
    setShowAddModal(false);
    toast.success(`Successfully added ₹${val.toFixed(2)} to Voyago Express Wallet!`);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>
      <div className="h-24"></div>

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Header */}
        <div>
          <Link
            to="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white mb-2 transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Account</span>
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-black dark:text-white">
                Wallet & Payment Management
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Manage your payment methods, digital balances, and Cashfree settlement logs.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all flex items-center gap-2"
            >
              <FiPlus />
              <span>Add Money to Wallet</span>
            </button>
          </div>
        </div>

        {/* Balance & Payment Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Balance Card */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                Voyago Express Balance
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-neutral-500 bg-neutral-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full">
                <FiShield />
                <span>Cashfree Escrow</span>
              </div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black font-display tracking-tight text-black dark:text-white">
                ₹{balance.toFixed(2)}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Available for instant 1-click ride bookings</p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-zinc-900 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider text-center"
              >
                Top Up
              </button>
              <button
                onClick={() => toast.info("Auto-reload settings updated to maintain minimum ₹200.")}
                className="py-3 rounded-xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white font-bold text-xs uppercase tracking-wider text-center"
              >
                Auto Reload
              </button>
            </div>
          </div>

          {/* Right: Saved Payment Methods */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black font-display text-black dark:text-white">
                  Saved Payment Channels
                </h3>
                <p className="text-xs text-neutral-500">Encrypted and managed via Cashfree PG</p>
              </div>
              <button
                onClick={() => toast.info("Payment method configuration modal")}
                className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white"
              >
                + Add New
              </button>
            </div>

            <div className="space-y-3">
              {/* Cashfree UPI */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
                    <FaQrcode />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-black dark:text-white">Instant UPI AutoPay</h4>
                    <p className="text-xs text-neutral-500">voyago.user@okhdfcbank</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black">
                  Primary
                </span>
              </div>

              {/* Credit Card */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
                    <FiCreditCard />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-black dark:text-white">HDFC Visa Infinite</h4>
                    <p className="text-xs text-neutral-500">•••• •••• •••• 4092 (Expires 08/29)</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">Verified</span>
              </div>
            </div>
          </div>

        </div>

        {/* Transaction History Ledger */}
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-neutral-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-lg font-black font-display text-black dark:text-white">
            Recent Wallet & Trip Transactions
          </h3>

          <div className="divide-y divide-neutral-100 dark:divide-zinc-900">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.amount > 0
                        ? "bg-neutral-100 text-black dark:bg-zinc-800 dark:text-white"
                        : "bg-neutral-100 text-neutral-700 dark:bg-zinc-900 dark:text-neutral-300"
                    }`}
                  >
                    {tx.amount > 0 ? <FiArrowDownLeft size={16} /> : <FiArrowUpRight size={16} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-black dark:text-white">{tx.title}</h4>
                    <p className="text-[11px] text-neutral-500">{tx.date} • {tx.status}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-black font-display ${
                      tx.amount > 0 ? "text-black dark:text-white" : "text-neutral-900 dark:text-neutral-100"
                    }`}
                  >
                    {tx.amount > 0 ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                  </span>
                  <span className="block text-[10px] text-neutral-400 font-mono">#{tx.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Top Up Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl">
            <h3 className="text-xl font-black font-display text-black dark:text-white">
              Top Up Voyago Wallet
            </h3>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 pl-1">
                Enter Amount (₹)
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-lg font-black text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
              />

              <div className="flex gap-2">
                {["200", "500", "1000"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className="flex-1 py-2 rounded-xl bg-neutral-100 dark:bg-zinc-900 text-xs font-bold text-black dark:text-white border border-neutral-200 dark:border-zinc-800"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-xs font-bold text-neutral-600 dark:text-neutral-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddFunds}
                className="flex-1 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
