/**
 * Massar API client.
 *
 * Calls Vercel serverless functions under /api/*.
 * If VITE_API_BASE_URL is empty (e.g. during local dev without `vercel dev`),
 * `createPaymentIntent` falls back to a simulated success so the UI flow
 * still works end-to-end for design preview.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
  const res = await fetch(url, {
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

export const client = {
  auth: {
    async me() {
      const err = new Error("Unauthenticated (public storefront)");
      err.status = 401;
      throw err;
    },
    logout() {
      try {
        localStorage.removeItem("massar_token");
      } catch {
        /* ignore */
      }
    },
    redirectToLogin() {
      /* no-op for storefront */
    },
  },
  functions: {
    /**
     * Invoke a serverless function by name. Maps to /api/<name>.
     */
    async invoke(name, payload = {}) {
      const isLocalDev = !API_BASE_URL && window.location.hostname === "localhost";

      if (isLocalDev && name === "createPaymentIntent") {
        console.warn(
          "[Massar] Local dev without backend, simulating PaymentIntent. Run `vercel dev` to test real Stripe locally.",
        );
        return { data: { clientSecret: null, simulated: true } };
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
