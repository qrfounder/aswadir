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

function isLocalHostname() {
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
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
    async claimPurchase(paymentIntentId) {
      return request("/api/auth/claim-purchase", {
        method: "POST",
        body: JSON.stringify({ paymentIntentId }),
      });
    },
    redirectToLogin(returnUrl) {
      const next = encodeURIComponent(returnUrl || window.location.href);
      window.location.href = `/login?next=${next}`;
    },
  },
  member: {
    async dashboard() {
      return request("/api/member/dashboard");
    },
  },
  functions: {
    async invoke(name, payload = {}) {
      if (isLocalHostname() && name === "createPaymentIntent") {
        try {
          const data = await request("/api/createPaymentIntent", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          return { data };
        } catch (firstErr) {
          try {
            console.warn(
              "[Massar] Stripe API unavailable — using dev simulate-order. Run: npm run dev:all",
            );
            const sim = await request("/api/dev/simulate-order", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            return {
              data: {
                simulated: true,
                paymentIntentId: sim.paymentIntentId,
              },
            };
          } catch {
            throw firstErr;
          }
        }
      }

      const data = await request(`/api/${name}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { data };
    },
  },
};

export default client;
