# TexAI LaTeX Compilation Server

Servidor de compilacao LaTeX auto-hospedado rodando no VPS `omarchy` via Tailscale Funnel.

## Infraestrutura

| Item | Valor |
|------|-------|
| **Host** | `augustop@omarchy` (SSH via Tailscale) |
| **OS** | Arch Linux (kernel 6.18.3) |
| **URL publica** | `https://omarchy.tailcee049.ts.net` |
| **Porta local** | `127.0.0.1:8787` |
| **Exposicao** | Tailscale Funnel (HTTPS automatico) |
| **Processo** | systemd service `latex-api` |
| **Runtime** | Python 3.13 + FastAPI 0.128.8 + Uvicorn 0.40.0 |
| **Engines** | Tectonic 0.15.0, pdfTeX 3.14 (TeX Live 2026/dev) |

## Estrutura no servidor

```
/home/augustop/
├── latex-api/
│   ├── main.py                 ← FastAPI app (este arquivo)
│   ├── latex-api.service        ← Systemd unit file
│   ├── main.py.bak             ← Backup da versao anterior
│   └── venv/                   ← Python virtualenv
│       └── bin/uvicorn
├── latex-cache/
│   ├── formats/                ← .fmt files (preamble precompilado)
│   │   └── {hash}.fmt          ← ~2MB cada, criado automaticamente
│   └── workdirs/               ← Workdirs persistentes por document_id
│       └── {document_id}/      ← .aux, .toc, .log reutilizados entre compiles
└── .local/bin/
    └── tectonic                ← Tectonic 0.15.0
```

## Endpoints

### `GET /health`

Retorna status dos engines e quantidade de format files cacheados.

```json
{
  "status": "healthy",
  "engines": {
    "tectonic": "tectonic 0.15.0",
    "pdflatex": "pdfTeX 3.141592653-2.6-1.40.27 (TeX Live 2026/dev/Arch Linux)"
  },
  "cached_formats": 1
}
```

### `POST /compile`

Compila LaTeX e retorna PDF em base64.

**Headers:**
- `Content-Type: application/json`
- `X-API-Secret: <HMAC-SHA256 do source>` (obrigatorio)

**Body:**
```json
{
  "source": "\\documentclass{article}\\begin{document}Hello\\end{document}",
  "engine": "pdflatex-fast",
  "document_id": "abc123"
}
```

**Engines disponiveis:**

| Engine | Descricao |
|--------|-----------|
| `pdflatex-fast` | **Default.** pdflatex com .fmt precompilado. Fallback automatico para tectonic se falhar. |
| `tectonic` | Tectonic (XeTeX). Mais lento, mas suporta fontes OTF/TTF via fontspec. |
| `pdflatex` | pdflatex padrao sem .fmt. |
| `xelatex` | XeLaTeX (requer TeX Live). |
| `lualatex` | LuaLaTeX (requer TeX Live). |

**Response (sucesso):**
```json
{
  "pdf": "<base64>",
  "logs": "...",
  "duration_ms": 58,
  "engine": "pdflatex-fast"
}
```

**Response (erro):**
```json
{
  "error": "pdflatex-fast: no PDF generated",
  "logs": "...",
  "duration_ms": 120
}
```

## Como funciona o pdflatex-fast

O engine `pdflatex-fast` usa **format files (.fmt)** para pre-compilar o preamble do documento:

1. **Extrai o preamble** — tudo antes de `\begin{document}`
2. **Calcula hash SHA-256** do preamble (16 chars)
3. **Verifica cache** — se `~/latex-cache/formats/{hash}.fmt` existe, usa direto
4. **Se nao existe** — roda `pdflatex -ini` para criar o .fmt (one-time, ~500ms)
5. **Compila o documento** usando `pdflatex -fmt={hash}` — pula todo o preamble
6. **Se falhar** — fallback automatico para Tectonic

### Benchmarks reais (medidos no servidor)

| Cenario | pdflatex-fast | Tectonic | Speedup |
|---------|---------------|----------|---------|
| Documento simples (amsmath) | **58ms** | 2235ms | **38x** |
| Preamble pesado (1a vez, cria .fmt) | ~500ms | ~2-3s | 4-6x |
| Incremental (body change, .fmt cacheado) | **50-80ms** | ~2s | **25-40x** |

### Quando o Tectonic e usado como fallback

- Documento sem `\begin{document}` (ex: fragmento LaTeX)
- Criacao do .fmt falha (preamble incompativel com pdflatex)
- Compilacao com .fmt falha (doc usa features XeTeX como `fontspec`)

## Autenticacao

Toda request de compilacao requer um header `X-API-Secret` contendo o HMAC-SHA256 do source:

```python
import hmac, hashlib
secret = "ecb268..."  # LATEX_API_SECRET
source = "\\documentclass{article}..."
signature = hmac.new(secret.encode(), source.encode(), hashlib.sha256).hexdigest()
# Enviar como header X-API-Secret
```

