# `.claude/` — agent tooling for Massar

This folder configures Claude Code, Cursor, and any other Anthropic-compatible
agent runner for the Massar habit-flow repo.

## What's committed vs. what's installed locally

| Path | Committed? | What it is |
|---|---|---|
| `.claude/skills/massar/SKILL.md` | ✅ yes | Project-specific skill: stack, hard rules, layout, commands. |
| `.claude/mcp.json` | ✅ yes | MCP server config (GitHub, optional Stripe). Tokens read from env. |
| `.claude/skills/<vendor>/` | ❌ no (gitignored) | Vendored community skills installed by `scripts/install-claude-skills.sh`. |
| `.claude/agents/<vendor>/` | ❌ no (gitignored) | Cherry-picked specialist agents from `wshobson/agents`. |

## First-time setup

```bash
./scripts/install-claude-skills.sh
```

This installs:

- **garrytan/gstack** — `/plan-ceo-review`, `/plan-eng-review`, `/review`, `/qa` slash commands.
- **nextlevelbuilder/ui-ux-pro-max-skill** — landing + checkout design library (57 UI styles, 95 palettes, 56 font pairings).
- **obra/superpowers** — TDD + spec + subagent discipline framework.
- **anthropics/skills** (sparse) — official `frontend-design`, `webapp-testing`, `mcp-builder`, `theme-factory`.
- **wshobson/agents** (sparse) — specialist agents for payments, security, React performance, Express, devops.

Re-run the script any time to update everything to latest `main`.

## MCP servers

`.claude/mcp.json` is read by Claude Code (and recent Cursor builds). Before
first use:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx   # repo + workflow scopes
# optional, if you enable the Stripe MCP entry:
export STRIPE_SECRET_KEY=sk_test_xxx
```

The GitHub server requires Docker. Pull the image once:

```bash
docker pull ghcr.io/github/github-mcp-server
```

## How to use these skills

1. Open Claude Code / Cursor in the repo root.
2. The Massar project skill auto-loads — the agent now knows the stack, the
   Stripe rules, and the deployment constraints.
3. Invoke a vendor skill explicitly by name when you need it. Examples:
   - *"Use **ui-ux-pro-max** to redesign the hero section of `ProductPage.jsx`."*
   - *"Run a **gstack /review** on the diff in `api/`."*
   - *"Apply **superpowers/tdd** before touching the webhook handler."*
4. Cherry-pick a wshobson agent when the task is specialist:
   - *"Use **payment-integration** to add Apple Pay-only fallback."*
   - *"Use **security-auditor** to audit the new env handling."*

## Why this exact set?

See the conversation that produced this layout — short version:

- This is a **solo-founder checkout site**, so `gstack` (Garry Tan's exact
  setup) maps the workflow better than generic agent collections.
- Design carries weight here (landing + Stripe Payment Element), so
  `ui-ux-pro-max` + Anthropic's official `frontend-design` are pulled in.
- Payment correctness is non-negotiable, so the `superpowers` TDD loop and
  `wshobson/payment-integration` + `security-auditor` agents are first-class.
- Curated mega-lists (`voltagent/awesome-agent-skills`,
  `ComposioHQ/awesome-claude-skills`, `affaan-m/everything-claude-code`)
  are **not** vendored — they're indexes you browse on the web, not skills
  you install in bulk.
