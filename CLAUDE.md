# TexAI - LaTeX Editor with AI

An online LaTeX editor with integrated AI assistance, similar to Overleaf. Built with Next.js, Convex, and Vercel AI SDK.

## Dev Commands

```bash
pnpm dev             # Start Next.js + Convex concurrently (single terminal)
pnpm dev:next        # Start only Next.js dev server with Turbopack (port 3000)
pnpm dev:convex      # Start only Convex dev backend
pnpm build           # Production build
pnpm lint            # Run ESLint
```

## Package Manager & Build

- **Package manager**: pnpm (v10+)
- **Build system**: Turborepo (`turbo.json` at root)
- **Bundler**: Turbopack (via `next dev --turbopack`)
- Install deps: `pnpm install`
- Add a package: `pnpm add <package>`

## Code Conventions

- TypeScript strict mode enabled
- Functional components only (no class components)
- Server Components by default; use `"use client"` only when needed (hooks, browser APIs, interactivity)
- Zod for input validation
- Zustand for global state management
- shadcn/ui for all UI components (installed via CLI, located in `components/ui/`)
- Tailwind CSS v4 for styling
- Framer Motion for animations
- Import alias: `@/*` maps to project root

## Directory Structure

```
latex-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (BetterAuth)
│   ├── (marketing)/              # Landing page + Pricing
│   ├── (dashboard)/              # Logged-in area (projects, editor, settings)
│   ├── api/                      # API routes (auth, chat, compile)
│   ├── icon.svg                  # App favicon/icon
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── editor/                   # Editor components (CodeMirror, PDF, chat, toolbar, compilation status)
│   ├── pricing/                  # Pricing cards + comparison
│   ├── shared/                   # Navbar, footer
│   └── ui/                       # shadcn/ui components
├── convex/                       # Convex backend (schema, CRUD, LaTeX compilation)
├── hooks/                        # Custom React hooks (useLatexCompiler, etc.)
├── lib/
│   ├── ai/                       # AI providers, system prompt, knowledge base
│   ├── auth.ts                   # BetterAuth config
│   ├── latex/                    # Client-side compiler + templates
│   ├── pdf-generator.ts          # Client-side PDF generation (html2canvas + jsPDF)
│   ├── tier-limits.ts            # Tier definitions, pricing, feature gates
│   └── utils.ts
├── public/logos/                  # SVG logo concepts (5 concepts, icon + horizontal variants)
├── output/playwright/            # Playwright screenshots for visual QA
├── docs/                         # Project documentation + server setup guides
├── turbo.json                    # Turborepo config
├── package.json                  # pnpm + turbo
└── pnpm-lock.yaml
```

## Key Technologies

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Package Manager**: pnpm (v10.29.2)
- **Build System**: Turborepo
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **AI**: Vercel AI SDK (`ai` + `@ai-sdk/react`) with OpenRouter provider (`@openrouter/ai-sdk-provider`)
- **Auth**: BetterAuth (email/password + OAuth: Google, GitHub) — imports from `better-auth/minimal`
- **Backend/Database**: Convex
- **LaTeX Compile**: Tectonic via external API (all tiers, unlimited compiles)
- **Code Editor**: CodeMirror 6 with LaTeX support (`codemirror-lang-latex`)
- **PDF Viewer**: iframe-based (server-compiled PDFs only, unified view for all tiers)
- **Animations**: Framer Motion (with `AnimatePresence` for hero rotating title)
- **State Management**: Zustand
- **Dev Toolbar**: Agentation (`agentation` package, dev-only)

## Design System

### Typography

- **Sans**: Outfit (`--font-outfit`) — headings, body text
- **Serif**: Bodoni Moda (`--font-bodoni`) — brand, section headings, card titles, feature names
- **Mono**: IBM Plex Mono (`--font-ibm-plex-mono`) — code editor, code blocks, hero `\begin{}` title

### Color Palette

