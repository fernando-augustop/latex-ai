# Prompt de Execução — Claude Code Agent Teams + Agent Browser

> **Cole este prompt inteiro no Claude Code para iniciar o projeto.**
> **Pré-requisitos**: Agent Teams habilitado (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) e agent-browser instalado (`npx skills add vercel-labs/agent-browser`).

---

```
## INSTRUÇÃO PRINCIPAL

Leia o arquivo de especificação completo do projeto em `./prompt-latex-editor.md` ANTES de qualquer ação. Este arquivo é a fonte da verdade e contém toda a arquitetura, stack, estrutura de diretórios, funcionalidades, tiers de pricing, schema do banco, e ordem de execução. Você DEVE respeitar TUDO que está nele — cada decisão de tech stack, cada nome de diretório, cada tier de preço, cada detalhe de UX. Não desvie da spec sem pedir permissão explícita.

Após ler o arquivo, confirme que entendeu listando:
1. Os 4 teammates e suas responsabilidades
2. A stack completa
3. Os 3 tiers de pricing
4. O fluxo do usuário

Depois dessa confirmação, inicie a execução.

---

## REGRA CRÍTICA: VERIFICAÇÃO VISUAL COM AGENT-BROWSER

### Setup Inicial do Agent-Browser
Antes de começar o desenvolvimento, execute:
```bash
npx skills add vercel-labs/agent-browser
```

Cada teammate que produz output visual DEVE usar `agent-browser` para verificar seu trabalho. O ciclo obrigatório é:

### Ciclo Build → Verify → Fix (BVF)
```
1. IMPLEMENTAR → escrever o código do componente/página
2. VERIFICAR  → usar agent-browser para abrir http://localhost:3000 e inspecionar visualmente
3. CORRIGIR   → se algo estiver errado, corrigir e voltar ao passo 2
4. AVANÇAR    → só passar para o próximo componente após verificação visual passar
```

### Comandos Agent-Browser que os teammates DEVEM usar:

```bash
# Abrir a página no browser
agent-browser open http://localhost:3000

# Tirar snapshot dos elementos interativos
agent-browser snapshot -i

# Navegar para páginas específicas
agent-browser open http://localhost:3000/pricing
agent-browser open http://localhost:3000/login
agent-browser open http://localhost:3000/projects
agent-browser open http://localhost:3000/projects/test-project-id

# Verificar elementos específicos
agent-browser snapshot -s ".editor-container"
agent-browser snapshot -s ".pdf-viewer"
agent-browser snapshot -s ".pricing-cards"
agent-browser snapshot -s ".chat-panel"

# Testar interações
agent-browser click @e1          # Clicar em botões
agent-browser fill @e2 "texto"   # Preencher inputs
agent-browser scroll down 500    # Scroll

# Capturar screenshot para análise
agent-browser screenshot ./screenshots/current-state.png

# Esperar carregamento completo
agent-browser wait --load networkidle
```

### Checkpoints Obrigatórios de Verificação Visual

O lead agent deve garantir que CADA checkpoint abaixo seja verificado com agent-browser antes de avançar:

**Checkpoint 1 — Setup Básico (após devops-integration)**
```bash
agent-browser open http://localhost:3000
agent-browser snapshot -i
# VERIFICAR: página carrega, Next.js funcionando, Tailwind aplicado
```

**Checkpoint 2 — Landing Page (após frontend-engineer)**
```bash
agent-browser open http://localhost:3000
agent-browser snapshot -i
agent-browser scroll down 1000
# VERIFICAR: hero section, features, CTA buttons, animações, responsividade
# Testar em viewport mobile:
agent-browser screenshot ./screenshots/landing-desktop.png
```

**Checkpoint 3 — Pricing Page**
```bash
agent-browser open http://localhost:3000/pricing
agent-browser snapshot -i
# VERIFICAR: 3 cards visíveis, preços corretos (R$0, R$49, R$149), badge "Popular", toggle mensal/anual
agent-browser click @[toggle-anual]  # Testar toggle
agent-browser snapshot -i            # Verificar preços atualizados
agent-browser screenshot ./screenshots/pricing.png
```

**Checkpoint 4 — Autenticação**
```bash
agent-browser open http://localhost:3000/login
agent-browser snapshot -i
# VERIFICAR: form de login, botões OAuth (Google, GitHub), link para registro
agent-browser open http://localhost:3000/register
agent-browser snapshot -i
# VERIFICAR: form de registro funcional
```

**Checkpoint 5 — Dashboard**
```bash
agent-browser open http://localhost:3000/projects
agent-browser snapshot -i
# VERIFICAR: grid de projetos, botão "Novo Projeto", contador de uso, navbar com avatar
agent-browser click @[novo-projeto]
agent-browser snapshot -i
# VERIFICAR: modal/dialog de criação com templates (artigo, relatório, currículo, etc.)
```

**Checkpoint 6 — Editor Principal (MAIS CRÍTICO)**
```bash
agent-browser open http://localhost:3000/projects/[test-id]
agent-browser snapshot -i
agent-browser screenshot ./screenshots/editor-full.png
# VERIFICAR:
# - Split pane: código à esquerda, PDF à direita
# - CodeMirror com syntax highlighting LaTeX
# - Toolbar no topo (compilar, download, settings)
# - Tabs "Editor" e "Chat IA" funcionando

