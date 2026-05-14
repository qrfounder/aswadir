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
# fill in Stripe keys
npm run dev      # frontend only on http://localhost:5173
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
| `VITE_STRIPE_PUBLISHABLE_KEY` | Build-time (frontend) | `pk_test_...` or `pk_live_...` |
| `VITE_API_BASE_URL` | Build-time (frontend) | Leave empty when frontend and API share a domain |
| `STRIPE_SECRET_KEY` | Runtime (server) | Never expose to browser |
| `STRIPE_WEBHOOK_SECRET` | Runtime (server) | `whsec_...` from your Stripe webhook endpoint |
| `PORT` | Runtime (server) | Defaults to 3000, Easypanel sets this automatically |
| `HOST` | Runtime (server) | Defaults to 0.0.0.0 |

The `VITE_*` vars are baked into the static bundle at build time. The non-prefixed vars are read by `server.js` at runtime.

## Routes

| Route | Page |
|---|---|
| `/` | Landing page |
| `/checkout` | Two-step checkout (info, then Stripe Payment Element) |
| `/thank-you` | Confirmation page |
| `/api/createPaymentIntent` | POST, creates Stripe PaymentIntent |
| `/api/stripe-webhook` | POST, receives Stripe webhook events |
| `/api/health` | GET, used by Easypanel/Docker health check |

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
```

If using the Dockerfile, also add build-time args under **Build args**:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_API_BASE_URL=
```

These are needed because Vite bakes `VITE_*` vars into the static bundle during `npm run build`.

### 4. Configure the service

- **Port:** `3000`
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
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`.
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

1. Activate your Stripe account fully.
2. Toggle Stripe Dashboard to Live mode.
3. Replace `pk_test_` / `sk_test_` with `pk_live_` / `sk_live_` in Easypanel.
4. Recreate the webhook endpoint in Live mode, update `STRIPE_WEBHOOK_SECRET`.
5. Enable Radar rules (block high-risk score, require CVC).
6. Redeploy.

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
