import { fulfillCheckoutSession } from "./checkout-fulfillment.js";

export default async function completeCheckout(req, res) {
  try {
    const sessionId = String(req.query.session_id || req.body?.session_id || "").trim();
    if (!sessionId) {
      return res.status(400).json({ error: "session_id_required" });
    }

    const result = await fulfillCheckoutSession(sessionId);
    if (!result.ok) {
      const status =
        result.error === "purchase_not_found"
          ? 404
          : result.error === "checkout_incomplete"
            ? 409
            : 400;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("[completeCheckout]", err);
    return res.status(500).json({
      error: "server_error",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
}