# Testar edição de código
agent-browser click @[editor-area]
agent-browser type @[editor-area] "\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}"
agent-browser wait --load networkidle
# VERIFICAR: PDF compilou e aparece no viewer direito

# Testar alternância para Chat
agent-browser click @[tab-chat]
agent-browser snapshot -i
# VERIFICAR: interface de chat aparece, input field, seletor de modelo
```

**Checkpoint 7 — Chat IA**
```bash
# Na aba de chat do editor
agent-browser fill @[chat-input] "Adicione uma seção com uma tabela de 3 colunas"
agent-browser click @[send-button]
agent-browser wait --load networkidle
agent-browser snapshot -i
# VERIFICAR: resposta da IA aparece com streaming, bloco de código LaTeX, botão "Aplicar"
```

**Checkpoint 8 — Responsividade**
```bash
# Verificar em diferentes viewports (se suportado pelo agent-browser)
agent-browser open http://localhost:3000
agent-browser screenshot ./screenshots/responsive-check.png
agent-browser open http://localhost:3000/pricing
agent-browser screenshot ./screenshots/pricing-responsive.png
```

---

## CRIAÇÃO DO AGENT TEAM

Crie um agent team seguindo esta estrutura. Use delegate mode (Shift+Tab) para o lead ficar apenas coordenando.

### Lead Agent (você — coordenação apenas)
- Leia `./prompt-latex-editor.md` completamente
- Spawne os 4 teammates na ordem especificada
- Coordene a execução sequencial/paralela conforme a spec
- Execute TODOS os checkpoints de agent-browser listados acima
- Resolva conflitos entre teammates
- Garanta que o `npm run dev` roda sem erros em cada checkpoint
- Só declare "completo" após TODOS os 8 checkpoints passarem

### Teammate 1: "devops-integration"
Spawnar com este prompt:
```
Você é o devops-integration. Leia o arquivo ./prompt-latex-editor.md e execute APENAS as responsabilidades do "Teammate 4: devops-integration". Sua ownership é: package.json, CLAUDE.md, .env.example, e todos os arquivos de configuração.

Faça o setup do projeto:
1. npx create-next-app@latest texai --typescript --tailwind --app --src-dir=false
2. cd texai e instale TODAS as dependências listadas na spec
3. Configure shadcn/ui com `npx shadcn@latest init` e adicione todos os componentes listados
4. Configure Convex com `npx convex init`
5. Crie .env.example com todas as variáveis
6. Crie o CLAUDE.md com instruções do projeto
7. Garanta que `npm run dev` funciona sem erros

Após completar, use agent-browser para verificar:
agent-browser open http://localhost:3000
agent-browser snapshot -i
agent-browser screenshot ./screenshots/setup-complete.png

Reporte ao lead quando terminar.
```

### Teammate 2: "backend-engineer"
Spawnar APÓS devops-integration terminar, com este prompt:
```
Você é o backend-engineer. Leia o arquivo ./prompt-latex-editor.md e execute APENAS as responsabilidades do "Teammate 2: backend-engineer". Sua ownership é: convex/, app/api/, lib/auth.ts, lib/latex/.

Implemente:
1. Schema completo do Convex (users, projects, documents, chatMessages, subscriptions)
2. Mutations e queries do Convex para CRUD de projetos e documentos
3. BetterAuth com Convex adapter (Google + GitHub + email/password)
4. API route POST /api/compile para compilação LaTeX
5. Enforcement de limites por tier no backend
6. Sistema de compilação com debounce e fallback (latex.js client + node-latex server)

Após cada módulo, use agent-browser para verificar que as API routes respondem:
agent-browser open http://localhost:3000/api/auth/session
agent-browser snapshot -i

Reporte ao lead quando terminar.
```

### Teammate 3: "ai-engineer"
Spawnar EM PARALELO com backend-engineer, com este prompt:
```
Você é o ai-engineer. Leia o arquivo ./prompt-latex-editor.md e execute APENAS as responsabilidades do "Teammate 3: ai-engineer". Sua ownership é: lib/ai/, app/api/chat/.

Implemente:
1. lib/ai/providers.ts — configuração dos modelos por tier usando Vercel AI SDK (@ai-sdk/anthropic, @ai-sdk/openai)
2. lib/ai/latex-system-prompt.ts — system prompt completo que faz a IA ser expert em LaTeX
3. lib/ai/latex-knowledge.md — arquivo de conhecimento extenso (~2000 linhas) com referência completa de LaTeX, exemplos, troubleshooting, templates
4. app/api/chat/route.ts — route handler com streamText() do AI SDK, seleção de modelo por tier do usuário
5. Funcionalidade de "Aplicar no código" — diff e inserção no editor

