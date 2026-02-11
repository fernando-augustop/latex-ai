# Prompt para Claude Code Agent Teams — LaTeX Editor com IA

## Instrução Principal para o Lead Agent

```
Crie um agent team para construir um editor LaTeX online com IA integrada, similar ao Overleaf, como uma aplicação web completa e pronta para produção. O projeto se chama "TexAI" (ou outro nome que o time sugerir). Spawne os seguintes teammates com ownership claro de diretórios. Use delegate mode para o lead.

---

## 🏗️ ARQUITETURA E STACK

### Stack Obrigatória
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui (usar CLI para instalar cada componente)
- **IA**: Vercel AI SDK (`ai` package) — para streaming de respostas e alternância entre modelos
- **Autenticação**: BetterAuth (https://better-auth.com) — setup com email/password + OAuth (Google, GitHub)
- **Backend/Database**: Convex (https://convex.dev) — cada usuário terá seu próprio espaço de dados
- **Compilação LaTeX**: Usar `latex.js` para preview client-side OU `texlive` via API serverless para compilação completa
- **Editor de Código**: CodeMirror 6 com extensão LaTeX (syntax highlighting, autocomplete)
- **Visualização PDF**: `react-pdf` ou `@react-pdf-viewer/core`
- **Deploy dev**: Ambiente local via Claude Code (terminal do desenvolvedor)

### Estrutura de Diretórios
```
texai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação (BetterAuth)
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (marketing)/              # Landing page + Pricing
│   │   ├── page.tsx              # Hero + features
│   │   └── pricing/
│   │       └── page.tsx          # Tiers de preço
│   ├── (dashboard)/              # Área logada
│   │   ├── projects/
│   │   │   ├── page.tsx          # Lista de projetos
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Editor principal
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/[...all]/        # BetterAuth API routes
│   │   ├── chat/                 # AI SDK route handler
│   │   ├── compile/              # Compilação LaTeX
│   │   └── convex/               # Convex HTTP actions
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── editor/
│   │   ├── latex-editor.tsx      # CodeMirror com LaTeX
│   │   ├── pdf-viewer.tsx        # Visualizador de PDF
│   │   ├── editor-layout.tsx     # Split pane (esquerda/direita)
│   │   ├── ai-chat-panel.tsx     # Painel de chat com IA
│   │   └── toolbar.tsx           # Barra de ferramentas
│   ├── pricing/
│   │   ├── pricing-cards.tsx     # Cards dos 3 tiers
│   │   └── feature-comparison.tsx
│   ├── ui/                       # shadcn/ui components
│   └── shared/
│       ├── navbar.tsx
│       └── footer.tsx
├── convex/
│   ├── schema.ts                 # Schema do banco
│   ├── projects.ts               # CRUD de projetos
│   ├── documents.ts              # Documentos LaTeX
│   ├── users.ts                  # Dados do usuário + tier
│   └── subscriptions.ts          # Controle de assinaturas
├── lib/
│   ├── auth.ts                   # Config BetterAuth
│   ├── ai/
│   │   ├── providers.ts          # Config dos modelos por tier
│   │   ├── latex-system-prompt.ts # System prompt com instruções LaTeX
│   │   └── latex-knowledge.md    # Base de conhecimento LaTeX (arquivo MD)
│   ├── latex/
│   │   ├── compiler.ts           # Lógica de compilação
│   │   └── templates.ts          # Templates LaTeX iniciais
│   └── utils.ts
├── public/
├── CLAUDE.md                     # Instruções para o projeto
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── convex.json
```

---

## 👥 TEAMMATES — Spawnar 4 agentes especializados

### Teammate 1: "frontend-engineer"
**Ownership**: `components/`, `app/(marketing)/`, `app/(dashboard)/`, `app/layout.tsx`, `globals.css`
**Responsabilidades**:
- Usar a skill `frontend-design` para criar interfaces distintas e production-grade
- Direção estética: **Editorial/Magazine meets Developer Tool** — dark mode como padrão, tipografia com fonte display distinta (ex: "Instrument Serif" para títulos, "JetBrains Mono" para código, "Satoshi" para corpo), paleta escura com acentos em verde-esmeralda ou âmbar
- **Landing Page**: Hero impactante com animação de código LaTeX sendo digitado e PDF aparecendo, seção de features com ícones animados, social proof
- **Pricing Page**: 3 cards com os tiers (detalhes abaixo), animação de hover, badge "Popular" no tier Pro, toggle mensal/anual
- **Editor Layout**: Split pane redimensionável (esquerda: código, direita: PDF). Na parte esquerda, tabs alternáveis entre "Código LaTeX" e "Chat IA". Toolbar no topo com botões de compilar, baixar PDF, configurações do projeto
- **PDF Viewer**: Renderização em tempo real, zoom, scroll sincronizado
- **Chat Panel**: Interface de chat estilo Claude/ChatGPT com streaming de respostas, indicador de modelo sendo usado, botão de "aplicar no código"
- Todas as transições com Framer Motion. Responsivo. Acessível (a11y).
- Usar shadcn/ui para: Button, Card, Dialog, Dropdown, Input, Tabs, Toast, Tooltip, Sheet, Badge, Avatar, Command (para command palette)

### Teammate 2: "backend-engineer"  
**Ownership**: `convex/`, `app/api/`, `lib/auth.ts`, `lib/latex/`
**Responsabilidades**:
- **Convex Schema**:
  ```typescript
  // users: id, email, name, avatar, tier (free|pro|enterprise), createdAt
  // projects: id, userId, name, description, createdAt, updatedAt, isArchived
  // documents: id, projectId, filename, content (LaTeX string), compiledPdfUrl, lastCompiledAt, version
  // chatMessages: id, documentId, role (user|assistant), content, model, createdAt
  // subscriptions: id, userId, tier, status, currentPeriodEnd, stripeCustomerId?
  ```
- **BetterAuth**: Configurar com Convex adapter, providers Google + GitHub + email/password
- **API Routes**:
  - `POST /api/compile` — recebe LaTeX, compila para PDF, retorna URL (usar `node-latex` ou `latex-online` API como fallback)
  - `POST /api/chat` — Vercel AI SDK route com `streamText()`, seleciona modelo baseado no tier do usuário
- **Limites por Tier** (enforcement no backend):
  - Free: max 3 projetos, max 3 edições de IA por projeto, sem acesso a IA
  - Pro: projetos ilimitados, IA com modelos baratos (Claude Haiku, GPT-4o-mini), 50 mensagens IA/dia
  - Enterprise: tudo ilimitado, todos os modelos (Claude Sonnet, Claude Opus, GPT-4o, etc.)
- **Compilação LaTeX**: Implementar sistema de compilação com fallback:
  1. Preview rápido client-side com `latex.js` (para feedback instantâneo)
  2. Compilação completa server-side com `node-latex` + texlive (para PDF final)
  3. Auto-compilação: debounce de 1.5s após cada keystroke, compila automaticamente

### Teammate 3: "ai-engineer"
**Ownership**: `lib/ai/`, `app/api/chat/`
**Responsabilidades**:
- **Vercel AI SDK Setup**:
  ```typescript
  // lib/ai/providers.ts
  import { createAnthropic } from '@ai-sdk/anthropic';
  import { createOpenAI } from '@ai-sdk/openai';
  
  // Mapear modelos por tier
  const TIER_MODELS = {
    free: [], // Sem IA
    pro: [
      { id: 'claude-haiku', provider: 'anthropic', model: 'claude-haiku-4-5-20251001' },
      { id: 'gpt-4o-mini', provider: 'openai', model: 'gpt-4o-mini' },
    ],
    enterprise: [
      { id: 'claude-sonnet', provider: 'anthropic', model: 'claude-sonnet-4-5-20250929' },
      { id: 'claude-opus', provider: 'anthropic', model: 'claude-opus-4-6' },
      { id: 'gpt-4o', provider: 'openai', model: 'gpt-4o' },
      // + todos os do tier pro
    ],
  };
  ```
- **System Prompt para LaTeX** (`lib/ai/latex-system-prompt.ts`):
  - A IA deve ser especialista em LaTeX
  - Deve conhecer todos os pacotes principais: `amsmath`, `amssymb`, `geometry`, `graphicx`, `hyperref`, `babel`, `fontenc`, `inputenc`, `listings`, `tikz`, `pgfplots`, `booktabs`, `multirow`, `xcolor`, `fancyhdr`, `titlesec`, `tocloft`, `natbib`, `biblatex`, `caption`, `subcaption`, `float`, `algorithm2e`, `minted`
  - Deve gerar código LaTeX válido e compilável
  - Deve formatar respostas com blocos de código LaTeX que podem ser aplicados diretamente
  - Deve incluir `\documentclass`, preâmbulo completo, e `\begin{document}...\end{document}` quando apropriado
- **Arquivo de Conhecimento LaTeX** (`lib/ai/latex-knowledge.md`):
  - Criar um arquivo MD extenso (~2000 linhas) com:
    - Referência completa de comandos LaTeX
    - Exemplos de documentos-tipo (artigo, relatório, carta, currículo, apresentação beamer)
    - Troubleshooting de erros comuns de compilação
    - Best practices de formatação
    - Templates para tabelas, figuras, equações, bibliografias
  - Este arquivo é injetado no contexto da IA como referência
- **Funcionalidade de "Aplicar no Código"**:
  - Quando a IA sugere mudanças, o usuário pode clicar "Aplicar" e o código é inserido/substituído no editor
  - Usar diff para mostrar o que mudou antes de aplicar
  - Streaming: o usuário vê o código sendo gerado em tempo real no chat e, ao aplicar, vê o PDF sendo recompilado

### Teammate 4: "devops-integration"
**Ownership**: `package.json`, `CLAUDE.md`, `.env.example`, configs (tailwind, tsconfig, convex, next.config)
**Responsabilidades**:
- Setup inicial do projeto: `npx create-next-app@latest` com TypeScript, Tailwind, App Router
- Instalar TODAS as dependências:
  ```bash
  # Core
  npm install next react react-dom
  # UI
  npx shadcn@latest init
  npx shadcn@latest add button card dialog dropdown-menu input tabs toast tooltip sheet badge avatar command separator scroll-area select switch label popover
  # Editor
  npm install @codemirror/lang-latex @codemirror/view @codemirror/state codemirror @codemirror/commands @codemirror/search
  # PDF
  npm install react-pdf @react-pdf-viewer/core @react-pdf-viewer/default-layout
  # AI
  npm install ai @ai-sdk/anthropic @ai-sdk/openai
  # Auth
  npm install better-auth
  # Backend
  npm install convex
  # LaTeX
  npm install latex.js node-latex
  # Animações
  npm install framer-motion
  # Utilidades
  npm install zod zustand react-resizable-panels lucide-react date-fns
  ```
- Configurar `CLAUDE.md` com:
  - Descrição do projeto
  - Comandos de dev: `npm run dev`, `npx convex dev`
  - Convenções de código: usar TypeScript strict, componentes funcionais, server components por padrão, "use client" apenas quando necessário
  - Regras de lint e formatação
- Configurar `.env.example` com todas as variáveis necessárias:
  ```
  # Convex
  CONVEX_DEPLOYMENT=
  NEXT_PUBLIC_CONVEX_URL=
  
  # BetterAuth
  BETTER_AUTH_SECRET=
  BETTER_AUTH_URL=http://localhost:3000
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  GITHUB_CLIENT_ID=
  GITHUB_CLIENT_SECRET=
  
  # AI Providers
  ANTHROPIC_API_KEY=
  OPENAI_API_KEY=
  
  # LaTeX (se usar serviço externo)
  LATEX_COMPILE_API_URL=
  ```
- Garantir que o projeto roda com `npm run dev` no terminal do Claude Code
- Testar compilação, HMR, e fluxo completo

---

## 💰 PRICING TIERS — Detalhamento

### Tier 1: Free (Gratuito)
- **Preço**: R$ 0/mês
- **Projetos**: Máximo 3
- **Edições IA**: Máximo 3 por projeto (total 9 mensagens)
- **Compilação**: Apenas preview (latex.js client-side)
- **Modelos IA**: Nenhum (chat desabilitado)
- **Storage**: 50MB
- **Features**: Editor básico, syntax highlighting, preview em tempo real
- **Label no card**: "Para experimentar"

### Tier 2: Pro
- **Preço**: R$ 49/mês (ou R$ 39/mês no plano anual)
- **Projetos**: Ilimitados
- **Edições IA**: 50 mensagens/dia
- **Compilação**: Completa (server-side com texlive → PDF real)
- **Modelos IA**: Claude Haiku, GPT-4o-mini (modelos econômicos)
- **Storage**: 5GB
- **Features**: Tudo do Free + IA assistente, compilação real, export PDF, histórico de versões
- **Label no card**: "Mais popular" (com badge destacado)

### Tier 3: Enterprise
- **Preço**: R$ 149/mês (ou R$ 119/mês no plano anual)
- **Projetos**: Ilimitados
- **Edições IA**: Ilimitadas
- **Compilação**: Completa + prioridade na fila
- **Modelos IA**: Todos — Claude Sonnet, Claude Opus, GPT-4o, + modelos futuros
- **Storage**: Ilimitado
- **Features**: Tudo do Pro + todos os modelos, compilação prioritária, colaboração em tempo real (futuro), suporte prioritário, API access
- **Label no card**: "Para profissionais"

---

## 🔧 FUNCIONALIDADES DETALHADAS

### Editor (Lado Esquerdo)
1. **CodeMirror 6** com:
   - Syntax highlighting para LaTeX
   - Autocomplete de comandos (`\begin{`, `\usepackage{`, etc.)
   - Bracket matching e auto-close
   - Line numbers
   - Minimap (opcional)
   - Find & Replace (Ctrl+H)
   - Múltiplas abas para múltiplos arquivos .tex
   
2. **Tabs alternáveis**: "Editor" ↔ "Chat IA"
   - Transição suave entre as abas
   - Indicador de mensagens não lidas no chat
   - Atalho de teclado: Ctrl+Shift+C para alternar

3. **Chat IA** (quando na aba de chat):
   - Interface de chat com input na parte inferior
   - Seletor de modelo (dropdown baseado no tier)
   - Streaming de respostas em tempo real
   - Blocos de código LaTeX com botão "Aplicar no editor"
   - Ao clicar "Aplicar": código é inserido no editor e PDF recompila automaticamente
   - Contexto: a IA sempre recebe o código LaTeX atual + o arquivo `latex-knowledge.md` como referência
   - Histórico de conversas por documento

### Visualizador PDF (Lado Direito)
1. **Auto-compilação**: debounce de 1.5s após cada mudança no código
2. **Loading state**: indicador de compilação (spinner + barra de progresso)
3. **Zoom**: controles + scroll wheel
4. **Navegação por páginas**: thumbnails laterais (colapsáveis)
5. **Download**: botão para baixar o PDF compilado
6. **Error display**: se a compilação falhar, mostrar erros de LaTeX formatados de forma amigável no lugar do PDF
7. **Split pane redimensionável**: arrastar o divisor para ajustar proporção esquerda/direita

### Dashboard (Lista de Projetos)
1. Grid de cards com preview do último PDF
2. Criar novo projeto (com templates: artigo, relatório, currículo, apresentação, em branco)
3. Buscar e filtrar projetos
4. Contador de uso (projetos usados/máximo para Free tier)
5. Banner de upgrade quando atingir limite

---

## 📋 INSTRUÇÕES ADICIONAIS

### Para Desenvolvimento Local (Claude Code)
- O projeto deve rodar 100% no terminal do Claude Code
- `npm run dev` para Next.js na porta 3000
- `npx convex dev` para o backend Convex
- Variáveis de ambiente configuradas via `.env.local`
- Hot reload funcionando para código LaTeX e componentes React

### Qualidade do Código
- TypeScript strict mode
- Todos os componentes tipados com interfaces/types explícitos
- Usar Zod para validação de inputs
- Server Components por padrão; "use client" somente quando necessário
- Zustand para state management global (user, editor state, compilation state)
- Error boundaries em todas as rotas principais
- Loading states e skeletons para toda operação assíncrona

### UX/Performance
- Debounce na compilação (não compilar a cada keystroke)
- Optimistic updates no chat
- Lazy loading do PDF viewer
- Code splitting por rota
- Prefetch das rotas adjacentes
- Toast notifications para erros e sucesso
- Command palette (Ctrl+K) para navegação rápida

### Segurança
- Rate limiting nas API routes
- Sanitização de input LaTeX (prevenir injection)
- Validação de tier no servidor antes de permitir IA
- CORS configurado
- Variáveis sensíveis apenas server-side

---

## ⚡ FLUXO DO USUÁRIO

1. **Chega na landing page** → vê o hero com demo do editor → clica "Começar grátis"
2. **Se registra** via BetterAuth (Google, GitHub, ou email)
3. **Dashboard** → vê projetos (vazio inicialmente) → clica "Novo Projeto"
4. **Escolhe template** → entra no editor
5. **Edita LaTeX** no lado esquerdo → vê PDF compilando automaticamente no lado direito
6. **Alterna para Chat** → conversa com IA pedindo ajuda (ex: "Adicione uma tabela com 3 colunas")
7. **IA responde** com código LaTeX → clica "Aplicar" → código é inserido → PDF recompila
8. **Baixa o PDF** quando terminar
9. **Atinge limite** do Free → vê banner → faz upgrade para Pro

---

## 🚀 ORDEM DE EXECUÇÃO DOS TEAMMATES

1. **devops-integration**: Setup do projeto, instalar dependências, configurar tudo. Só quando terminar, os outros começam.
2. **Em paralelo**:
   - **backend-engineer**: Schema Convex, auth, API routes
   - **ai-engineer**: Providers, system prompt, knowledge base, chat route
3. **frontend-engineer**: Componentes UI, pages, integração com backend e IA (começa em paralelo mas integra depois)
4. **Todos juntos**: Integração final, testes, ajustes

Cada teammate deve commitar com mensagens claras: `[teammate-name] feat: descrição`. O lead coordena merges e resolve conflitos.
```

---

> **Nota**: Ajuste as API keys no `.env.local` antes de rodar. Para produção, substituir a compilação LaTeX local por um serviço cloud (ex: LaTeX.Online API ou container Docker com texlive). O Convex em produção usa o deployment da própria Convex Cloud.
