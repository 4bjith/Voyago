import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PaymentService from "../services/payment.service";
import {
  FiCreditCard,
  FiCheckCircle,
  FiCopy,
  FiArrowRight,
  FiShield,
  FiSmartphone,
  FiLock,
  FiCheck,
  FiRefreshCw,
  FiClock,
  FiX,
  FiSearch,
} from "react-icons/fi";
import { FaQrcode, FaUniversity, FaGooglePay } from "react-icons/fa";
import { SiPhonepe, SiPaytm } from "react-icons/si";

/**
 * 💳 MultiChannelPaymentModal Component
 * Full-featured payment modal supporting Credit Card, Debit Card, UPI, and Bank Transfer
 */
export default function MultiChannelPaymentModal({
  isOpen,
  onClose,
  rideId,
  amount = 100,
  orderType = "RIDE", // "RIDE" | "WALLET"
  token,
  onPaymentSuccess,
}) {
  const [activeTab, setActiveTab] = useState("CARD"); // "CARD" | "UPI" | "NETBANKING" | "BANK_TRANSFER"
  const [cardType, setCardType] = useState("CREDIT"); // "CREDIT" | "DEBIT"
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // UPI Form State
  const [upiSubTab, setUpiSubTab] = useState("INTENT"); // "INTENT" | "COLLECT" | "QR"
  const [upiVpa, setUpiVpa] = useState("");
  const [upiQrPayload, setUpiQrPayload] = useState("");
  const [isWaitingUpiCollect, setIsWaitingUpiCollect] = useState(false);

  // NetBanking State
  const [popularBanks, setPopularBanks] = useState([]);
  const [selectedBankCode, setSelectedBankCode] = useState("3022"); // HDFC default
  const [bankSearch, setBankSearch] = useState("");

  // Bank Transfer / Virtual Account State
  const [virtualAccount, setVirtualAccount] = useState(null);
  const [copiedField, setCopiedField] = useState("");
  const [utrNumber, setUtrNumber] = useState("");

  // Saved Payment Methods
  const [savedMethods, setSavedMethods] = useState([]);

  // Fetch Banks and Saved Methods on load
  useEffect(() => {
    if (isOpen) {
      loadBanks();
      if (token) loadSavedMethods();
      initOrder();
    }
  }, [isOpen, rideId]);

  const loadBanks = async () => {
    try {
      const banks = await PaymentService.getBanksList();
      setPopularBanks(banks);
    } catch (e) {
      setPopularBanks([
        { code: "3022", id: "HDFC", name: "HDFC Bank", logo: "🏛", popular: true },
        { code: "3044", id: "SBIN", name: "State Bank of India", logo: "🏛", popular: true },
        { code: "3021", id: "ICIC", name: "ICICI Bank", logo: "🏛", popular: true },
        { code: "3003", id: "UTIB", name: "Axis Bank", logo: "🏛", popular: true },
        { code: "3032", id: "KKBK", name: "Kotak Bank", logo: "🏛", popular: true },
        { code: "3038", id: "PUNB", name: "Punjab National Bank", logo: "🏛", popular: true },
      ]);
    }
  };

  const loadSavedMethods = async () => {
    try {
      const methods = await PaymentService.getSavedPaymentMethods(token);
      setSavedMethods(methods || []);
    } catch (e) {}
  };

  const initOrder = async () => {
    try {
      if (rideId) {
        const data = await PaymentService.createPaymentOrder(rideId, token);
        setPaymentSession(data);
      }
    } catch (e) {
      console.warn("Order session initial creation warning:", e);
    }
  };

  // Card formatting
  const handleCardNumberChange = (e) => {
    const formatted = PaymentService.formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setExpiry(val);
  };

  // 1. Process Card Payment (Credit & Debit)
  const handleCardPayment = async () => {
    if (!cardNumber || cardNumber.replace(/\s+/g, "").length < 15) {
      toast.error("Please enter a valid 16-digit card number.");
      return;
    }
    if (!expiry || !expiry.includes("/")) {
      toast.error("Please enter card expiry in MM/YY format.");
      return;
    }
    if (!cvv || cvv.length < 3) {
      toast.error("Please enter a valid 3 or 4 digit CVV.");
      return;
    }

    const [mm, yy] = expiry.split("/");
    setIsProcessing(true);

    try {
      let session = paymentSession;
      if (!session?.paymentSessionId && rideId) {
        session = await PaymentService.createPaymentOrder(rideId, token);
        setPaymentSession(session);
      }

      const res = await PaymentService.payWithCard(
        {
          orderId: session?.orderId || `order_${rideId || Date.now()}`,
          paymentSessionId: session?.paymentSessionId || `session_${Date.now()}`,
          cardNumber,
          cardHolderName: cardHolder || "Voyago Passenger",
          cardExpiryMm: mm,
          cardExpiryYy: yy.length === 2 ? `20${yy}` : yy,
          cardCvv: cvv,
          cardType,
          saveCard,
        },
        token
      );

      toast.success(`${cardType === "DEBIT" ? "Debit" : "Credit"} Card authorized successfully!`);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          channel: cardType === "DEBIT" ? "DEBIT_CARD" : "CREDIT_CARD",
          orderId: session?.orderId,
          amount,
        });
      }
      onClose();
    } catch (err) {
      console.error("Card payment error:", err);
      toast.error(err.response?.data?.message || "Failed to process card payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Process UPI Payment
  const handleUpiPayment = async (channelType = upiSubTab.toLowerCase()) => {
    if (channelType === "collect" && (!upiVpa || !upiVpa.includes("@"))) {
      toast.error("Please enter a valid UPI ID (e.g., username@okhdfcbank).");
      return;
    }

    setIsProcessing(true);
    try {
      let session = paymentSession;
      if (!session?.paymentSessionId && rideId) {
        session = await PaymentService.createPaymentOrder(rideId, token);
        setPaymentSession(session);
      }

      const res = await PaymentService.payWithUPI(
        {
          orderId: session?.orderId || `order_${rideId || Date.now()}`,
          paymentSessionId: session?.paymentSessionId || `session_${Date.now()}`,
          upiId: upiVpa,
          channel: channelType === "qr" ? "qrcode" : channelType,
          amount,
        },
        token
      );

      if (channelType === "qrcode" || channelType === "qr") {
        setUpiQrPayload(res.data?.qrData || `upi://pay?pa=voyago@icici&am=${amount}`);
      } else if (channelType === "collect") {
        setIsWaitingUpiCollect(true);
        toast.info(`Collect notification sent to ${upiVpa}. Please approve in your UPI app.`);
      } else if (channelType === "intent") {
        toast.success("Launching UPI App...");
        const intentUrl = res.data?.intentPayload?.default || `upi://pay?pa=voyago.rides@icici&am=${amount}`;
        window.location.href = intentUrl;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "UPI payment initiation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Process NetBanking Payment
  const handleNetBankingPayment = async () => {
    if (!selectedBankCode) {
      toast.error("Please select your bank.");
      return;
    }

    setIsProcessing(true);
    try {
      let session = paymentSession;
      if (!session?.paymentSessionId && rideId) {
        session = await PaymentService.createPaymentOrder(rideId, token);
        setPaymentSession(session);
      }

      const res = await PaymentService.payWithNetBanking(
        {
          orderId: session?.orderId || `order_${rideId || Date.now()}`,
          paymentSessionId: session?.paymentSessionId || `session_${Date.now()}`,
          bankCode: selectedBankCode,
        },
        token
      );

      toast.success("Redirecting to Bank Secure Login...");
      if (res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else if (onPaymentSuccess) {
        onPaymentSuccess({ channel: "NETBANKING", orderId: session?.orderId, amount });
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "NetBanking transaction failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Generate Bank Transfer Virtual Account
  const handleGenerateVirtualAccount = async () => {
    setIsProcessing(true);
    try {
      const res = await PaymentService.generateVirtualAccount(
        {
          orderId: paymentSession?.orderId || `bt_${rideId || Date.now()}`,
          amount,
          rideId,
        },
        token
      );
      setVirtualAccount(res.data);
      toast.success("Dynamic Virtual Account Generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate bank transfer details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.info(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(""), 2500);
  };

  const filteredBanks = popularBanks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const cardNetwork = PaymentService.detectCardNetwork(cardNumber);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-zinc-900 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                Voyago Checkout
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-zinc-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-zinc-800 flex items-center gap-1">
                <FiLock size={10} /> 256-Bit SSL
              </span>
            </div>
            <h2 className="text-xl font-black font-display text-black dark:text-white mt-0.5">
              Select Payment Method
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Amount Due</span>
              <div className="text-xl font-black font-display text-black dark:text-white">
                ₹{Number(amount).toFixed(2)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-colors"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Channel Selection Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-neutral-100 dark:bg-zinc-900/60 border-b border-neutral-100 dark:border-zinc-900 text-xs font-bold">
          <button
            onClick={() => setActiveTab("CARD")}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "CARD"
                ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-sm font-black"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <FiCreditCard size={14} />
            <span>Cards</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("UPI");
              if (!upiQrPayload && upiSubTab === "QR") handleUpiPayment("qr");
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "UPI"
                ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-sm font-black"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <FaQrcode size={13} />
            <span>UPI</span>
          </button>

          <button
            onClick={() => setActiveTab("NETBANKING")}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "NETBANKING"
                ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-sm font-black"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <FaUniversity size={13} />
            <span>NetBanking</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("BANK_TRANSFER");
              if (!virtualAccount) handleGenerateVirtualAccount();
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "BANK_TRANSFER"
                ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-sm font-black"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <FiCopy size={13} />
            <span>Bank Wire</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* ================= CARD TAB ================= */}
          {activeTab === "CARD" && (
            <div className="space-y-4">
              
              {/* Credit / Debit Switcher */}
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-neutral-500">Card Classification</span>
                <div className="flex bg-neutral-100 dark:bg-zinc-900 rounded-xl p-0.5 text-xs font-bold">
                  <button
                    onClick={() => setCardType("CREDIT")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      cardType === "CREDIT"
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "text-neutral-500"
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    onClick={() => setCardType("DEBIT")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      cardType === "DEBIT"
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "text-neutral-500"
                    }`}
                  >
                    Debit Card
                  </button>
                </div>
              </div>

              {/* Monochromatic Interactive Card Visualizer */}
              <div className="relative w-full h-44 rounded-2xl p-5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white border border-neutral-700/60 shadow-xl overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-7 rounded-md bg-amber-400/90 border border-amber-300 shadow-inner flex items-center justify-center">
                      <div className="w-5 h-4 border border-amber-600/40 rounded-sm"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      {cardType}
                    </span>
                  </div>
                  <span className="text-sm font-black tracking-widest font-mono">
                    {cardNetwork}
                  </span>
                </div>

                <div className="text-lg sm:text-xl font-mono tracking-widest font-black text-neutral-200">
                  {cardNumber || "•••• •••• •••• ••••"}
                </div>

                <div className="flex justify-between items-end text-xs">
                  <div>
                    <span className="text-[9px] uppercase text-neutral-400 block font-semibold">
                      Cardholder
                    </span>
                    <span className="font-bold tracking-wide truncate max-w-[180px] block">
                      {cardHolder.toUpperCase() || "VOYAGO PASSENGER"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-neutral-400 block font-semibold text-right">
                      Expires
                    </span>
                    <span className="font-mono font-bold tracking-wider">
                      {expiry || "MM/YY"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Input Form */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4532 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-mono font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-black text-neutral-400">
                      {cardNetwork}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-mono font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-mono font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name as printed on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="saveCardBox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 rounded text-black dark:text-white accent-black dark:accent-white"
                  />
                  <label htmlFor="saveCardBox" className="text-xs text-neutral-500 select-none cursor-pointer">
                    Save this card securely as per RBI tokenization standards
                  </label>
                </div>
              </div>

              <button
                onClick={handleCardPayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Authorizing Card...</span>
                ) : (
                  <span>Pay ₹{Number(amount).toFixed(2)} with {cardType === "DEBIT" ? "Debit Card" : "Credit Card"}</span>
                )}
              </button>
            </div>
          )}

          {/* ================= UPI TAB ================= */}
          {activeTab === "UPI" && (
            <div className="space-y-4">
              
              {/* UPI Submode Switcher */}
              <div className="grid grid-cols-3 gap-2 bg-neutral-100 dark:bg-zinc-900 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setUpiSubTab("INTENT")}
                  className={`py-2 rounded-xl transition-all ${
                    upiSubTab === "INTENT"
                      ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs"
                      : "text-neutral-500"
                  }`}
                >
                  UPI Apps
                </button>
                <button
                  onClick={() => setUpiSubTab("COLLECT")}
                  className={`py-2 rounded-xl transition-all ${
                    upiSubTab === "COLLECT"
                      ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs"
                      : "text-neutral-500"
                  }`}
                >
                  UPI ID (VPA)
                </button>
                <button
                  onClick={() => {
                    setUpiSubTab("QR");
                    if (!upiQrPayload) handleUpiPayment("qr");
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    upiSubTab === "QR"
                      ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs"
                      : "text-neutral-500"
                  }`}
                >
                  Dynamic QR
                </button>
              </div>

              {/* Submode 1: UPI App Intent Buttons */}
              {upiSubTab === "INTENT" && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-neutral-500">
                    Tap your preferred UPI app to open and complete payment instantly:
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleUpiPayment("intent")}
                      className="p-3.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/50 hover:bg-neutral-100 dark:hover:bg-zinc-900 flex items-center gap-3 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center shadow-xs">
                        <FaGooglePay size={20} />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">Google Pay</span>
                    </button>

                    <button
                      onClick={() => handleUpiPayment("intent")}
                      className="p-3.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/50 hover:bg-neutral-100 dark:hover:bg-zinc-900 flex items-center gap-3 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center shadow-xs">
                        <SiPhonepe size={18} />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">PhonePe</span>
                    </button>

                    <button
                      onClick={() => handleUpiPayment("intent")}
                      className="p-3.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/50 hover:bg-neutral-100 dark:hover:bg-zinc-900 flex items-center gap-3 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center shadow-xs">
                        <SiPaytm size={18} />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">Paytm UPI</span>
                    </button>

                    <button
                      onClick={() => handleUpiPayment("intent")}
                      className="p-3.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/50 hover:bg-neutral-100 dark:hover:bg-zinc-900 flex items-center gap-3 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center shadow-xs">
                        <FaQrcode size={16} />
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">BHIM / CRED</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submode 2: UPI Collect ID */}
              {upiSubTab === "COLLECT" && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank, mobile@upi"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>

                  {isWaitingUpiCollect ? (
                    <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-center space-y-2 animate-pulse">
                      <FiClock className="mx-auto text-xl text-black dark:text-white animate-spin" />
                      <h4 className="text-sm font-black text-black dark:text-white">
                        Collect Request Sent!
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Open your UPI application and accept the pending request for ₹{Number(amount).toFixed(2)}.
                      </p>
                      <button
                        onClick={() => {
                          if (onPaymentSuccess) {
                            onPaymentSuccess({ channel: "UPI_COLLECT", orderId: paymentSession?.orderId, amount });
                          }
                          onClose();
                        }}
                        className="mt-2 text-xs font-bold text-black dark:text-white underline"
                      >
                        I've completed payment
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpiPayment("collect")}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <span>Sending Request...</span> : <span>Send UPI Collect Request</span>}
                    </button>
                  )}
                </div>
              )}

              {/* Submode 3: Dynamic QR Code */}
              {upiSubTab === "QR" && (
                <div className="text-center space-y-3 py-2">
                  <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-neutral-300 shadow-md flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        upiQrPayload || `upi://pay?pa=voyago.rides@icici&am=${amount}`
                      )}`}
                      alt="UPI Dynamic QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-black dark:text-white">
                      Scan with any UPI App
                    </h4>
                    <p className="text-xs text-neutral-500">
                      GPay, PhonePe, Paytm, CRED or BHIM scanner
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (onPaymentSuccess) {
                        onPaymentSuccess({ channel: "UPI_QR", orderId: paymentSession?.orderId, amount });
                      }
                      onClose();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-neutral-100 dark:bg-zinc-900 text-black dark:text-white text-xs font-bold border border-neutral-200 dark:border-zinc-800"
                  >
                    Check Status after Scanning
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ================= NETBANKING TAB ================= */}
          {activeTab === "NETBANKING" && (
            <div className="space-y-4">
              
              {/* Popular Banks Grid */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Popular Banks
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {popularBanks.slice(0, 6).map((bank) => (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => setSelectedBankCode(bank.code)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedBankCode === bank.code
                          ? "border-black dark:border-white bg-neutral-100 dark:bg-zinc-900 shadow-xs"
                          : "border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/30 hover:bg-neutral-100"
                      }`}
                    >
                      <div className="text-base mb-1">{bank.logo || "🏛"}</div>
                      <span className="text-xs font-bold text-black dark:text-white block truncate">
                        {bank.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* All Banks Search */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Or Search from 50+ Retail Banks
                </label>
                <div className="relative mb-2">
                  <FiSearch className="absolute left-3.5 top-3.5 text-neutral-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search bank name..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white focus:outline-none"
                  />
                </div>

                <select
                  value={selectedBankCode}
                  onChange={(e) => setSelectedBankCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white focus:outline-none"
                >
                  {filteredBanks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name} (Code: {b.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNetBankingPayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <span>Connecting to Bank...</span> : <span>Proceed to Bank Login</span>}
              </button>
            </div>
          )}

          {/* ================= BANK TRANSFER (WIRE / VAN) TAB ================= */}
          {activeTab === "BANK_TRANSFER" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-zinc-800">
                  <span className="text-xs font-black uppercase text-neutral-400">
                    Single-Use Virtual Account
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white">
                    NEFT / IMPS / RTGS
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Virtual Account Number</span>
                    <button
                      onClick={() => handleCopy(virtualAccount?.virtual_account_number || "VOYAGO89283749", "Account Number")}
                      className="font-mono font-bold text-black dark:text-white flex items-center gap-1.5 hover:underline"
                    >
                      <span>{virtualAccount?.virtual_account_number || "VOYAGO89283749"}</span>
                      {copiedField === "Account Number" ? <FiCheck className="text-green-500" /> : <FiCopy />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">IFSC Code</span>
                    <button
                      onClick={() => handleCopy(virtualAccount?.ifsc || "YESB0CMSNOC", "IFSC Code")}
                      className="font-mono font-bold text-black dark:text-white flex items-center gap-1.5 hover:underline"
                    >
                      <span>{virtualAccount?.ifsc || "YESB0CMSNOC"}</span>
                      {copiedField === "IFSC Code" ? <FiCheck className="text-green-500" /> : <FiCopy />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Beneficiary Name</span>
                    <span className="font-bold text-black dark:text-white truncate max-w-[200px]">
                      {virtualAccount?.beneficiary_name || "Voyago Escrow Services Pvt Ltd"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Bank Name</span>
                    <span className="font-bold text-black dark:text-white">
                      {virtualAccount?.bank_name || "YES Bank (Cashfree Escrow)"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Enter Transfer Reference / UTR (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 16-digit Bank UTR Number"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-sm font-mono font-bold text-black dark:text-white focus:outline-none"
                />
              </div>

              <button
                onClick={() => {
                  toast.success("Bank Transfer logged! Our webhook reconciler will verify within minutes.");
                  if (onPaymentSuccess) {
                    onPaymentSuccess({ channel: "BANK_TRANSFER_VAN", orderId: paymentSession?.orderId, amount });
                  }
                  onClose();
                }}
                className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Submit Transfer Confirmation</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer Security Badge */}
        <div className="px-6 py-3 bg-neutral-50 dark:bg-zinc-900 border-t border-neutral-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <FiShield className="text-black dark:text-white" />
            <span>Encrypted via Cashfree PG Gateway</span>
          </div>
          <span className="font-bold text-black dark:text-white">Escrow Protected</span>
        </div>

      </div>
    </div>
  );
}
