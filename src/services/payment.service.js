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

    const cashfree = await this.loadSDK();
    
    // Launch official Cashfree Hosted Checkout
    return cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self",
      ...(returnUrl ? { returnUrl } : {}),
    });
  }
}

export default PaymentService;
