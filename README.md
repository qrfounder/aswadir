# Massar (مسار), Habit & Task Flow

A React + Vite landing and checkout for Massar, the habit and task tracker brand. Stripe payments are processed via an embedded Node/Express server that also serves the built frontend. Designed to run on Easypanel (Hostinger VPS) or any Node host.

## Stack

- Vite + React 18 (frontend)
- Stripe Payment Element with deferred PaymentIntent flow
- Express 5 (backend) serving `/api/*` and the Vite build
- Tailwind + shadcn UI primitives

## Prerequisites

- Node.js 20+
- npm 9+
- A Stripe account (test mode keys work)
- Easypanel on a Hostinger VPS (or any host that runs Docker / Node)

## Local development

```bash
npm install
cp .env.example .env.local
# fill in Stripe keys (see .env.example)
```

**Recommended — frontend + API together (member accounts, checkout):**

```bash
npm run dev:all
```

- Site: http://localhost:5173/
- API: http://localhost:3000 (Vite proxies `/api` → 3000)

**Smoke test** (API must be running):

```bash
npm run smoke:member
```

To run the full stack locally exactly as it runs in production:

```bash
npm run build
PORT=3000 STRIPE_SECRET_KEY=sk_test_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx node server.js
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local` for local dev. In Easypanel, set these in the project's Environment tab.

| Variable | Where | Notes |
|---|---|---|
| `STRIPE_PUBLISHABLE_KEY` | Runtime (server → `/api/config`) | `pk_test_...` or `pk_live_...` — **required** |
| `STRIPE_SECRET_KEY` | Runtime (server) | `sk_test_...` or `sk_live_...` — never expose to browser |
| `STRIPE_WEBHOOK_SECRET` | Runtime (server) | `whsec_...` from your Stripe webhook endpoint |
| `STRIPE_PRICE_TASK` / `HABIT` / `BUNDLE` | Runtime (server) | Live Price IDs from `npm run stripe:setup` |
| `SITE_URL` | Runtime (server) | `https://aswadir.store` in production |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Build-time (optional) | Legacy; frontend uses `/api/config` at runtime |
| `VITE_API_BASE_URL` | Build-time (frontend) | Leave empty when frontend and API share a domain |
| `PORT` | Runtime (server) | Defaults to 3000, Easypanel sets this automatically |
| `HOST` | Runtime (server) | Defaults to 0.0.0.0 |
| `DATABASE_PATH` | Runtime (server) | SQLite file, e.g. `/app/data/massar.db` — **use a persistent volume** |
| `ADMIN_USERNAME` | Runtime (server) | Mojourney admin login (`/mojourney/login`). Defaults to `admin` |
| `ADMIN_PASSWORD` | Runtime (server) | Plain password for admin login — **never commit** |
| `ADMIN_PASSWORD_HASH` | Runtime (server) | Optional bcrypt hash instead of `ADMIN_PASSWORD` (`node scripts/hash-admin-password.mjs`) |

After deploy, verify admin is wired: `GET /api/health` must show `"adminConfigured": true`. If `false`, login returns `admin_not_configured` (503).

The `VITE_*` vars are baked into the static bundle at build time. The non-prefixed vars are read by `server.js` at runtime.

**Pricing (server-enforced, SAR):** habit/task **99**, bundle **149** — see `api/catalog.js` and `src/lib/products.js`.

## Routes

| Route | Page |
|---|---|
| `/` | Landing page |
| `/checkout` | Checkout (email + WhatsApp + Stripe) |
| `/thank-you` | After payment → link to create account |
| `/setup-account` | Create password, claim purchase |
| `/login` | Member login |
| `/dashboard` | Member area (protected) |
| `/api/createPaymentIntent` | POST, creates Stripe PaymentIntent |
| `/api/stripe-webhook` | POST, receives Stripe webhook events |
| `/api/auth/*` | Register, login, session |
| `/api/member/dashboard` | GET, member data + updates feed |
| `/api/health` | GET, health check |

## Deploy to Easypanel (Hostinger)

### 1. Push the repo to GitHub or GitLab

Easypanel pulls from a Git provider. Make sure `.env.local` is gitignored (it already is).

### 2. In Easypanel, create a new App

- **Source:** GitHub (connect your account, pick this repo).
- **Build method:** Dockerfile (recommended, uses the included `Dockerfile`). Or Nixpacks (auto-detects Node).
- **Branch:** `main`.

### 3. Set environment variables

In the project's **Environment** tab, add:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_API_BASE_URL=
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NODE_ENV=production
DATABASE_PATH=/app/data/massar.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password-here
```

### 3b. Persistent storage (required for member accounts)

Mount a volume in Easypanel:

- **Mount path:** `/app/data`
- Keeps SQLite (`massar.db`) across redeploys

Without this, **all user accounts are lost** on every deploy.

Publishable keys are served at runtime from `/api/config` — set `STRIPE_PUBLISHABLE_KEY` in Environment and redeploy (no rebuild required for key rotation).

### 4. Configure the service

- **Internal URL for domain:** `http://<service-name>:3000` (or the port Easypanel shows after deploy)
- **Port:** `3000` (or whatever `PORT` is set to)
- **Health check path:** `/api/health`
- **Resources:** 0.5 CPU / 512 MB RAM is plenty for this app

