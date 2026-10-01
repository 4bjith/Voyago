import api from "../api/axiosClient";

/**
 * 💳 Cashfree Frontend Payment Service
 * Integrates Cashfree JS SDK v3 and backend payment endpoints
 */
class PaymentService {
  static sdkPromise = null;

  /**
   * Dynamically loads the official Cashfree Web SDK (v3)
   */
  static async loadSDK() {
    if (window.Cashfree) {
      return window.Cashfree({ mode: "sandbox" });
    }

    if (!this.sdkPromise) {
      this.sdkPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
        if (existingScript) {
          existingScript.addEventListener("load", () => {
            resolve(window.Cashfree({ mode: "sandbox" }));
          });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.async = true;
        script.onload = () => {
          if (window.Cashfree) {
            resolve(window.Cashfree({ mode: "sandbox" }));
          } else {
            reject(new Error("Cashfree SDK failed to initialize on window object"));
          }
        };
        script.onerror = () => {
          this.sdkPromise = null;
          reject(new Error("Failed to load Cashfree JS SDK script"));
        };
        document.body.appendChild(script);
      });
    }

    return this.sdkPromise;
  }

  /**
   * Create Cashfree payment order from backend
   * @param {string} rideId - The ride / internal order ID
   * @param {string} token - JWT bearer token
   */
  static async createPaymentOrder(rideId, token) {
    const response = await api.post(
      "/api/payments/create-order",
      { rideId, orderId: rideId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data?.data;
  }

  /**
   * Query server-side verified payment status from backend
   * @param {string} orderId - Cashfree order ID or internal order ID
   * @param {string} token - JWT bearer token
   */
  static async getPaymentStatus(orderId, token) {
    const response = await api.get(`/api/payments/${orderId}/status`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  /**
   * Verify payment (legacy / direct POST support)
   * @param {Object} payload - { rideId, orderId, paymentMethod }
   * @param {string} token - JWT bearer token
   */
  static async verifyPayment(payload, token) {
    const response = await api.post("/api/payments/verify", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  /**
   * Launch Cashfree Hosted Checkout modal / redirection
   * @param {Object} options
   * @param {string} options.paymentSessionId - Returned from backend createPaymentOrder
   * @param {string} [options.returnUrl] - Optional redirect return URL
   */
  static async openCheckout({ paymentSessionId, returnUrl }) {
    if (!paymentSessionId) {
      throw new Error("Cannot launch Cashfree Checkout without a valid payment_session_id");
    }

    // Launch official Cashfree Hosted Checkout
    return cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self",
      ...(returnUrl ? { returnUrl } : {}),
    });
  }

  /**
   * Pay directly with Credit or Debit Card
   * @param {Object} payload - { orderId, paymentSessionId, cardNumber, cardHolderName, cardExpiryMm, cardExpiryYy, cardCvv, cardType, saveCard }
   * @param {string} token
   */
  static async payWithCard(payload, token) {
    const response = await api.post("/api/payments/pay/card", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  /**
   * Pay with UPI (Collect, Intent, or Dynamic QR)
   * @param {Object} payload - { orderId, paymentSessionId, upiId, channel, amount }
   * @param {string} token
   */
  static async payWithUPI(payload, token) {
    const response = await api.post("/api/payments/pay/upi", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  /**
   * Pay with NetBanking
   * @param {Object} payload - { orderId, paymentSessionId, bankCode }
   * @param {string} token
   */
  static async payWithNetBanking(payload, token) {
    const response = await api.post("/api/payments/pay/netbanking", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  /**
   * Generate Virtual Account for Bank Transfer (NEFT/IMPS/RTGS)
   * @param {Object} payload - { orderId, amount, rideId }
   * @param {string} token
   */
  static async generateVirtualAccount(payload, token) {
    const response = await api.post("/api/payments/pay/bank-transfer", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  /**
   * Fetch list of supported retail NetBanking banks
   */
  static async getBanksList() {
    const response = await api.get("/api/payments/banks");
    return response.data?.data || [];
  }

  /**
   * Fetch user's saved payment methods
   * @param {string} token
   */
  static async getSavedPaymentMethods(token) {
    const response = await api.get("/api/payments/user/saved-methods", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || [];
  }

  /**
   * Save a payment method to user profile
   * @param {Object} payload
   * @param {string} token
   */
  static async savePaymentMethod(payload, token) {
    const response = await api.post("/api/payments/user/saved-methods", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || [];
  }

  /**
   * Delete a saved payment method
   * @param {string} methodId
   * @param {string} token
   */
  static async deleteSavedPaymentMethod(methodId, token) {
    const response = await api.delete(`/api/payments/user/saved-methods/${methodId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || [];
  }

  /**
   * Format raw card number with spaces (e.g. 4532 1234 5678 9012)
   */
  static formatCardNumber(value = "") {
    const cleaned = value.replace(/\D/g, "").slice(0, 19);
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  /**
   * Detect Card Network from number
   */
  static detectCardNetwork(number = "") {
    const clean = number.replace(/\D/g, "");
    if (/^4/.test(clean)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "MASTERCARD";
    if (/^(60|65|81|82)/.test(clean)) return "RUPAY";
    if (/^3[47]/.test(clean)) return "AMEX";
    if (/^36/.test(clean)) return "DINERS";
    return "CARD";
  }

  /**
   * Basic Luhn Algorithm Validation
   */
  static isValidLuhn(number = "") {
    const clean = number.replace(/\D/g, "");
    if (clean.length < 13) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }
}

export default PaymentService;

