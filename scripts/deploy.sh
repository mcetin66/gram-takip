#!/bin/bash
# Gram Takip — VPS deploy scripti
# 1) GitHub'dan pull  2) Backend bağımlılıkları  3) Frontend build  4) Servis restart

set -e

REPO_PATH="${REPO_PATH:-/home/mustafa/.openclaw/workspace/gram-takip-repo}"
BRANCH="${BRANCH:-claude/new-project-setup-1n4m7h}"

echo "[$(date '+%F %T')] Deploy başladı"
cd "$REPO_PATH"

echo "→ git pull ($BRANCH)"
git pull origin "$BRANCH"

echo "→ backend bağımlılıkları (kök package.json)"
npm install --no-audit --no-fund

echo "→ frontend build (app/)"
cd app
npm install --no-audit --no-fund
npm run build
cd ..

echo "→ servisleri yeniden başlat"
sudo systemctl restart gram-takip-backend
sudo systemctl restart gram-takip-frontend || true

echo "[$(date '+%F %T')] Deploy tamamlandı ✔"
