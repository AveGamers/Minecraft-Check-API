#!/bin/bash

# Minecraft Check API - Ubuntu 24 Deployment Script
# Dieses Script installiert und konfiguriert die API als systemd Service

set -e

echo "🚀 Minecraft Check API - Ubuntu 24 Deployment"
echo "=============================================="

# Variablen
API_USER="www-data"
API_GROUP="www-data"
API_DIR="/opt/minecraft-check-api"
SERVICE_NAME="minecraft-check-api"
GITHUB_REPO="https://github.com/AveGamers/Minecraft-Check-API.git"

# Prüfen ob als root ausgeführt
if [ "$EUID" -ne 0 ]; then
    echo "❌ Bitte als root ausführen (sudo)"
    exit 1
fi

echo "📦 System-Updates und Dependencies installieren..."

# System aktualisieren
apt update && apt upgrade -y

# Node.js 18 LTS installieren (falls nicht vorhanden)
if ! command -v node &> /dev/null; then
    echo "📥 Node.js installieren..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo "✅ Node.js ist bereits installiert: $(node --version)"
fi

# Git installieren (falls nicht vorhanden)
if ! command -v git &> /dev/null; then
    echo "📥 Git installieren..."
    apt install -y git
else
    echo "✅ Git ist bereits installiert"
fi

# Weitere Dependencies
apt install -y curl wget unzip

echo "👤 User und Verzeichnis einrichten..."

# API Verzeichnis erstellen
mkdir -p $API_DIR

# Wenn das Verzeichnis bereits Code enthält, Backup erstellen
if [ -f "$API_DIR/package.json" ]; then
    echo "📁 Backup des existierenden Codes erstellen..."
    cp -r $API_DIR $API_DIR.backup.$(date +%Y%m%d_%H%M%S)
fi

echo "📥 API Code herunterladen..."

# Code klonen oder aktualisieren
if [ -d "$API_DIR/.git" ]; then
    echo "🔄 Existierendes Repository aktualisieren..."
    cd $API_DIR
    git pull origin main
else
    echo "📥 Repository klonen..."
    rm -rf $API_DIR/*
    git clone $GITHUB_REPO $API_DIR
fi

cd $API_DIR

echo "📦 NPM Dependencies installieren..."

# Dependencies installieren
npm ci --only=production

echo "⚙️ Konfiguration einrichten..."

# .env Datei für Production konfigurieren
cat > $API_DIR/.env << EOF
# Production Environment
NODE_ENV=production
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Server Settings
DEFAULT_TIMEOUT=5000
MAX_TIMEOUT=30000
EOF

echo "🔐 Berechtigungen setzen..."

# Eigentümer und Berechtigungen setzen
chown -R $API_USER:$API_GROUP $API_DIR
chmod -R 755 $API_DIR
chmod 644 $API_DIR/.env

echo "🔧 Systemd Service einrichten..."

# Service Datei kopieren
cp $API_DIR/deployment/minecraft-check-api.service /etc/systemd/system/

# Systemd neuladen
systemctl daemon-reload

# Service aktivieren und starten
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

echo "🔥 Firewall konfigurieren..."

# UFW installieren und konfigurieren (falls nicht vorhanden)
if ! command -v ufw &> /dev/null; then
    apt install -y ufw
fi

# Port 3000 öffnen
ufw allow 3000/tcp
ufw --force enable

echo "✅ Deployment abgeschlossen!"
echo ""
echo "📊 Service Status:"
systemctl status $SERVICE_NAME --no-pager -l

echo ""
echo "🌐 API Informationen:"
echo "   URL: http://$(curl -s ifconfig.me):3000"
echo "   Health Check: http://$(curl -s ifconfig.me):3000/api/health"
echo "   Dokumentation: http://$(curl -s ifconfig.me):3000/api/docs"
echo ""
echo "🔧 Nützliche Befehle:"
echo "   Service Status: sudo systemctl status $SERVICE_NAME"
echo "   Service Neustart: sudo systemctl restart $SERVICE_NAME"
echo "   Service Stoppen: sudo systemctl stop $SERVICE_NAME"
echo "   Logs anzeigen: sudo journalctl -u $SERVICE_NAME -f"
echo "   Logs der letzten Stunde: sudo journalctl -u $SERVICE_NAME --since '1 hour ago'"
echo ""
echo "🎉 Die Minecraft Check API läuft jetzt als Service und startet automatisch beim Systemstart!"

# Abschließender Test
echo "🧪 API Test..."
sleep 5
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ API ist erreichbar und funktioniert!"
else
    echo "⚠️  API Test fehlgeschlagen. Prüfen Sie die Logs: sudo journalctl -u $SERVICE_NAME"
fi