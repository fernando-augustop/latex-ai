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
- **AI**: Vercel AI SDK (`ai` package) with Anthropic + OpenAI providers
- **Auth**: BetterAuth (email/password + OAuth: Google, GitHub) — imports from `better-auth/minimal`
- **Backend/Database**: Convex
- **LaTeX Preview**: latex.js (client-side live preview)
- **LaTeX Server Compile**: Tectonic/TeX Live via external API (Pro/Enterprise only)
- **PDF Generation (client)**: html2canvas + jsPDF (converts latex.js HTML to downloadable PDF)
- **Code Editor**: CodeMirror 6 with LaTeX support (`codemirror-lang-latex`)
- **PDF Viewer**: iframe-based (for server-compiled PDFs) + A4 HTML preview (for client-side)
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

- **Free** (R$0): 3 projects, 3 AI edits/project, client-side preview only, 50MB
- **Pro** (R$49/mo): Unlimited projects, 50 AI msgs/day, Claude Haiku + GPT-4o-mini, server compile (Tectonic), 5GB
- **Enterprise** (R$149/mo): Unlimited everything, all AI models, priority compile, API access

### Feature Gates by Tier

Tier limits are defined in both `lib/tier-limits.ts` (frontend) and `convex/tierLimits.ts` (backend). Key feature flag: `hasServerCompile` — controls access to server-side LaTeX compilation (false for free, true for Pro/Enterprise).

## Convex Backend Integration

All data flows through Convex — no hardcoded dummy data remains.

- **User bridging**: `convex/users.ts` → `getOrCreateCurrentUser` mutation bridges BetterAuth identity to the app `users` table (creates row on first login, tier="free")
- **Projects page** (`app/(dashboard)/projects/page.tsx`): queries `api.projects.listByUser`, respects tier limits from `lib/tier-limits.ts`, uses `useConvexAuth()` to gate mutations until auth token is ready
- **New project dialog** (`components/editor/new-project-dialog.tsx`): accepts `userId` prop, calls `api.projects.create` + `api.documents.create` (with template content as `main.tex`), then navigates to the new project
- **Editor page** (`app/(dashboard)/projects/[id]/page.tsx`): loads project + documents from Convex via URL param, auto-saves content with 2s debounce via `api.documents.updateContent`, saves project name via `api.projects.update`, supports Ctrl+S for immediate save + compile

### Server-Side LaTeX Compilation (Convex)

Architecture: Browser → Convex action (`"use node"`) → External LaTeX API (Tectonic on self-hosted server via Tailscale Funnel) → PDF returned as base64.

- **Schema**: `compilations` table tracks every compile job (userId, documentId, sourceHash, status, engine, logs, errors, durationMs). Indexed by user, document, document+hash, and status.
- **`convex/latexNode.ts`** (`"use node"` action): authenticates user, checks tier, computes SHA-256 source hash, creates compilation record, calls external LaTeX API (`LATEX_API_URL`) with HMAC-signed request (`LATEX_API_SECRET`), returns PDF as base64. Includes health check internal action.
- **`convex/latex.ts`**: internal queries/mutations for compilation CRUD — `findCachedCompilation`, `createCompilation` (with rate limit: max 10/min/user), `updateCompilation`, `updateDocumentCompileTime`, plus public queries.
- **`convex/crons.ts`**: health check cron every 5 minutes against the LaTeX API.
- **Env vars needed in Convex**: `LATEX_API_URL` (e.g. `https://omarchy.tailnet.ts.net`), `LATEX_API_SECRET` (HMAC shared secret).
- **Removed**: `documents.updateCompiledPdf` mutation (replaced by compilations table), `compileLatexToPdf` placeholder function, `compiledPdfUrl` field from documents schema.

### Client-Side Hooks

- **`hooks/use-latex-compiler.ts`**: `useLatexCompiler` hook — manages server compile state (status, pdfBlobUrl, error, durationMs). Features: SHA-256 client-side source hash cache (avoids re-compiling identical source), blob URL lifecycle management, offline detection. Calls `api.latexNode.compile` action.

