# Massar tracking — TikTok Ads + admin analytics

## TikTok Pixel

| Setting | Value |
|--------|--------|
| Pixel ID | `CU1EACBC77UAQJITPDR0` |
| Env override | `VITE_TIKTOK_PIXEL_ID` (Docker build arg on Easypanel) |

Loaded on app start (`src/main.jsx` → `src/lib/tiktok-pixel.js`).

## Event map (site → TikTok → admin `/mojourney`)

| User action | When | Internal `event_type` | TikTok event |
|-------------|------|---------------------|--------------|
| Page view | Any route change | `page_view` | `page` |
| Checkout visit | `/checkout` load | `checkout_view` | `ViewContent`, `InitiateCheckout` |
| Add to cart | Step 1 → Continue to payment | `add_to_cart` | `AddToCart` |
| Checkout started | Dev test button / metadata | `checkout_started` | — |
| Payment form shown | Checkout step 2 + Stripe ready | `add_payment_info` | `AddPaymentInfo` |
| Purchase | `/checkout/success` after paid activate, or `/thank-you` | `payment_success` | `CompletePayment`, `Purchase` |

Purchase is **deduped** per `session_id` so webhook + success page do not double-count.

## UTM / TikTok ads

Use campaign links from **Mojourney → Campaign links** (preset `utm_source=tiktok`).

Attribution is stored in `sessionStorage` and sent with every analytics event.

## Verify before launching ads

1. Deploy with `VITE_TIKTOK_PIXEL_ID=CU1EACBC77UAQJITPDR0` in build args.
2. TikTok Events Manager → Test events (or browser extension).
3. Run funnel: landing → checkout step 1 → step 2 → test payment → success.
4. Mojourney → **Live** tab: confirm events appear within seconds.
5. Mojourney → **Analytics** funnel: unique sessions per step.

```bash
npm run build
npm run scan:pages
npm run prelaunch:audit   # optional script
```
