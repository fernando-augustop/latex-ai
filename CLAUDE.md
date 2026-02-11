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
├── docs/                         # Project documentation + prompts
├── turbo.json                    # Turborepo config
├── package.json                  # pnpm + turbo
└── pnpm-lock.yaml
```

## Key Technologies

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Package Manager**: pnpm
- **Build System**: Turborepo
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **AI**: Vercel AI SDK (`ai` package) with Anthropic + OpenAI providers
- **Auth**: BetterAuth (email/password + OAuth: Google, GitHub)
- **Backend/Database**: Convex
- **LaTeX Preview**: latex.js (client-side)
- **Code Editor**: CodeMirror 6 with LaTeX support (`codemirror-lang-latex`)
- **PDF Viewer**: react-pdf
- **Animations**: Framer Motion
- **State Management**: Zustand

## Pricing Tiers

- **Free** (R$0): 3 projects, no AI, client-side preview, 50MB
- **Pro** (R$49/mo): Unlimited projects, 50 AI msgs/day, Claude Haiku + GPT-4o-mini, server compile, 5GB
- **Enterprise** (R$149/mo): Unlimited everything, all AI models, priority compile

## Notes

- The `toast` component from shadcn is deprecated; use `sonner` instead
- The LaTeX CodeMirror package is `codemirror-lang-latex` (not `@codemirror/lang-latex`)
- `@codemirror/language` must be explicitly installed (pnpm strict mode)
- Run `pnpm convex:dev` to initialize Convex (requires auth at dashboard.convex.dev)
- See `docs/requirements.md` for full .env.local setup guide
