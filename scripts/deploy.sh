#!/bin/bash
# Gram Takip Otomatik Güncelleyici (Deployment Script)

REPO_PATH="/home/mustafa/.openclaw/workspace/gram-takip-repo"

echo "[$(date)] Güncelleme başlatılıyor..."
cd $REPO_PATH || exit

# GitHub'dan en güncel kodu çek
echo "Pull ediliyor..."
git pull origin claude/new-project-setup-1n4m7h

# Backend ve Frontend'i yeniden başlat
echo "Servisler yeniden başlatılıyor..."
sudo systemctl restart gram-takip-backend
sudo systemctl restart gram-takip-frontend

echo "[$(date)] Güncelleme başarıyla tamamlandı."
