# TexAI — Setup & Requirements

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** 10+ — install with `pnpm install -g pnpm`
- A **Convex** account (free) — [https://dashboard.convex.dev](https://dashboard.convex.dev)
- At least one AI API key (Anthropic or OpenAI) for the chat feature

---

## Environment Variables (`.env.local`)

Create a `.env.local` file in the project root with the following variables:

```env
# =====================
# CONVEX (Database)
# =====================
# Run: pnpm convex:dev
# It will auto-populate these after you log in and create a project.
CONVEX_DEPLOYMENT=dev:your-deployment-id
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# =====================
# BETTER AUTH
# =====================
# Generate a secret with: openssl rand -base64 32
# Or use any random string with 32+ characters.
BETTER_AUTH_SECRET=your-random-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000

# =====================
# GOOGLE OAUTH (optional)
# =====================
# Get from: https://console.cloud.google.com/
# APIs & Services > Credentials > Create OAuth Client ID
# Type: Web application
# Redirect URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# =====================
# GITHUB OAUTH (optional)
# =====================
# Get from: https://github.com/settings/developers
# New OAuth App
# Homepage URL: http://localhost:3000
# Callback URL: http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# =====================
# AI PROVIDERS
# =====================
# Get Anthropic key from: https://console.anthropic.com/settings/keys
# Get OpenAI key from: https://platform.openai.com/api-keys
# You need at least ONE for the AI chat to work.
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...

# =====================
# LATEX (optional)
# =====================
# Leave blank — client-side preview uses latex.js, no external API needed.
LATEX_COMPILE_API_URL=
```

---

## Step-by-Step Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up Convex
```bash
pnpm convex:dev
```
This will:
- Open your browser to log in to Convex
- Ask you to create a new project (name it "texai" or anything)
- Auto-write `CONVEX_DEPLOYMENT` to `.env.local`
- You'll also get the `NEXT_PUBLIC_CONVEX_URL` from the Convex dashboard

### 3. Generate BetterAuth secret
```bash
openssl rand -base64 32
```
Copy the output into `BETTER_AUTH_SECRET` in `.env.local`.

### 4. Add AI API keys
Add at least one:
- `ANTHROPIC_API_KEY` — enables Claude Haiku (Pro), Sonnet, Opus (Enterprise)
- `OPENAI_API_KEY` — enables GPT-4o-mini (Pro), GPT-4o (Enterprise)

### 5. Start development servers
You need **two terminals** running simultaneously:

```bash
# Terminal 1 — Convex backend (real-time sync)
pnpm convex:dev

# Terminal 2 — Next.js frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Minimum Viable Config (just to see the UI)

If you just want to browse the UI without any backend:

```env
BETTER_AUTH_SECRET=minimum-secret-just-for-testing-1234
BETTER_AUTH_URL=http://localhost:3000
```

Then only run `pnpm dev`. The editor, LaTeX preview, and all pages work. No database persistence or AI chat.

---

## What Each Service Does

| Service | Required? | What it does | Cost |
|---------|-----------|-------------|------|
| **Convex** | For persistence | Stores users, projects, documents, chat history | Free tier (generous) |
| **BetterAuth** | Yes (local) | Handles login/register, session tokens | Free (runs locally) |
| **Google OAuth** | Optional | "Login with Google" button | Free |
| **GitHub OAuth** | Optional | "Login with GitHub" button | Free |
| **Anthropic API** | For AI chat | Powers Claude Haiku/Sonnet/Opus models | Pay-per-use (~$0.25-$15/1M tokens) |
| **OpenAI API** | For AI chat | Powers GPT-4o-mini/GPT-4o models | Pay-per-use (~$0.15-$5/1M tokens) |

---

## AI Models by Tier

| Tier | Models Available | Daily Limit |
|------|-----------------|-------------|
| **Free** | None (AI disabled) | 0 |
| **Pro** (R$49/mo) | Claude Haiku, GPT-4o Mini | 50 messages/day |
| **Enterprise** (R$149/mo) | Claude Sonnet, Claude Opus, GPT-4o + all Pro models | Unlimited |

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
pnpm install
```

### Convex errors about missing schema
Make sure `pnpm convex:dev` is running — it pushes your schema to the cloud.

### Auth not working
Check that `BETTER_AUTH_SECRET` is set and at least 32 characters long.

### AI chat returns 403
The user's tier must be "pro" or "enterprise". Free tier has AI disabled.
