#!/bin/bash
# Deploy script for TexAI LaTeX Compilation API
# Run from project root: bash server/deploy.sh
#
# Prerequisites:
#   - SSH access to augustop@omarchy
#   - texlive-latex-base installed on server

set -e

SERVER="augustop@omarchy"
REMOTE_DIR="/home/augustop/latex-api"

echo "=== Deploying LaTeX API to $SERVER ==="

# 1. Copy main.py
echo "[1/3] Copying main.py..."
scp server/main.py "$SERVER:$REMOTE_DIR/main.py"

# 2. Copy service file (requires sudo to install)
echo "[2/3] Copying service file..."
scp server/latex-api.service "$SERVER:$REMOTE_DIR/latex-api.service"

# 3. Restart service
echo "[3/3] Restarting service..."
ssh "$SERVER" "sudo systemctl restart latex-api && sleep 2 && curl -s http://127.0.0.1:8787/health"

echo ""
echo "=== Deploy complete ==="
