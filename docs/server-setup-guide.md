# Guia de Setup do Servidor de Compilacao LaTeX

Servidor: `augustop@omarchy` (via Tailscale Funnel)

## Pre-requisitos

- Acesso SSH: `ssh augustop@omarchy`
- Tailscale instalado e conectado na rede
- Python 3.9+ instalado no servidor

---

## 1. Instalar Tectonic

```bash
ssh augustop@omarchy

# Instalar Tectonic (binario unico)
curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh

# Verificar instalacao
tectonic --version

# Se nao estiver no PATH, mover para /usr/local/bin
sudo mv ~/.cargo/bin/tectonic /usr/local/bin/tectonic

# Teste rapido — compila um documento minimo (baixa pacotes na 1a vez, ~200MB)
echo '\documentclass{article}\begin{document}Hello\end{document}' > /tmp/test.tex
tectonic /tmp/test.tex
# Deve gerar /tmp/test.pdf
rm /tmp/test.tex /tmp/test.pdf
```

---

## 2. Instalar Dependencias Python

```bash
# Criar diretorio da API
sudo mkdir -p /opt/latex-api
sudo chown augustop:augustop /opt/latex-api

# Criar venv
python3 -m venv /opt/latex-api/venv
source /opt/latex-api/venv/bin/activate

# Instalar FastAPI + Uvicorn
pip install fastapi uvicorn
```

---

## 3. Criar o Servico FastAPI

```bash
cat > /opt/latex-api/main.py << 'PYEOF'
import hashlib
import hmac
import os
import base64
import subprocess
import tempfile
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI(title="TexAI LaTeX Compilation API")

API_SECRET = os.environ.get("LATEX_API_SECRET", "")
MAX_SOURCE_SIZE = 500 * 1024  # 500KB
COMPILE_TIMEOUT = 30  # seconds


class CompileRequest(BaseModel):
    source: str
    engine: str = "tectonic"


def verify_hmac(source: str, provided_hmac: str) -> bool:
    """Verifica HMAC-SHA256 do source."""
    if not API_SECRET:
        return False
    expected = hmac.new(
        API_SECRET.encode(), source.encode(), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, provided_hmac)


@app.get("/health")
async def health():
    """Health check endpoint."""
    # Verifica se tectonic esta acessivel
    try:
        result = subprocess.run(
            ["tectonic", "--version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        tectonic_version = result.stdout.strip()
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)},
        )

    return {
        "status": "healthy",
        "engine": "tectonic",
        "version": tectonic_version,
    }


@app.post("/compile")
async def compile(request: Request, body: CompileRequest):
    """Compila LaTeX source e retorna PDF em base64."""

    # 1. Verificar HMAC
    api_secret_header = request.headers.get("X-API-Secret", "")
    if not verify_hmac(body.source, api_secret_header):
        raise HTTPException(status_code=403, detail="Invalid API secret")

    # 2. Verificar tamanho
    if len(body.source.encode()) > MAX_SOURCE_SIZE:
        raise HTTPException(
            status_code=413, detail=f"Source exceeds {MAX_SOURCE_SIZE} bytes"
        )

    # 3. Validar engine
    allowed_engines = {"tectonic", "pdflatex", "xelatex", "lualatex"}
    if body.engine not in allowed_engines:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid engine. Allowed: {', '.join(allowed_engines)}",
        )

    # 4. Compilar em diretorio temporario
    start_time = time.time()

    with tempfile.TemporaryDirectory(prefix="texai-") as tmpdir:
        tex_path = Path(tmpdir) / "document.tex"
        pdf_path = Path(tmpdir) / "document.pdf"

        # Escrever source
        tex_path.write_text(body.source, encoding="utf-8")

        # Montar comando
        if body.engine == "tectonic":
            cmd = [
                "tectonic",
                "-X", "compile",
                "--outdir", tmpdir,
                str(tex_path),
            ]
        else:
            # pdflatex, xelatex, lualatex (requer TeX Live)
            cmd = [
                body.engine,
                "-interaction=nonstopmode",
                "-output-directory", tmpdir,
                str(tex_path),
            ]

        # Executar
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=COMPILE_TIMEOUT,
                cwd=tmpdir,
            )
        except subprocess.TimeoutExpired:
            return JSONResponse(
                status_code=408,
                content={
                    "error": f"Compilation timed out after {COMPILE_TIMEOUT}s",
                    "logs": "",
                },
            )
        except FileNotFoundError:
            return JSONResponse(
                status_code=500,
                content={
                    "error": f"Engine '{body.engine}' not found on server",
                    "logs": "",
                },
            )

        logs = result.stdout + "\n" + result.stderr
        duration_ms = int((time.time() - start_time) * 1000)

        # 5. Verificar se PDF foi gerado
        if not pdf_path.exists():
            return JSONResponse(
                status_code=422,
                content={
                    "error": "Compilation failed — no PDF generated",
                    "logs": logs[-5000:],  # Limitar tamanho dos logs
                },
            )

        # 6. Ler PDF e retornar como base64
        pdf_bytes = pdf_path.read_bytes()
        pdf_base64 = base64.b64encode(pdf_bytes).decode("ascii")

        return {
            "pdf": pdf_base64,
            "logs": logs[-5000:],
            "duration_ms": duration_ms,
            "engine": body.engine,
        }
PYEOF
```

