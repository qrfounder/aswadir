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
    async syncAll() {
      return request("/api/member/sync");
    },
    async pushSync(namespace, payload) {
      const res = await request(`/api/member/sync/${namespace}`, {
        method: "PUT",
        body: JSON.stringify({ payload }),
      });
      return res.updatedAt;
    },
    async getDailyNote(date) {
      const q = new URLSearchParams({ date });
      return request(`/api/member/daily-note?${q.toString()}`);
    },
    async saveDailyNote(date, content) {
      return request("/api/member/daily-note", {
        method: "PUT",
        body: JSON.stringify({ date, content }),
      });
    },
    async listDailyNotes() {
      return request("/api/member/daily-notes");
    },
  },
  functions: {
    async invoke(name, payload = {}) {
      const data = await invokeWithDevFallback(name, payload);
      return { data };
    },
  },
  admin: {
    async login(username, password) {
      return request("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    },
    async logout() {
      return request("/api/admin/logout", { method: "POST" });
    },
    async me() {
      return request("/api/admin/me");
    },
    async overview() {
      return request("/api/admin/overview");
    },
    async live(params = {}) {
      const q = new URLSearchParams();
      if (params.since) q.set("since", params.since);
      if (params.limit) q.set("limit", String(params.limit));
      const suffix = q.toString() ? `?${q}` : "";
      return request(`/api/admin/live${suffix}`);
    },
    async users(params = {}) {
      const q = new URLSearchParams();
      if (params.q) q.set("q", params.q);
      if (params.limit) q.set("limit", String(params.limit));
      const suffix = q.toString() ? `?${q}` : "";
      return request(`/api/admin/users${suffix}`);
    },
    async userDetail(id) {
      return request(`/api/admin/users/${encodeURIComponent(id)}`);
    },
    async purchases(params = {}) {
      const q = new URLSearchParams();
      if (params.status) q.set("status", params.status);
      if (params.limit) q.set("limit", String(params.limit));
      const suffix = q.toString() ? `?${q}` : "";
      return request(`/api/admin/purchases${suffix}`);
    },
    async subscriptions(params = {}) {
      const q = new URLSearchParams();
      if (params.limit) q.set("limit", String(params.limit));
      const suffix = q.toString() ? `?${q}` : "";
      return request(`/api/admin/subscriptions${suffix}`);
    },
    async analytics(params = {}) {
      const q = new URLSearchParams();
      if (params.hours) q.set("hours", String(params.hours));
      const suffix = q.toString() ? `?${q}` : "";
      return request(`/api/admin/analytics${suffix}`);
    },
    async campaignLinks() {
      return request("/api/admin/campaign-links");
    },
  },
};

export default client;