Uses oklch color space throughout. Primary color is a green/emerald tone:
- **Dark mode primary**: `oklch(0.68 0.18 158)` — green/emerald accent
- **Dark mode background**: `oklch(0.14 0.015 235)` — deep blue-tinted dark
- **Cards**: semi-transparent with backdrop-blur (`bg-card/75`, `bg-card/85`)
- **Borders**: subtle with opacity (`border-border/55`, `border-border/60`)
- **Text gradient** (`.text-gradient`): multi-stop gradient from `#65f2be` → `#35c9ff` → `#9eff8f`
- Use `text-primary` / `bg-primary` instead of hardcoded emerald hex values

### Glass & Surface Effects

- **`.panel-glass`**: glassmorphism panel — gradient bg, subtle border, box-shadow, backdrop-blur. Used for navbar and hero code preview.
- **`.grid-overlay`**: subtle grid pattern overlay via `::after` pseudo-element. Applied to marketing, auth, and dashboard layouts.
- **`.section-divider`**: horizontal gradient line separator
- **Body**: radial gradient background with subtle diagonal scan lines
- **Cards**: `rounded-2xl`, semi-transparent bg, backdrop-blur, deep box-shadow
- **Buttons**: `rounded-lg` by default, `rounded-full` for CTAs/pill buttons
- **Inputs**: `rounded-lg`, inset shadow, semi-transparent background

### Layout Patterns

- **Navbar** (marketing + dashboard): floating style with `panel-glass`, `rounded-2xl`, padded from edges (`px-3 pt-3`). Nav links are absolutely centered in the navbar. Marketing navbar is auth-aware: shows "Meus Projetos" button (→ `/projects`) for logged-in users, "Entrar"/"Começar" for logged-out.
- **Auth pages**: centered card with glassmorphic background, blur orbs for ambient color
- **Dashboard**: same floating navbar, centered nav tabs, avatar dropdown. Logo links to `/` (home), not `/projects`.
- **Landing page hero**: two-column grid — left: rotating `\begin{...}` + `\end{...}` titles (AnimatePresence), right: glassmorphic code preview with `animate-emerald-glow` and realistic paper-like PDF mock
- **Login/Register**: password show/hide toggle, pill-shaped OAuth + submit buttons, serif headings
- **New project dialog**: vertical template list with description + check icon, header/body/footer sections
- **PDF Viewer**: keeps preview mounted during compilation (overlay on top instead of unmounting)

## Pricing Tiers

- **Free** (R$0): 3 projects, 3 AI edits/project, unlimited PDF compiles, 50MB
- **Pro** (R$49/mo): Unlimited projects, 50 AI msgs/day, Claude Haiku + GPT-4o-mini, 5GB
- **Enterprise** (R$149/mo): Unlimited everything, all AI models, priority compile, API access

### Feature Gates by Tier

Tier limits are defined in both `lib/tier-limits.ts` (frontend) and `convex/tierLimits.ts` (backend). All tiers have `hasServerCompile: true` and unlimited compiles (`maxServerCompilesPerDay: Infinity`). Rate limiting: `maxCompilesPerMinute` (free=15, pro=15, enterprise=30). Daily usage is tracked in the `users` table (`compilesUsedToday`/`lastCompileResetDate`, both optional fields).

## AI Chat System

Architecture: Browser (`useChat` hook) → Next.js API route (`/api/chat`) → OpenRouter API → streaming response.

- **Provider**: OpenRouter (`@openrouter/ai-sdk-provider`) — single provider for all models (Anthropic, OpenAI, etc.)
- **Client hook**: `useChat` from `@ai-sdk/react` handles streaming, message state, and UI
- **Model config**: `lib/ai/providers.ts` defines model configs per tier (client-safe, no server deps). API route creates OpenRouter instance directly.
- **Persistence**: Chat messages stored in Convex `chatMessages` table. History loaded via `useQuery(api.chatMessages.getByDocument)` on mount.
- **Auth**: API route uses `isAuthenticated()` + `fetchAuthMutation()` from `lib/auth-server.ts`
- **Daily limits**: Pro tier has 50 msgs/day, tracked via `api.users.getAiUsage` / `api.users.incrementAiUsage` in Convex
- **Image upload**: Client converts to base64 data URL, sent as `file` part via `sendMessage`. Displayed inline in messages.
- **System prompt**: `lib/ai/latex-system-prompt.ts` builds prompt with LaTeX knowledge base + current document content
- **Env var**: `OPENROUTER_API_KEY` (set in `.env.local`)