## LaTeX Preview (latex.js 0.12.6)

The client-side preview uses `latex.js` which has significant limitations:

- **No `tabular` environment** — the word "tabular" is absent from the bundle entirely
- **No document classes** — `dist/documentclasses/` is empty; only `article` works via built-in fallback
- **No packages** — `dist/packages/` is empty; all `\usepackage` lines must be stripped
- **Supported environments**: itemize, enumerate, description, center, abstract, verbatim, figure, table, quote, array, equation, flushleft, flushright, titlepage, picture, list
- **Not supported**: tabular, minipage, displaymath, thebibliography, lstlisting, tikzpicture, beamer frames

The preprocessor (`lib/latex/compiler.ts` → `preprocessForPreview`) strips unsupported packages and their dependent commands before passing to latex.js. Templates (`lib/latex/templates.ts`) are pre-simplified to only use supported features.

### Client-Side PDF Generation

`lib/pdf-generator.ts` converts latex.js HTML output to a downloadable PDF using html2canvas + jsPDF. Creates an offscreen A4-sized container, renders it to canvas at 2x scale, then slices into pages. Used as a fallback for free-tier users who don't have server-side compilation.

### PDF Viewer Modes

The PDF viewer (`components/editor/pdf-viewer.tsx`) supports two modes toggled via tabs:
- **Live**: client-side HTML preview rendered by latex.js (available to all tiers)
- **PDF**: server-compiled PDF displayed in an iframe (requires Pro/Enterprise — button disabled for free tier)

### Compilation Status Component

`components/editor/compilation-status.tsx` displays real-time server compilation status in the toolbar. States: idle (hidden), compiling (spinner), success (checkmark + duration in ms), error (tooltip with error message), offline (wifi-off icon).

### Toolbar Engine Selector

Pro/Enterprise users see a dropdown in the toolbar to select the LaTeX engine: Tectonic (default), pdfLaTeX, XeLaTeX, LuaLaTeX. The selection is passed to the server-side compile action.

## Notes

- The `toast` component from shadcn is deprecated; use `sonner` instead
- The LaTeX CodeMirror package is `codemirror-lang-latex` (not `@codemirror/lang-latex`)
- `@codemirror/language` must be explicitly installed (pnpm strict mode)
- Run `pnpm convex:dev` to initialize Convex (requires auth at dashboard.convex.dev)
- See `docs/requirements.md` for full .env.local setup guide
- **Vercel deploy** requires env vars: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `BETTER_AUTH_SECRET`, and at least one AI key
- **Convex LaTeX env vars**: `LATEX_API_URL`, `LATEX_API_SECRET` (set via `npx convex env set`)
- Old Next.js default assets (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) have been removed from `public/`
- BetterAuth Convex integration imports from `better-auth/minimal` (not `better-auth`)
- Agentation dev toolbar is loaded only in development (`process.env.NODE_ENV === "development"`)
- Logo assets live in `public/logos/` with 5 concept directories, each containing `icon.svg` and `horizontal.svg`
- When styling components, use `text-primary` / `bg-primary/N` instead of hardcoded `text-emerald-400` / `bg-emerald-500` etc.
- Buttons for main CTAs use `rounded-full` (pill shape); standard buttons use `rounded-lg`
- Cards use `rounded-2xl` with semi-transparent backgrounds and backdrop-blur
- Ctrl+S in the editor triggers immediate save + compile (both client-side preview and server-side PDF if tier allows)
- Server-side compilation uses `"use node"` Convex actions (`convex/latexNode.ts`) — required for Node.js `crypto` module
- PDF download: prefers server-compiled PDF, falls back to client-generated PDF (html2canvas + jsPDF)
- See `docs/server-setup-guide.md` for full LaTeX server setup instructions (Tectonic + FastAPI + Tailscale Funnel)
- See `docs/latex-backend-integration-plan.md` for the full architecture plan
