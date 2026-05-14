---
name: massar-project-context
description: |
  Project context for Massar (مسار), a Vite + React 18 landing & Stripe checkout
  served by Express 5, deployed to Easypanel on Hostinger. Load this skill at
  the start of any task touching this repo so you respect the stack, the
  brand, the payment-correctness rules, and the deployment constraints.
when_to_use: |
  Always, when working in this repository.
---

# Massar (مسار) — project skill

You are working on **Massar**, a brand for habit & task tracking. This repo
is the marketing site + Stripe checkout, not the tracker app itself.

## Stack (do not propose changes to these without explicit approval)

- **Frontend**: Vite 6, React 18, **JavaScript** (not TypeScript). Type checks
  run through `tsc -p ./jsconfig.json` with `checkJs`.
- **Styling**: Tailwind CSS + `shadcn/ui` (Radix primitives). Animations via
  Framer Motion.
- **Routing**: `react-router-dom` v6.
- **Data**: `@tanstack/react-query` v5.
- **Payments**: `@stripe/react-stripe-js` + `@stripe/stripe-js` using the
  **Payment Element with a deferred PaymentIntent** flow.
- **Backend**: Express 5 in `server.js`, with `/api/createPaymentIntent` and
  `/api/stripe-webhook` handlers under `api/`.
- **Deploy**: Dockerfile → Easypanel on a Hostinger VPS. Domain
  `aswadir.store`. Health check at `/api/health`.

## Repo layout

```
api/                          Express handlers (createPaymentIntent, stripe-webhook)
server.js                     Express 5 app, serves dist/ + /api/*
src/
  api/client.js               Frontend fetch wrapper
  components/                 UI (shadcn-style)
  hooks/                      Custom React hooks
  lib/stripe.js               Stripe.js loader (publishable key)
  pages/
    ProductPage.jsx           Landing
    CheckoutPage.jsx          Two-step checkout (info → Payment Element)
    ThankYouPage.jsx          Confirmation
  utils/
public/                       Static assets, includes .well-known for Apple Pay
Dockerfile                    Multi-stage build (node:20-alpine)
```

## Hard rules

1. **Never expose `STRIPE_SECRET_KEY` to the browser.** Only `VITE_STRIPE_PUBLISHABLE_KEY`
   may be referenced from `src/`. Server-only secrets live in `process.env`
   and are read inside `api/`, `server.js`.
2. **Stripe webhook handler must receive the raw body.** `server.js` mounts
   `express.raw({ type: "application/json" })` **before** `express.json()`.
   Do not reorder this. Do not move `/api/stripe-webhook` after the JSON
   middleware.
3. **Idempotency on payment events.** When extending `api/stripe-webhook.js`,
   use the event `id` for dedupe before doing side effects (DB writes,
   emails, fulfillment). Stripe retries.
4. **Apple Pay verification file is sacred.**
   `public/.well-known/apple-developer-merchantid-domain-association` is
   served verbatim with `Content-Type: text/plain`. Don't run it through any
   build transform.
5. **Build-time vs runtime env.** `VITE_*` vars are baked into the static
   bundle at `npm run build`. They must be passed as **Docker build args**
   in Easypanel, not just runtime env.
6. **No TypeScript files.** This is a JS project with checkJs. Don't add
   `.ts`/`.tsx`; extend types via JSDoc when needed.
7. **Bilingual UI (Arabic + English).** Brand name is مسار. Respect RTL
   where Arabic strings appear; lean on Tailwind's `dir` utilities and
   logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) rather than
   `ml-*`/`mr-*`.
8. **Conversion is the metric.** This is a checkout site. Before refactoring
   anything in `ProductPage.jsx` or `CheckoutPage.jsx`, ask: does this make
   the payment flow faster, clearer, or less likely to drop off?

## Commands you will use often

```bash
npm run dev          # Vite dev server on :5173
npm run build        # Production build to dist/
npm run start        # node server.js (serves dist + /api)
npm run lint         # eslint --quiet
npm run lint:fix
npm run typecheck    # tsc against jsconfig.json
```

## Local end-to-end test of the Stripe flow

```bash
npm run build
PORT=3000 \
STRIPE_SECRET_KEY=sk_test_xxx \
STRIPE_WEBHOOK_SECRET=whsec_xxx \
node server.js
# then in another shell:
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger payment_intent.succeeded
```

## Skill collaboration

When you load this skill, also consider invoking:

- **ui-ux-pro-max** — for any visual change to `ProductPage` or `CheckoutPage`.
- **anthropic-skills/frontend-design** — for component-level polish.
- **superpowers/tdd** — for changes to `api/*` (write the failing test against
  the Express handler first).
- **gstack `/review`** — before opening a PR.
- **wshobson payment-integration / security-auditor** — for any change that
  touches Stripe, secrets, or webhook handling.