### Convex Chat Messages (`convex/chatMessages.ts`)

- `getByDocument(documentId)` — query, returns messages ordered chronologically
- `getRecentByDocument(documentId, limit?)` — query, last N messages (default 50)
- `sendMessage({documentId, userId, role, content, model?})` — mutation, inserts message
- `deleteByDocument(documentId)` — mutation, clears history for a document

## Convex Backend Integration

All data flows through Convex — no hardcoded dummy data remains.

- **User bridging**: `convex/users.ts` → `getOrCreateCurrentUser` mutation bridges BetterAuth identity to the app `users` table (creates row on first login, tier="free")
- **Projects page** (`app/(dashboard)/projects/page.tsx`): queries `api.projects.listByUser`, respects tier limits from `lib/tier-limits.ts`, uses `useConvexAuth()` to gate mutations until auth token is ready
- **New project dialog** (`components/editor/new-project-dialog.tsx`): accepts `userId` prop, calls `api.projects.create` + `api.documents.create` (with template content as `main.tex`), then navigates to the new project
- **Editor page** (`app/(dashboard)/projects/[id]/page.tsx`): loads project + documents from Convex via URL param, auto-saves content with 2s debounce via `api.documents.updateContent`, saves project name via `api.projects.update`, supports Ctrl+S for immediate save + compile. Uses `fixed inset-0 z-50` to cover the full viewport (escapes the dashboard layout navbar — the editor has its own toolbar with back button).

### Server-Side LaTeX Compilation (Convex)

Architecture: Browser → Convex action (`"use node"`) → External LaTeX API (Tectonic on self-hosted server via Tailscale Funnel) → PDF returned as base64.

- **Schema**: `compilations` table tracks every compile job (userId, documentId, sourceHash, status, engine, logs, errors, durationMs). Indexed by user, document, document+hash, and status.
- **`convex/latexNode.ts`** (`"use node"` action): authenticates user, tracks compile usage (via `users.incrementCompiles`), computes SHA-256 source hash, creates compilation record, calls external LaTeX API (`LATEX_API_URL`) with HMAC-signed request (`LATEX_API_SECRET`), validates JSON response (guards against non-JSON errors), returns PDF as base64 + `remainingCompiles`. Includes health check internal action.
- **`convex/latex.ts`**: internal queries/mutations for compilation CRUD — `findCachedCompilation`, `createCompilation` (with tier-specific per-minute rate limit), `updateCompilation`, `updateDocumentCompileTime`, plus public queries.
- **`convex/crons.ts`**: health check cron every 5 minutes against the LaTeX API.
- **Env vars needed in Convex**: `LATEX_API_URL` (currently `https://omarchy.tailcee049.ts.net`), `LATEX_API_SECRET` (HMAC shared secret). Set via `npx convex env set`.
- **Removed**: `documents.updateCompiledPdf` mutation (replaced by compilations table), `compileLatexToPdf` placeholder function, `compiledPdfUrl` field from documents schema.

### Client-Side Hooks

- **`hooks/use-latex-compiler.ts`**: `useLatexCompiler` hook — manages server compile state (status, pdfBlobUrl, error, durationMs, remainingCompiles). Features: SHA-256 client-side source hash cache (avoids re-compiling identical source), blob URL lifecycle management, offline detection, quota_exceeded status detection. Calls `api.latexNode.compile` action.

## LaTeX Preview (Server-Only)

All tiers use server-compiled PDF (Tectonic) as the only preview. No client-side latex.js preview or Live/PDF toggle.

- `latex.js` and `lib/latex/compiler.ts` still exist in the codebase but are no longer used in the editor preview flow
- `lib/pdf-generator.ts` (html2canvas + jsPDF) still exists but is no longer the primary download path

### PDF Viewer

