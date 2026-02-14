# Otimizacao da Compilacao LaTeX — Pesquisa e Implementacao

## Resumo das Fases

| Fase | Status | Descricao | Ganho |
|------|--------|-----------|-------|
| Fase 1 | Implementada | DB round-trips, storage URL, auto-compile | Marginal (~200ms) |
| **Fase 2A** | **Implementada** | Rota direta (bypass Convex) | **~900ms eliminados** |
| **Fase 2B** | **Implementada** | pdflatex-fast + .fmt precompilation | **38x no servidor** |
| **Fase 2C** | **Implementada** | Debounce reduzido | Pro: 3s → 1s |

---

## Resultados Medidos (Fase 2)

### Benchmark no servidor (localhost, documento simples com amsmath)

| Engine | Duracao | Speedup vs Tectonic |
|--------|---------|---------------------|
| **pdflatex-fast (cold, cria .fmt)** | **58ms** | 38x |
| **pdflatex-fast (warm, .fmt cacheado)** | **58ms** | 38x |
| tectonic | 2235ms | baseline |

### Latencia end-to-end estimada

| Cenario | Fase 1 (via Convex) | Fase 2 (rota direta + pdflatex-fast) |
|---------|---------------------|--------------------------------------|
| Incremental (body change) | 2-3s | **~200-400ms** |
| Cold (preamble novo) | 2-3s | **~300-600ms** |
| Cache hit (hash identico) | ~0s | ~0s |
| Auto-compile percebido (Pro) | 5-6s | **~1.2-1.6s** |

---

## Analise de Latencia — Antes vs Depois

### Fase 1 (via Convex Cloud)

```
Browser -> Convex Cloud (useAction RPC)      ~150ms
Convex: authorizeAndPrepareCompile mutation   ~100ms
Convex Cloud -> Tailscale -> Servidor         ~200ms
Servidor: Tectonic compilacao                 ~800-1200ms  ← GARGALO
Servidor -> Convex Cloud (response JSON)      ~200ms
Convex: storage.store() upload PDF            ~200ms
Browser: fetch(storageUrl) do CDN Convex      ~200ms
─────────────────────────────────────────────────────────
TOTAL                                         ~1850-2250ms
```

### Fase 2 (rota direta + pdflatex-fast)

```
Browser -> Next.js Server (fetch POST)        ~50ms
Next.js: isAuthenticated() + HMAC             ~50ms
Next.js -> Tailscale -> Servidor              ~100ms
Servidor: pdflatex-fast (.fmt cacheado)       ~60ms   ← 38x MAIS RAPIDO
Servidor -> Next.js (JSON response)           ~100ms
Next.js: base64 decode -> binary response     ~5ms
Browser: response.blob() + createObjectURL    ~5ms
─────────────────────────────────────────────────────
TOTAL                                         ~370ms
```

### O que foi eliminado na Fase 2A (bypass Convex)

| Eliminado | Tempo salvo |
|-----------|-------------|
| WebSocket RPC ao Convex Cloud | ~150ms |
| authorizeAndPrepareCompile mutation | ~100ms |
| finalizeCompilation mutation | ~50ms |
| ctx.storage.store() upload | ~200ms |
| ctx.storage.getUrl() + CDN fetch | ~250ms |
| Base64 encode/decode (ida e volta) | ~50ms |
| **Total** | **~800ms** |

### O que foi ganho na Fase 2B (pdflatex-fast)

| Metrica | Tectonic | pdflatex-fast | Reducao |
|---------|----------|---------------|---------|
| Compilacao servidor | ~2000ms | ~60ms | **97%** |
| Cold start (1a compilacao) | ~2000ms | ~500ms (.fmt criado) | 75% |

---

## Pesquisa: Como o Overleaf e Rapido

