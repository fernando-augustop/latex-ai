"""
TexAI LaTeX Compilation API v2
- pdflatex-fast engine with .fmt precompilation (2-3x faster incremental compiles)
- Tectonic fallback for XeTeX-dependent documents
- Persistent workdirs per document_id for aux/toc reuse

Deploy: copy to ~/latex-api/main.py on the server, then restart the service.
Prerequisites: sudo apt install texlive-latex-base texlive-latex-extra texlive-fonts-recommended
"""

import hashlib
import hmac
import os
import base64
import subprocess
import tempfile
import time
import shutil
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI(title="TexAI LaTeX Compilation API")

API_SECRET = os.environ.get("LATEX_API_SECRET", "")
MAX_SOURCE_SIZE = 500 * 1024  # 500KB
COMPILE_TIMEOUT = 30  # seconds

# Directories for caching
CACHE_DIR = Path.home() / "latex-cache"
FORMAT_DIR = CACHE_DIR / "formats"
WORKDIR_BASE = CACHE_DIR / "workdirs"

# Ensure directories exist
FORMAT_DIR.mkdir(parents=True, exist_ok=True)
WORKDIR_BASE.mkdir(parents=True, exist_ok=True)


class CompileRequest(BaseModel):
    source: str
    engine: str = "tectonic"
    document_id: str | None = None


def verify_hmac(source: str, provided_hmac: str) -> bool:
    """Verify HMAC-SHA256 of the source."""
    if not API_SECRET:
        return False
    expected = hmac.new(
        API_SECRET.encode(), source.encode(), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, provided_hmac)


def extract_preamble(source: str) -> tuple[str, str] | None:
    """Split source into (preamble, body) at \\begin{document}.
    Returns None if \\begin{document} is not found."""
    marker = r"\begin{document}"
    idx = source.find(marker)
    if idx == -1:
        return None
    preamble = source[:idx]
    body = source[idx:]
    return preamble, body


def get_preamble_hash(preamble: str) -> str:
    """Return first 16 chars of SHA-256 hash of the preamble."""
    return hashlib.sha256(preamble.encode()).hexdigest()[:16]


def ensure_format_file(preamble: str, preamble_hash: str) -> Path | None:
    """Create .fmt file from preamble if it doesn't exist.
    Returns path to .fmt file, or None on failure."""
    fmt_path = FORMAT_DIR / f"{preamble_hash}.fmt"

    if fmt_path.exists():
        return fmt_path

    # Create the format file
    with tempfile.TemporaryDirectory(prefix="texai-fmt-") as tmpdir:
        tmpdir = Path(tmpdir)
        preamble_file = tmpdir / "preamble.tex"

        # Write preamble with \dump at the end
        preamble_content = preamble.rstrip() + "\n\\dump\n"
        preamble_file.write_text(preamble_content, encoding="utf-8")

        cmd = [
            "pdflatex",
            "-ini",
            f"-jobname={preamble_hash}",
            "&pdflatex",
            str(preamble_file),
        ]

        env = os.environ.copy()
        env["TEXFORMATS"] = f"{FORMAT_DIR}:"

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=COMPILE_TIMEOUT,
                cwd=str(tmpdir),
                env=env,
            )

            # The .fmt file is created in the working directory
            generated_fmt = tmpdir / f"{preamble_hash}.fmt"
            if generated_fmt.exists():
                shutil.move(str(generated_fmt), str(fmt_path))
                return fmt_path
            else:
                print(f"[fmt] Failed to create .fmt: {result.stderr[-500:]}")
                return None
        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            print(f"[fmt] Error creating .fmt: {e}")
            return None


def compile_with_format(
    source: str, preamble_hash: str, document_id: str | None, timeout: int
) -> dict:
    """Compile using precompiled format file. Returns result dict."""
    # Use persistent workdir if document_id provided
    if document_id:
        workdir = WORKDIR_BASE / document_id
        workdir.mkdir(parents=True, exist_ok=True)
        cleanup = False
    else:
        workdir = Path(tempfile.mkdtemp(prefix="texai-"))
        cleanup = True

    try:
        tex_path = workdir / "document.tex"
        pdf_path = workdir / "document.pdf"

        tex_path.write_text(source, encoding="utf-8")

        env = os.environ.copy()
        env["TEXFORMATS"] = f"{FORMAT_DIR}:"

        cmd = [
            "pdflatex",
            f"-fmt={preamble_hash}",
            "-interaction=nonstopmode",
            "-output-directory",
            str(workdir),
            str(tex_path),
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(workdir),
            env=env,
        )

        logs = (result.stdout + "\n" + result.stderr)[-5000:]

        if pdf_path.exists():
            pdf_bytes = pdf_path.read_bytes()
            return {
                "success": True,
                "pdf_bytes": pdf_bytes,
                "logs": logs,
            }
        else:
            return {
                "success": False,
                "logs": logs,
                "error": "pdflatex-fast: no PDF generated",
            }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "logs": "",
            "error": f"Compilation timed out after {timeout}s",
        }
    finally:
        if cleanup:
            shutil.rmtree(workdir, ignore_errors=True)