---

## 4. Gerar um API Secret

```bash
# Gerar uma chave secreta aleatoria
python3 -c "import secrets; print(secrets.token_hex(32))"
# Exemplo de output: a1b2c3d4e5f6...

# Anotar esse valor — sera usado no systemd E no Convex
```

---

## 5. Criar Servico systemd

```bash
sudo cat > /etc/systemd/system/latex-api.service << 'EOF'
[Unit]
Description=TexAI LaTeX Compilation API
After=network.target

[Service]
Type=simple
User=augustop
WorkingDirectory=/opt/latex-api
ExecStart=/opt/latex-api/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8787
Restart=always
RestartSec=5

# Seguranca
Environment=LATEX_API_SECRET=COLOCAR_SEU_SECRET_AQUI
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/opt/latex-api /tmp

[Install]
WantedBy=multi-user.target
EOF
```

**IMPORTANTE:** Substituir `COLOCAR_SEU_SECRET_AQUI` pelo secret gerado no passo 4.

```bash
# Ativar e iniciar
sudo systemctl daemon-reload
sudo systemctl enable latex-api
sudo systemctl start latex-api

# Verificar status
sudo systemctl status latex-api

# Ver logs
sudo journalctl -u latex-api -f

# Testar localmente
curl http://127.0.0.1:8787/health
```

---

## 6. Expor via Tailscale Funnel

O Tailscale Funnel expoe uma porta local para a internet publica com HTTPS automatico.

```bash
# Habilitar Funnel (porta 8787 → HTTPS publico)
tailscale funnel --bg 8787

# A URL publica sera algo como:
# https://omarchy.TAILNET-NAME.ts.net/
#
# O Tailscale exibe a URL exata no output do comando.

# Testar de qualquer lugar (internet publica):
curl https://omarchy.TAILNET-NAME.ts.net/health
# Deve retornar: {"status":"healthy","engine":"tectonic","version":"..."}
```

Se o Funnel nao estiver habilitado no seu tailnet, ative-o no admin console:
1. Acesse https://login.tailscale.com/admin/dns
2. Em "HTTPS Certificates" → habilitar
3. Em "Funnel" → habilitar para o node `omarchy`

---

## 7. Configurar Env Vars no Convex

No seu terminal local (na pasta do projeto):

```bash
# Substituir pela URL real do Tailscale Funnel (sem barra final)
npx convex env set LATEX_API_URL https://omarchy.TAILNET-NAME.ts.net

# Substituir pelo mesmo secret do passo 4
npx convex env set LATEX_API_SECRET seu-secret-gerado-no-passo-4
```

---

## 8. Testar Integracao Completa

1. Abrir o app em `localhost:3000`
2. Criar/abrir um projeto
3. Clicar em **Compilar** (ou Ctrl+S)
4. O status badge na toolbar deve mostrar "Compilando..." e depois "Compilado"
5. Trocar para modo **PDF** no viewer — deve exibir o PDF real

### Teste via curl (opcional)

```bash
# Gerar HMAC do source
SOURCE='\documentclass{article}\begin{document}Hello World\end{document}'
SECRET="seu-secret-aqui"
HMAC=$(echo -n "$SOURCE" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

# Chamar API
curl -X POST https://omarchy.TAILNET-NAME.ts.net/compile \
  -H "Content-Type: application/json" \
  -H "X-API-Secret: $HMAC" \
  -d "{\"source\": \"$SOURCE\", \"engine\": \"tectonic\"}"

# Deve retornar JSON com campo "pdf" (base64)
```

---

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| `tectonic: command not found` | Verificar se esta em `/usr/local/bin/` ou no PATH do systemd |
| Health check retorna 503 | `sudo systemctl status latex-api` — verificar se o servico esta rodando |
| HMAC 403 | Verificar se o secret no systemd E no Convex sao identicos |
| Timeout na compilacao | 1a compilacao do Tectonic baixa pacotes (~200MB). Fazer um compile de teste antes |
| Funnel nao funciona | Verificar HTTPS e Funnel habilitados no admin do Tailscale |
| PDF nao aparece no viewer | Verificar se `LATEX_API_URL` no Convex aponta para a URL correta do Funnel |
| Engine 'pdflatex' not found | pdflatex/xelatex/lualatex requerem TeX Live: `sudo apt install texlive-full` |

---

## Arquitetura

```
Browser (Next.js)
    |
    | useAction(api.latexNode.compile)
    v
Convex Cloud (action com "use node")
    |
    | POST /compile + HMAC auth
    v
Tailscale Funnel (HTTPS publico)
    |
    v
omarchy:8787 (FastAPI + Tectonic)
    |
    | PDF base64 response
    v
Convex Cloud (armazena no Storage)
    |
    | ctx.storage.getUrl()
    v
Browser (iframe PDF viewer)
```