Fonte: [Overleaf CLSI](https://github.com/overleaf/overleaf/tree/main/services/clsi), [Wiki](https://github.com/overleaf/overleaf/wiki/Editor-and-Compile-Process), [Blog](https://www.overleaf.com/blog/faster-compiles-on-sharelatex-2015-04-21)

### 1. Diretorios Persistentes com Cache de Auxiliares

O CLSI preserva o diretorio de compilacao inteiro entre compilacoes de cada projeto. Todos os `.aux`, `.toc`, `.log`, `.bbl` persistem. Isso permite que o LaTeX resolva cross-references em 1 pass ao inves de 2-3.

> "The LaTeX compiler generates temporary helper files when it compiles your project. These files are preserved when possible between compiles to help speed up the compilation process."
> — [Overleaf Docs](https://docs.overleaf.com/troubleshooting-and-support/clearing-the-project-cache)

**Status no TexAI**: Implementado. Servidor usa workdirs persistentes em `~/latex-cache/workdirs/{document_id}/`.

### 2. Sync Incremental de Arquivos

O Overleaf usa dois modos de sync:
- **Full sync**: Descarta estado anterior, baixa todos documentos do MongoDB
- **Incremental sync**: Le documentos do Redis (cache in-memory), atualiza apenas os modificados, pula transferencia de binarios

**Relevancia para TexAI**: Baixa (temos 1 arquivo por projeto atualmente). Relevante quando suportarmos multi-file projects.

### 3. PDF.js com Range Requests

O Overleaf reescreveu o viewer para usar PDF.js com range requests. Baixa apenas as paginas que o usuario precisa, em chunks de 64KB.

**Status no TexAI**: Nao implementado. Usamos iframe com blob URL (baixa PDF inteiro).

### 4. Draft Mode

Modo rapido que pula processamento de imagens (substitui por caixas vazias). Reportado como **50-70% mais rapido** com pdfLaTeX.

**Status no TexAI**: Nao implementado. Potencial futuro.

---

## Format Files (.fmt) — Precompilacao de Preamble

### O Que Sao

Um `.fmt` e um dump binario do estado interno da memoria do TeX apos processar o preamble. Em vez de parsear e carregar todos `\usepackage{...}` a cada compile, o engine carrega a imagem de memoria pre-compilada em tempo quase zero.

### Como Funciona no TexAI

1. **Extrair preamble** — tudo antes de `\begin{document}`
2. **Hash SHA-256** do preamble (16 chars) → chave do cache
3. **Verificar cache** — se `~/latex-cache/formats/{hash}.fmt` existe, usa direto
4. **Se nao existe** — `pdflatex -ini -jobname={hash} "&pdflatex preamble.tex\dump"` (one-time)
5. **Compilar com .fmt** — `pdflatex -fmt={hash} -interaction=nonstopmode document.tex`
6. **Fallback** — se pdflatex-fast falhar, retry com Tectonic automaticamente

### DESCOBERTA CRITICA: Tectonic NAO Suporta .fmt com Fontes Modernas

Tectonic e baseado em XeTeX. O XeTeX tem uma limitacao fundamental: format files nao podem conter fontes "nativas" (TrueType/OpenType).

Fonte: [Tectonic Issue #1013](https://github.com/tectonic-typesetting/tectonic/issues/1013)

> "Tectonic and XeTeX currently do not let you create a format file that contains a 'native' font."
> — Peter Williams (maintainer do Tectonic)

| Engine | Suporta .fmt? | Com fontes nativas? | Speedup real |
|--------|---------------|--------------------:|-------------|
| **pdflatex** | **Sim** | N/A (usa fontes Type1) | **2-38x** |
| XeTeX/Tectonic | Parcial | **Nao** | Minimo |
| LuaLaTeX | Parcial | Limitado | ~1.5x |

---

## Arquivos Modificados na Fase 2

### Cliente (Next.js)

| Arquivo | Mudanca |
|---------|---------|
| `app/api/compile/route.ts` | Reescrito: stub → rota direta com PDF binario |
| `hooks/use-latex-compiler.ts` | `useAction` → `fetch("/api/compile")`, blob direto, tracking async |
| `convex/latex.ts` | Nova mutation `trackDirectCompile` (fire-and-forget) |
| `lib/tier-limits.ts` | autoCompileDebounceMs reduzido (free=2s, pro=1s, enterprise=0.8s) |
| `app/(dashboard)/projects/[id]/page.tsx` | Engine default: `tectonic` → `pdflatex-fast` |
| `.env.local` | Adicionado `LATEX_API_URL`, `LATEX_API_SECRET` |

### Servidor (omarchy)

| Arquivo | Mudanca |
|---------|---------|
| `~/latex-api/main.py` | v2: engine `pdflatex-fast` com .fmt, tectonic fallback |
| `~/latex-cache/formats/` | Novo: diretorio de .fmt files |
| `~/latex-cache/workdirs/` | Novo: workdirs persistentes por document_id |

### Debounce (auto-compile)

| Tier | Antes | Depois |
|------|-------|--------|
| free | 5000ms | 2000ms |
| pro | 3000ms | 1000ms |
| enterprise | 3000ms | 800ms |

---

## Fluxo de Compilacao (Fase 2)

```
Browser (useLatexCompiler hook)
    │
    │ 1. Hash SHA-256 do source (client-side)
    │ 2. Verifica cache local (hash → blob URL)
    │ 3. Se cache hit → exibe PDF direto (0ms)
    │
    │ 4. fetch("/api/compile", { source, engine, documentId })
    ▼
Next.js API Route (app/api/compile/route.ts)
    │  - isAuthenticated()
    │  - HMAC-SHA256 do source com LATEX_API_SECRET
    │  - fetch(LATEX_API_URL + "/compile")
    ▼
Tailscale Funnel (HTTPS)
    ▼
omarchy:8787 (FastAPI)
    │  - Verificar HMAC
    │  - Se engine = pdflatex-fast:
    │      - Extrair preamble
    │      - Hash do preamble → verificar .fmt cache
    │      - Se .fmt nao existe → pdflatex -ini (cria .fmt)
    │      - pdflatex -fmt={hash} document.tex
    │      - Se falhar → fallback para Tectonic
    │  - Se engine = tectonic:
    │      - tectonic -X compile document.tex
    │
    │ JSON { pdf: base64, duration_ms, logs, engine }
    ▼
Next.js API Route
    │  Buffer.from(base64) → binary response
    │  Headers: Content-Type: application/pdf, X-Compile-Duration
    ▼
Browser
    │  response.blob() → URL.createObjectURL(blob)
    │  → Exibe PDF no iframe
    │
    │  Fire-and-forget (async, nao bloqueia):
    │  trackDirectCompile({ documentId, sourceHash, engine, durationMs })
    │  → Convex: incrementa compilesUsedToday, atualiza lastCompiledAt
    ▼
PDF Viewer
```

---

## Futuras Otimizacoes (nao implementadas)

| Tecnica | Ganho estimado | Complexidade |
|---------|---------------|-------------|
| PDF.js com range requests | -30-50% tempo de render para docs grandes | Media |
| SwiftLaTeX WASM (preview local) | Elimina rede completamente | Alta (AGPL) |
| Draft mode | -50-70% compilacao | Baixa |
| Multi-file incremental sync | Relevante para projetos grandes | Media |

---

## Referencias

- [Overleaf CLSI README](https://github.com/overleaf/overleaf/blob/main/services/clsi/README.md)
- [Overleaf Editor and Compile Process Wiki](https://github.com/overleaf/overleaf/wiki/Editor-and-Compile-Process)
- [Overleaf - Faster Compiles (2015)](https://www.overleaf.com/blog/faster-compiles-on-sharelatex-2015-04-21)
- [Overleaf - Clearing the Project Cache](https://docs.overleaf.com/troubleshooting-and-support/clearing-the-project-cache)
- [Overleaf Optimizer](https://lodepublishing.com/blog/the-overleaf-optimizer-intelligent-latex-compilation-for-speed-and-quality/)
- [Tony Zorman - Speeding up LaTeX](https://tony-zorman.com/posts/speeding-up-latex.html)
- [latex-fast-compile (Go)](https://github.com/kpym/latex-fast-compile)
- [tex-fast-recompile (Python)](https://github.com/user202729/tex-fast-recompile)
- [Tectonic Issue #1013 - pdftex -ini equivalent](https://github.com/tectonic-typesetting/tectonic/issues/1013)
- [Tectonic Discussion #1153 - Compile time](https://github.com/tectonic-typesetting/tectonic/discussions/1153)
- [SwiftLaTeX](https://github.com/SwiftLaTeX/SwiftLaTeX)
- [BusyTeX/BusyIDE](https://github.com/busytex/busyide)
- [mylatexformat (CTAN)](https://www.ctan.org/tex-archive/macros/latex/contrib/mylatexformat)
