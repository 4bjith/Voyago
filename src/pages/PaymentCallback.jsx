import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaShieldAlt,
  FaReceipt,
  FaArrowRight,
} from "react-icons/fa";
import { FiRefreshCw, FiHome, FiCheck } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UserStore from "../zustand/UserStore";
import PaymentService from "../services/payment.service";

export default function PaymentCallback({ socketRef }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = UserStore((state) => state.token);

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id") || queryParams.get("orderId");
  const rideIdParam = queryParams.get("id") || queryParams.get("rideId");

  const [loading, setLoading] = useState(true);
  const [statusResult, setStatusResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const verifyOrder = async () => {
    if (!orderId && !rideIdParam) {
      setLoading(false);
      setErrorMsg("No valid order identifier found in callback URL.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const targetId = orderId || rideIdParam;
      const res = await PaymentService.getPaymentStatus(targetId, token);
      setStatusResult(res);

      if (res.paymentStatus === "PAID" || res.success) {
        toast.success("Payment verified successfully via Cashfree!");
      } else if (res.paymentStatus === "FAILED") {
        toast.error("Payment was declined or failed.");
      } else {
        toast.info("Payment is currently being processed.");
      }
    } catch (err) {
      console.error("Payment callback verification error:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to verify transaction with Cashfree."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyOrder();
  }, [orderId, rideIdParam, token]);

  const rideId = statusResult?.data?.rideId || rideIdParam;
  const isPaid = statusResult?.paymentStatus === "PAID" || statusResult?.success;
  const isFailed = statusResult?.paymentStatus === "FAILED";
  const isPending = !isPaid && !isFailed && !errorMsg;

  return (
    <div className="w-full min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans transition-colors">
      <div id="navbar" className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>
      <div className="h-28"></div>

      <main className="grow max-w-xl mx-auto w-full px-4 py-8 flex items-center justify-center">
        <div className="w-full bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Header Tag */}
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-900 pb-4">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-black dark:text-white text-sm" />
              <span className="text-xs font-black uppercase tracking-wider font-display text-black dark:text-white">
                Cashfree Gateway Verification
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-zinc-900 text-neutral-600 dark:text-neutral-400">
              Sandbox PG
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-lg font-black text-black dark:text-white">
                Verifying Transaction...
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Securely querying Cashfree servers to verify your payment status. Please do not close this window.
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && errorMsg && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white rounded-3xl flex items-center justify-center text-3xl mx-auto border border-neutral-200 dark:border-zinc-800">
                <FaTimesCircle className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-black dark:text-white">
                Verification Failed
              </h3>
              <p className="text-xs text-neutral-500">{errorMsg}</p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={verifyOrder}
                  className="flex-1 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <FiRefreshCw />
                  <span>Retry Verification</span>
                </button>
                <Link
                  to="/"
                  className="flex-1 py-3.5 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-2 border border-neutral-200 dark:border-zinc-800"
                >
                  <FiHome />
                  <span>Return Home</span>
                </Link>
              </div>
            </div>
          )}

          {/* Success State */}
          {!loading && !errorMsg && isPaid && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white rounded-3xl flex items-center justify-center text-3xl mx-auto border border-neutral-200 dark:border-zinc-800">
                  <FaCheckCircle className="text-black dark:text-white" />
                </div>
                <h3 className="text-2xl font-black font-display text-black dark:text-white">
                  Payment Confirmed!
                </h3>
                <p className="text-xs text-neutral-500">
                  Your payment has been verified by the server.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-neutral-50 dark:bg-zinc-900 rounded-2xl p-5 border border-neutral-200 dark:border-zinc-800 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-zinc-800">
                  <span className="text-neutral-500">Cashfree Order ID</span>
                  <span className="font-mono font-bold text-black dark:text-white text-[11px] truncate max-w-[200px]">
                    {statusResult?.orderId || orderId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Payment Status</span>
                  <span className="font-black px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] uppercase">
                    {statusResult?.paymentStatus || "PAID"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Order Status</span>
                  <span className="font-bold text-black dark:text-white">
                    {statusResult?.orderStatus || "CONFIRMED"}
                  </span>
                </div>
                {statusResult?.data?.totalFare && (
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-zinc-800">
                    <span className="font-bold text-black dark:text-white">Total Amount Paid</span>
                    <span className="text-xl font-black font-display text-black dark:text-white">
                      ₹{Number(statusResult.data.totalFare).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {rideId && (
                  <button
                    onClick={() => navigate(`/finalride?id=${rideId}`)}
                    className="flex-1 py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
                  >
                    <span>View Trip Receipt</span>
                    <FaArrowRight />
                  </button>
                )}
                <Link
                  to="/"
                  className="flex-1 py-4 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white font-bold text-xs flex items-center justify-center gap-2 border border-neutral-200 dark:border-zinc-800"
                >
                  <FiHome />
                  <span>Go to Dashboard</span>
                </Link>
              </div>
            </div>
          )}

          {/* Pending State */}
          {!loading && !errorMsg && isPending && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white rounded-3xl flex items-center justify-center text-3xl mx-auto border border-neutral-200 dark:border-zinc-800">
                <FaHourglassHalf className="text-amber-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-black dark:text-white">
                Payment Awaiting Confirmation
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Cashfree is currently processing your transaction. This may take up to a minute to finalize via webhook.
              </p>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={verifyOrder}
                  className="flex-1 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <FiRefreshCw />
                  <span>Check Status Again</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