### 5. Deploy

Click **Deploy**. Watch the build logs. Once it shows `Massar server listening on http://0.0.0.0:3000`, it's live.

### 6. Attach your domain

In the project's **Domains** tab:
- Add `aswadir.store` and `www.aswadir.store`.
- Easypanel will auto-issue a Let's Encrypt SSL certificate once DNS resolves.

### 7. Point Namecheap DNS to Hostinger VPS

In Namecheap > Domain List > aswadir.store > Manage > Advanced DNS:

| Type | Host | Value | TTL |
|---|---|---|---|
| A Record | `@` | `<your Hostinger VPS IP>` | Automatic |
| A Record | `www` | `<your Hostinger VPS IP>` | Automatic |

Find your VPS IP in Hostinger > VPS > your server > overview.

Delete any default URL Redirect or parking records.

Save. Propagation: 5 to 60 minutes.

Verify:
```bash
dig aswadir.store +short
```
Should return your VPS IP.

### 8. Wire up Stripe webhook

After your domain is live with SSL:

1. Stripe Dashboard > Developers > Webhooks > Add endpoint.
2. URL: `https://aswadir.store/api/stripe-webhook`
3. Events (subscriptions): `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
4. Copy the signing secret (starts with `whsec_...`) into Easypanel Environment as `STRIPE_WEBHOOK_SECRET`.
5. Click **Redeploy** in Easypanel.
6. Back in Stripe, click **Send test webhook** to confirm 200 OK.

### 9. Apple Pay domain verification

1. Stripe Dashboard > Settings > Payment methods > Apple Pay > Add new domain.
2. Enter: `aswadir.store`.
3. Download the verification file.
4. Replace contents of `public/.well-known/apple-developer-merchantid-domain-association` with the downloaded text.
5. Commit, push, Easypanel auto-redeploys.
6. Confirm accessible at `https://aswadir.store/.well-known/apple-developer-merchantid-domain-association`.
7. Click **Verify** in Stripe Dashboard.

## Test cards

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Insufficient funds decline |
| `4000 0027 6000 3184` | Requires 3DS authentication |

Any future expiry, any 3-digit CVC.

## Going live (real money)

1. **Activate** your Stripe account (business details, bank account).
2. In [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys), switch to **Live** and copy `pk_live_` + `sk_live_`.
3. Put live keys in `.env` locally, then create **live** products/prices:
   ```bash
   npm run stripe:setup    # uses sk_live_ from .env → writes STRIPE_PRICE_* to .env
   npm run stripe:verify   # must pass before deploy
   ```
4. **Live webhook** (Dashboard → Developers → Webhooks, Live mode):
   - URL: `https://aswadir.store/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET` in Easypanel
5. Easypanel Environment (all **live** values):
   ```
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_TASK=price_...
   STRIPE_PRICE_HABIT=price_...
   STRIPE_PRICE_BUNDLE=price_...
   SITE_URL=https://aswadir.store
   NODE_ENV=production
   DATABASE_PATH=/app/data/massar.db
   ```
6. **Redeploy**. Confirm `GET https://aswadir.store/api/health` shows `"stripeMode":"live"` and `"stripeReady":true`.
7. Run one real $0 trial checkout yourself, then refund in Dashboard if needed.
8. Enable **Radar** rules (block high-risk, require CVC) in Live mode.

## AI agent tooling (Claude Code, Cursor, etc.)

This repo ships a curated set of agent skills under `.claude/`. The project-specific
skill (`.claude/skills/massar/SKILL.md`) teaches any Claude/Cursor agent the
stack, the Stripe rules, and the deployment constraints automatically on every
session.

First-time setup on a fresh clone:

```bash
./scripts/install-claude-skills.sh
```

That installs (gitignored, so each developer keeps their own copy):

- **garrytan/gstack** — `/plan-ceo-review`, `/plan-eng-review`, `/review`, `/qa` slash commands.
- **nextlevelbuilder/ui-ux-pro-max-skill** — landing + checkout design library.
- **obra/superpowers** — TDD + spec + subagent discipline.
- **anthropics/skills** (sparse) — official `frontend-design`, `webapp-testing`, `mcp-builder`, `theme-factory`.
- **wshobson/agents** — specialist agents for payments, security, React perf, Express, devops.

Optional MCP servers are configured in `.claude/mcp.json`:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx        # enables the GitHub MCP server
export STRIPE_SECRET_KEY=sk_test_xxx               # if you flip the Stripe MCP entry to enabled
docker pull ghcr.io/github/github-mcp-server       # one-time
```

See `.claude/README.md` for the full rationale and usage examples.

## Project structure

```
api/
  createPaymentIntent.js   Express handler: creates Stripe PaymentIntent
  stripe-webhook.js        Express handler: processes Stripe webhooks
server.js                  Express app: serves dist/ + /api/* routes
Dockerfile                 Multi-stage build for Easypanel
src/
  api/client.js            Frontend API client
  lib/stripe.js            Stripe.js loader
  pages/CheckoutPage.jsx   Two-step checkout
  pages/ProductPage.jsx    Landing
  pages/ThankYouPage.jsx   Success
public/
  .well-known/             Apple Pay domain verification
  logo-512.png             Square icon for Stripe
  logo-wide.png            Landscape logo for Stripe / OG image
```