O arquivo latex-knowledge.md é FUNDAMENTAL — ele baliza toda a inteligência da IA. Dedique tempo para criar um arquivo completo e útil.

Reporte ao lead quando terminar.
```

### Teammate 4: "frontend-engineer"
Spawnar EM PARALELO com backend e ai, com este prompt:
```
Você é o frontend-engineer. Leia o arquivo ./prompt-latex-editor.md e execute APENAS as responsabilidades do "Teammate 1: frontend-engineer". Sua ownership é: components/, app/(marketing)/, app/(dashboard)/, app/layout.tsx, globals.css.

USE A SKILL FRONTEND-DESIGN para criar interfaces distintas e production-grade. Nada de design genérico de IA.

Direção estética: Editorial/Magazine meets Developer Tool
- Dark mode padrão
- Tipografia: fonte display distinta para títulos, JetBrains Mono para código, fonte humanista para corpo
- Paleta escura com acentos em verde-esmeralda ou âmbar
- Animações com Framer Motion

Implemente nesta ordem:
1. Layout global (navbar, footer, tema dark)
2. Landing page (hero com animação de LaTeX → PDF, features, CTA)
3. Pricing page (3 cards, toggle mensal/anual, badge "Popular")
4. Auth pages (login, register — integração com BetterAuth)
5. Dashboard (grid de projetos, criar projeto, templates)
6. Editor principal:
   - Split pane redimensionável (react-resizable-panels)
   - Esquerda: CodeMirror 6 com LaTeX + tabs "Editor"/"Chat IA"
   - Direita: PDF viewer com auto-compilação
   - Toolbar superior
   - Chat panel com streaming, seletor de modelo, botão "Aplicar"

APÓS CADA PÁGINA/COMPONENTE, use agent-browser para verificar visualmente:
agent-browser open http://localhost:3000/[rota-relevante]
agent-browser snapshot -i
agent-browser screenshot ./screenshots/[nome-do-componente].png

Se algo não estiver visualmente correto, CORRIJA antes de avançar.
Reporte ao lead quando terminar.
```

---

## REGRAS GLOBAIS PARA TODOS OS TEAMMATES

1. **Antes de qualquer código**: Leia `./prompt-latex-editor.md` completamente
2. **Agent-browser é obrigatório**: Após implementar qualquer componente visual ou API, use agent-browser para verificar
3. **Commits claros**: `[teammate-name] feat: descrição` (ex: `[frontend-engineer] feat: pricing page com 3 tiers`)
4. **Não desvie da spec**: Se precisar mudar algo, comunique ao lead primeiro
5. **TypeScript strict**: Sem `any`, todas as interfaces tipadas
6. **shadcn/ui**: Usar componentes do shadcn para toda a UI — não reinventar a roda
7. **Errors**: Nunca silenciar erros. Log, toast, ou error boundary
8. **Dev server sempre rodando**: `npm run dev` deve estar ativo na porta 3000 durante todo o desenvolvimento para que o agent-browser possa verificar

---

## FLUXO DE EXECUÇÃO COMPLETO

```
FASE 1 — SETUP (devops-integration sozinho)
├── Criar projeto Next.js
├── Instalar dependências
├── Configurar shadcn/ui, Convex, env
├── ✅ Checkpoint 1: agent-browser verifica que localhost:3000 carrega
│
FASE 2 — BACKEND + AI + FRONTEND (em paralelo)
├── backend-engineer: Convex schema, auth, APIs
├── ai-engineer: providers, prompts, knowledge base
├── frontend-engineer: landing, pricing, auth pages
├── ✅ Checkpoint 2: landing page
├── ✅ Checkpoint 3: pricing page
├── ✅ Checkpoint 4: auth pages
│
FASE 3 — INTEGRAÇÃO
├── frontend-engineer: dashboard + editor principal
├── Integrar auth do backend com frontend
├── Integrar chat IA no editor
├── ✅ Checkpoint 5: dashboard
├── ✅ Checkpoint 6: editor principal
├── ✅ Checkpoint 7: chat IA funcional
│
FASE 4 — POLISH & VERIFICAÇÃO FINAL
├── Todos: ajustes, bugs, polish
├── ✅ Checkpoint 8: responsividade
├── Lead: verificação final completa com agent-browser em TODAS as rotas
├── Lead: confirma que TODOS os 8 checkpoints passam
└── DONE ✅
```

---

## APÓS CONCLUSÃO

Quando todos os checkpoints passarem, o lead deve:
1. Executar uma verificação final completa com agent-browser navegando por TODAS as rotas
2. Garantir que `npm run dev` roda sem erros no console
3. Listar qualquer feature da spec que ficou pendente (se houver)
4. Fornecer instruções de como configurar as API keys para uso real

Comece agora. Leia o arquivo `./prompt-latex-editor.md` e inicie.
```