def compile_tectonic(
    source: str, document_id: str | None, timeout: int
) -> dict:
    """Compile using Tectonic engine. Returns result dict."""
    if document_id:
        workdir = WORKDIR_BASE / document_id
        workdir.mkdir(parents=True, exist_ok=True)
        cleanup = False
    else:
        workdir = Path(tempfile.mkdtemp(prefix="texai-"))
        cleanup = True

    try:
        tex_path = workdir / "document.tex"
        pdf_path = workdir / "document.pdf"

        tex_path.write_text(source, encoding="utf-8")

        cmd = [
            "tectonic",
            "-X", "compile",
            "--outdir", str(workdir),
            str(tex_path),
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(workdir),
        )

        logs = (result.stdout + "\n" + result.stderr)[-5000:]

        if pdf_path.exists():
            pdf_bytes = pdf_path.read_bytes()
            return {
                "success": True,
                "pdf_bytes": pdf_bytes,
                "logs": logs,
            }
        else:
            return {
                "success": False,
                "logs": logs,
                "error": "Tectonic: no PDF generated",
            }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "logs": "",
            "error": f"Compilation timed out after {timeout}s",
        }
    except FileNotFoundError:
        return {
            "success": False,
            "logs": "",
            "error": "tectonic not found on server",
        }
    finally:
        if cleanup:
            shutil.rmtree(workdir, ignore_errors=True)


@app.get("/health")
async def health():
    """Health check endpoint."""
    engines = {}

    # Check tectonic
    try:
        result = subprocess.run(
            ["tectonic", "--version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        engines["tectonic"] = result.stdout.strip()
    except Exception:
        engines["tectonic"] = "not available"

    # Check pdflatex
    try:
        result = subprocess.run(
            ["pdflatex", "--version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        version_line = result.stdout.split("\n")[0] if result.stdout else "unknown"
        engines["pdflatex"] = version_line
    except Exception:
        engines["pdflatex"] = "not available"

    # Count cached format files
    fmt_count = len(list(FORMAT_DIR.glob("*.fmt")))

    return {
        "status": "healthy",
        "engines": engines,
        "cached_formats": fmt_count,
    }


@app.post("/compile")
async def compile(request: Request, body: CompileRequest):
    """Compile LaTeX source and return PDF as base64."""

    # 1. Verify HMAC
    api_secret_header = request.headers.get("X-API-Secret", "")
    if not verify_hmac(body.source, api_secret_header):
        raise HTTPException(status_code=403, detail="Invalid API secret")

    # 2. Check size
    if len(body.source.encode()) > MAX_SOURCE_SIZE:
        raise HTTPException(
            status_code=413, detail=f"Source exceeds {MAX_SOURCE_SIZE} bytes"
        )

    # 3. Validate engine
    allowed_engines = {"tectonic", "pdflatex", "pdflatex-fast", "xelatex", "lualatex"}
    if body.engine not in allowed_engines:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid engine. Allowed: {', '.join(allowed_engines)}",
        )

    start_time = time.time()

    # 4. Route to appropriate engine
    if body.engine == "pdflatex-fast":
        # Try pdflatex with format file precompilation
        parts = extract_preamble(body.source)
        if parts is None:
            # No \begin{document} found — fall back to tectonic
            compile_result = compile_tectonic(
                body.source, body.document_id, COMPILE_TIMEOUT
            )
        else:
            preamble, _ = parts
            preamble_hash = get_preamble_hash(preamble)

            # Ensure format file exists (creates on first use)
            fmt_path = ensure_format_file(preamble, preamble_hash)

            if fmt_path:
                compile_result = compile_with_format(
                    body.source, preamble_hash, body.document_id, COMPILE_TIMEOUT
                )
                # If pdflatex-fast fails, fallback to tectonic
                if not compile_result["success"]:
                    print("[compile] pdflatex-fast failed, falling back to tectonic")
                    compile_result = compile_tectonic(
                        body.source, body.document_id, COMPILE_TIMEOUT
                    )
            else:
                # .fmt creation failed — fallback to tectonic
                print("[compile] .fmt creation failed, falling back to tectonic")
                compile_result = compile_tectonic(
                    body.source, body.document_id, COMPILE_TIMEOUT
                )

    elif body.engine == "tectonic":
        compile_result = compile_tectonic(
            body.source, body.document_id, COMPILE_TIMEOUT
        )

    else:
        # pdflatex, xelatex, lualatex (standard, no .fmt)
        if body.document_id:
            workdir = WORKDIR_BASE / body.document_id
            workdir.mkdir(parents=True, exist_ok=True)
        else:
            workdir = Path(tempfile.mkdtemp(prefix="texai-"))

        tex_path = workdir / "document.tex"
        pdf_path = workdir / "document.pdf"
        tex_path.write_text(body.source, encoding="utf-8")

        cmd = [
            body.engine,
            "-interaction=nonstopmode",
            "-output-directory", str(workdir),
            str(tex_path),
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=COMPILE_TIMEOUT,
                cwd=str(workdir),
            )
            logs = (result.stdout + "\n" + result.stderr)[-5000:]

            if pdf_path.exists():
                compile_result = {
                    "success": True,
                    "pdf_bytes": pdf_path.read_bytes(),
                    "logs": logs,
                }
            else:
                compile_result = {
                    "success": False,
                    "logs": logs,
                    "error": f"{body.engine}: no PDF generated",
                }
        except subprocess.TimeoutExpired:
            compile_result = {
                "success": False,
                "logs": "",
                "error": f"Compilation timed out after {COMPILE_TIMEOUT}s",
            }
        except FileNotFoundError:
            compile_result = {
                "success": False,
                "logs": "",
                "error": f"Engine '{body.engine}' not found on server",
            }

    duration_ms = int((time.time() - start_time) * 1000)

    # 5. Return result
    if not compile_result["success"]:
        return JSONResponse(
            status_code=422,
            content={
                "error": compile_result.get("error", "Compilation failed"),
                "logs": compile_result.get("logs", ""),
                "duration_ms": duration_ms,
            },
        )

    pdf_base64 = base64.b64encode(compile_result["pdf_bytes"]).decode("ascii")

    return {
        "pdf": pdf_base64,
        "logs": compile_result.get("logs", ""),
        "duration_ms": duration_ms,
        "engine": body.engine,
    }