The PDF viewer (`components/editor/pdf-viewer.tsx`) is a unified server-only view:
1. PDF exists + not compiling → show PDF in iframe
2. PDF exists + compiling → show last PDF with semi-transparent "Compilando..." overlay
3. No PDF + compiling → centered spinner "Compilando PDF..."
4. Server error → error panel
5. Nothing → empty state "Clique em Compilar"

### Compilation Status Component

`components/editor/compilation-status.tsx` displays real-time server compilation status next to the Compilar button. States: idle (hidden), compiling (spinner), success (checkmark + duration in ms), error (tooltip with error message), offline (wifi-off icon), quota_exceeded (upgrade CTA).

### Toolbar

The toolbar has: back button, project name (editable), compilation status badge, Compilar button, PDF download button, settings dropdown. Engine is fixed to Tectonic (no user selector).

## Notes

- The `toast` component from shadcn is deprecated; use `sonner` instead
- The LaTeX CodeMirror package is `codemirror-lang-latex` (not `@codemirror/lang-latex`)
- `@codemirror/language` must be explicitly installed (pnpm strict mode)
- Run `pnpm convex:dev` to initialize Convex (requires auth at dashboard.convex.dev)
- See `docs/requirements.md` for full .env.local setup guide
- **Vercel deploy** requires env vars: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `BETTER_AUTH_SECRET`, `OPENROUTER_API_KEY`
- **Convex LaTeX env vars**: `LATEX_API_URL`, `LATEX_API_SECRET` (set via `npx convex env set`)
- Old Next.js default assets (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) have been removed from `public/`
- BetterAuth Convex integration imports from `better-auth/minimal` (not `better-auth`)
- Agentation dev toolbar is loaded only in development (`process.env.NODE_ENV === "development"`)
- Logo assets live in `public/logos/` with 5 concept directories, each containing `icon.svg` and `horizontal.svg`
- When styling components, use `text-primary` / `bg-primary/N` instead of hardcoded `text-emerald-400` / `bg-emerald-500` etc.
- Buttons for main CTAs use `rounded-full` (pill shape); standard buttons use `rounded-lg`
- Cards use `rounded-2xl` with semi-transparent backgrounds and backdrop-blur
- Ctrl+S in the editor triggers immediate save + server compile
- CodeMirror editor: uses `height: 100%` on root + `.cm-scroller { overflow: auto }` for proper scroll containment. Container uses `overflow-hidden`. `TabsContent` in editor layout uses `min-h-0` to prevent flex overflow.
- Server-side compilation uses `"use node"` Convex actions (`convex/latexNode.ts`) — required for Node.js `crypto` module
- PDF download: uses server-compiled PDF blob; if none exists, triggers a compile first
- See `docs/server-setup-guide.md` for full LaTeX server setup instructions (Tectonic + FastAPI + Tailscale Funnel)

## LaTeX Compilation Server (Remote)

**SSH access**: `ssh augustop@omarchy`

The LaTeX compilation server runs on a self-hosted machine accessible via Tailscale. Key details:

- **Location**: `~/latex-api/main.py` — FastAPI app with `/health` and `/compile` endpoints
- **Process**: uvicorn on `127.0.0.1:8787`, managed as a user systemd service (`~/latex-api/latex-api.service`)
- **Engine**: Tectonic 0.15.0 (installed on the server)
- **Public URL**: `https://omarchy.tailcee049.ts.net` via Tailscale Funnel → proxies to `127.0.0.1:8787`
- **Auth**: HMAC-SHA256 of the LaTeX source, sent via `X-API-Secret` header. Shared secret in the systemd service file.

### Common operations

```bash
# Check service status
ssh augustop@omarchy "ps aux | grep uvicorn"

# Restart the API
ssh augustop@omarchy "kill \$(pgrep -f 'uvicorn main:app') && cd ~/latex-api && venv/bin/uvicorn main:app --host 127.0.0.1 --port 8787 &"

# Check/fix Tailscale Funnel (must point to port 8787)
ssh augustop@omarchy "tailscale funnel status"
ssh augustop@omarchy "tailscale funnel --bg 8787"

# Test health
curl https://omarchy.tailcee049.ts.net/health
```
- See `docs/latex-backend-integration-plan.md` for the full architecture plan
