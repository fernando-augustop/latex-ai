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
│   ├── editor/                   # Editor components (CodeMirror, PDF, chat, toolbar)
│   ├── pricing/                  # Pricing cards + comparison
│   ├── shared/                   # Navbar, footer
│   └── ui/                       # shadcn/ui components
├── convex/                       # Convex backend (schema, CRUD)
├── lib/
│   ├── ai/                       # AI providers, system prompt, knowledge base
│   ├── auth.ts                   # BetterAuth config
│   ├── latex/                    # Compiler + templates
│   └── utils.ts
├── public/logos/                  # SVG logo concepts (5 concepts, icon + horizontal variants)
├── output/playwright/            # Playwright screenshots for visual QA
├── docs/                         # Project documentation + prompts
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
- **LaTeX Preview**: latex.js (client-side)
- **Code Editor**: CodeMirror 6 with LaTeX support (`codemirror-lang-latex`)
- **PDF Viewer**: react-pdf
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

- **Navbar** (marketing + dashboard): floating style with `panel-glass`, `rounded-2xl`, padded from edges (`px-3 pt-3`). Nav links are absolutely centered in the navbar.
- **Auth pages**: centered card with glassmorphic background, blur orbs for ambient color
- **Dashboard**: same floating navbar, centered nav tabs, avatar dropdown
- **Landing page hero**: two-column grid — left: rotating `\begin{...}` title (AnimatePresence), right: glassmorphic code preview with `animate-emerald-glow`
- **Login/Register**: password show/hide toggle, pill-shaped OAuth + submit buttons, serif headings
- **New project dialog**: vertical template list with description + check icon, header/body/footer sections
- **PDF Viewer**: keeps preview mounted during compilation (overlay on top instead of unmounting)

## Pricing Tiers

- **Free** (R$0): 3 projects, no AI, client-side preview, 50MB
- **Pro** (R$49/mo): Unlimited projects, 50 AI msgs/day, Claude Haiku + GPT-4o-mini, server compile, 5GB
- **Enterprise** (R$149/mo): Unlimited everything, all AI models, priority compile

## Convex Backend Integration

All data flows through Convex — no hardcoded dummy data remains.

- **User bridging**: `convex/users.ts` → `getOrCreateCurrentUser` mutation bridges BetterAuth identity to the app `users` table (creates row on first login, tier="free")
- **Projects page** (`app/(dashboard)/projects/page.tsx`): queries `api.projects.listByUser`, respects tier limits from `lib/tier-limits.ts`, uses `useConvexAuth()` to gate mutations until auth token is ready
- **New project dialog** (`components/editor/new-project-dialog.tsx`): accepts `userId` prop, calls `api.projects.create` + `api.documents.create` (with template content as `main.tex`), then navigates to the new project
- **Editor page** (`app/(dashboard)/projects/[id]/page.tsx`): loads project + documents from Convex via URL param, auto-saves content with 2s debounce via `api.documents.updateContent`, saves project name via `api.projects.update`

## LaTeX Preview (latex.js 0.12.6)

The client-side preview uses `latex.js` which has significant limitations:

- **No `tabular` environment** — the word "tabular" is absent from the bundle entirely
- **No document classes** — `dist/documentclasses/` is empty; only `article` works via built-in fallback
- **No packages** — `dist/packages/` is empty; all `\usepackage` lines must be stripped
- **Supported environments**: itemize, enumerate, description, center, abstract, verbatim, figure, table, quote, array, equation, flushleft, flushright, titlepage, picture, list
- **Not supported**: tabular, minipage, displaymath, thebibliography, lstlisting, tikzpicture, beamer frames

The preprocessor (`lib/latex/compiler.ts` → `preprocessForPreview`) strips unsupported packages and their dependent commands before passing to latex.js. Templates (`lib/latex/templates.ts`) are pre-simplified to only use supported features.

## Notes

- The `toast` component from shadcn is deprecated; use `sonner` instead
- The LaTeX CodeMirror package is `codemirror-lang-latex` (not `@codemirror/lang-latex`)
- `@codemirror/language` must be explicitly installed (pnpm strict mode)
- Run `pnpm convex:dev` to initialize Convex (requires auth at dashboard.convex.dev)
- See `docs/requirements.md` for full .env.local setup guide
- **Vercel deploy** requires env vars: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `BETTER_AUTH_SECRET`, and at least one AI key
- Old Next.js default assets (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) have been removed from `public/`
- BetterAuth Convex integration imports from `better-auth/minimal` (not `better-auth`)
- Agentation dev toolbar is loaded only in development (`process.env.NODE_ENV === "development"`)
- Logo assets live in `public/logos/` with 5 concept directories, each containing `icon.svg` and `horizontal.svg`
- When styling components, use `text-primary` / `bg-primary/N` instead of hardcoded `text-emerald-400` / `bg-emerald-500` etc.
- Buttons for main CTAs use `rounded-full` (pill shape); standard buttons use `rounded-lg`
- Cards use `rounded-2xl` with semi-transparent backgrounds and backdrop-blur