O secret compartilhado esta configurado em:
- **Servidor**: variavel de ambiente no systemd service (`LATEX_API_SECRET`)
- **Next.js**: `.env.local` (`LATEX_API_SECRET`)
- **Convex**: env var (`LATEX_API_SECRET`, para o fluxo legado via `latexNode.ts`)

## Operacoes comuns

```bash
# Status do servico
ssh augustop@omarchy "systemctl status latex-api"

# Logs em tempo real
ssh augustop@omarchy "journalctl -u latex-api -f"

# Restart
ssh augustop@omarchy "sudo systemctl restart latex-api"

# Health check (local)
ssh augustop@omarchy "curl -s http://127.0.0.1:8787/health | python3 -m json.tool"

# Health check (publico)
curl -s https://omarchy.tailcee049.ts.net/health | python3 -m json.tool

# Ver .fmt cacheados
ssh augustop@omarchy "ls -lh ~/latex-cache/formats/"

# Limpar cache de .fmt (forca recompilacao de preambles)
ssh augustop@omarchy "rm ~/latex-cache/formats/*.fmt"

# Ver workdirs persistentes
ssh augustop@omarchy "ls ~/latex-cache/workdirs/"

# Limpar workdirs (forca recompilacao completa)
ssh augustop@omarchy "rm -rf ~/latex-cache/workdirs/*"

# Tailscale Funnel status
ssh augustop@omarchy "tailscale funnel status"
```

## Deploy

Do projeto local:

```bash
# Copiar main.py atualizado e reiniciar
bash server/deploy.sh

# Ou manualmente:
scp server/main.py augustop@omarchy:~/latex-api/main.py
ssh augustop@omarchy "sudo systemctl restart latex-api"
```

## Arquitetura (Fase 2 — Direct Route)

```
Browser (Next.js client)
    │
    │ fetch("/api/compile", { source, engine, documentId })
    ▼
Next.js API Route (app/api/compile/route.ts)
    │  - isAuthenticated()
    │  - HMAC-SHA256 signing
    │  - fetch(LATEX_API_URL + "/compile")
    ▼
Tailscale Funnel (HTTPS)
    │
    ▼
omarchy:8787 (FastAPI + pdflatex/Tectonic)
    │  - pdflatex-fast: .fmt precompilation
    │  - Persistent workdirs (aux/toc reuse)
    │  - Tectonic fallback
    │
    │ JSON { pdf: base64, duration_ms, logs }
    ▼
Next.js API Route
    │
    │ Binary PDF response (Content-Type: application/pdf)
    ▼
Browser
    │  - response.blob() → URL.createObjectURL()
    │  - Fire-and-forget: trackDirectCompile mutation (Convex)
    ▼
PDF Viewer (iframe)
```

### Comparacao com Fase 1 (via Convex)

| Etapa | Fase 1 (Convex) | Fase 2 (Direct) |
|-------|-----------------|-----------------|
| Browser → Backend | WebSocket RPC (~150ms) | fetch() (~50ms) |
| Auth + Quota | authorizeAndPrepareCompile (~100ms) | isAuthenticated() (~50ms) |
| Backend → LaTeX API | Convex Cloud → Tailscale (~200ms) | Vercel/local → Tailscale (~100ms) |
| Compilacao | Tectonic (~2000ms) | pdflatex-fast (~60ms) |
| PDF storage | ctx.storage.store() (~200ms) | N/A (binary direto) |
| PDF delivery | ctx.storage.getUrl() + CDN fetch (~250ms) | Binary response (~0ms) |
| Base64 overhead | Encode + decode (~50ms) | Server-only decode (~5ms) |
| Tracking | Inline (blocking) | Fire-and-forget (async) |
| **Total** | **~2950ms** | **~265ms** |

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| `502 LaTeX API unreachable` | Verificar se servico esta ativo: `systemctl status latex-api` |
| `403 Invalid API secret` | LATEX_API_SECRET em `.env.local` deve ser identico ao do systemd service |
| `422 no PDF generated` | Ver logs: `journalctl -u latex-api -n 50` |
| `pdflatex-fast` cai para Tectonic | Preamble usa features XeTeX — esperado. Ver logs do server |
| .fmt nao e criado | Preamble tem erro de sintaxe. Testar com `pdflatex -ini` manual |
| Tailscale Funnel offline | `ssh augustop@omarchy "tailscale funnel --bg 8787"` |
| `Engine 'pdflatex' not found` | Instalar: `sudo pacman -S texlive-basic texlive-latex` (Arch) |

## Versoes instaladas

| Componente | Versao |
|------------|--------|
| OS | Arch Linux, kernel 6.18.3 |
| Python | 3.13 |
| FastAPI | 0.128.8 |
| Uvicorn | 0.40.0 |
| Pydantic | 2.12.5 |
| Tectonic | 0.15.0 |
| pdfTeX | 3.141592653-2.6-1.40.27 (TeX Live 2026/dev) |
| Tailscale | Funnel ativo em porta 8787 |
