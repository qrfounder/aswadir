/**
 * Massar API client — calls Express /api/* with session cookies.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status}`);
    err.status = res.status;
    try {
      err.data = await res.json();
    } catch {
      /* ignore */
    }
    throw err;
  }
  return res.json();
}

async function devSimulateCheckout(payload) {
  return request("/api/dev/simulate-order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function invokeWithDevFallback(name, payload) {
  const isDev = import.meta.env.DEV;

  if (name === "createCheckoutSession") {
    return request("/api/createCheckoutSession", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  if (isDev && name === "createPaymentIntent") {
    try {
      return await request("/api/createPaymentIntent", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (firstErr) {
      const sim = await devSimulateCheckout(payload);
      return {
        simulated: true,
        paymentIntentId: sim.checkoutSessionId || sim.paymentIntentId,
        checkoutSessionId: sim.checkoutSessionId,
      };
    }
  }

  return request(`/api/${name}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const client = {
  auth: {
    async me() {
      return request("/api/auth/me");
    },
    async register(payload) {
      return request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async login(email, password) {
      return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    async logout() {
      return request("/api/auth/logout", { method: "POST" });
    },
    async claimPurchase({ paymentIntentId, checkoutSessionId }) {
      return request("/api/auth/claim-purchase", {
        method: "POST",
        body: JSON.stringify({ paymentIntentId, checkoutSessionId }),
      });
    },
    async changePassword(currentPassword, newPassword) {
      return request("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
    redirectToLogin(returnUrl) {
      const next = encodeURIComponent(returnUrl || window.location.href);
      window.location.href = `/login?next=${next}`;
    },
  },
  checkout: {
    async complete(sessionId) {
      const q = new URLSearchParams({ session_id: sessionId });
      return request(`/api/checkout/complete?${q.toString()}`);
    },
    async activate(checkoutSessionId) {
      return request("/api/checkout/activate", {
        method: "POST",
        body: JSON.stringify({ checkoutSessionId }),
      });
    },
  },
  billing: {
    async openPortal() {
      return request("/api/billingPortal", { method: "POST" });
    },
  },
  member: {
    async dashboard() {
      return request("/api/member/dashboard");
    },
  },
  functions: {
    async invoke(name, payload = {}) {
      const data = await invokeWithDevFallback(name, payload);
      return { data };
    },
  },
};

export default client;
