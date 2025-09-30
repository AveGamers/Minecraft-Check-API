# Minecraft Check API - Ubuntu 24 Deployment Guide

Komplette Anleitung zur Installation der Minecraft Check API als systemd Service auf Ubuntu 24.

## 🚀 Automatisches Deployment

### Schnellinstallation (Empfohlen)

```bash
# 1. Deployment Script herunterladen und ausführen
curl -fsSL https://raw.githubusercontent.com/AveGamers/Minecraft-Check-API/main/deployment/deploy-ubuntu.sh | sudo bash
```

Das Script führt automatisch alle notwendigen Schritte aus:
- Node.js Installation
- Code Download
- Service Konfiguration
- Firewall Setup
- Automatischer Start

## 🔧 Manuelle Installation

Falls Sie die Installation manuell durchführen möchten:

### 1. System vorbereiten

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 18 LTS installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs git curl

# Node.js Version prüfen
node --version
npm --version
```

### 2. API Code installieren

```bash
# Zielverzeichnis erstellen
sudo mkdir -p /opt/minecraft-check-api

# Code klonen
sudo git clone https://github.com/AveGamers/Minecraft-Check-API.git /opt/minecraft-check-api

# Dependencies installieren
cd /opt/minecraft-check-api
sudo npm ci --only=production
```

### 3. Umgebungsvariablen konfigurieren

```bash
# Production .env erstellen
sudo tee /opt/minecraft-check-api/.env > /dev/null << EOF
NODE_ENV=production
PORT=3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_TIMEOUT=5000
MAX_TIMEOUT=30000
EOF
```

### 4. Berechtigungen setzen

```bash
# Eigentümer setzen
sudo chown -R www-data:www-data /opt/minecraft-check-api
sudo chmod -R 755 /opt/minecraft-check-api
sudo chmod 644 /opt/minecraft-check-api/.env
```

### 5. Systemd Service einrichten

```bash
# Service Datei kopieren
sudo cp /opt/minecraft-check-api/deployment/minecraft-check-api.service /etc/systemd/system/

# Systemd neuladen
sudo systemctl daemon-reload

# Service aktivieren und starten
sudo systemctl enable minecraft-check-api
sudo systemctl start minecraft-check-api

# Status prüfen
sudo systemctl status minecraft-check-api
```

### 6. Firewall konfigurieren

```bash
# UFW aktivieren und Port öffnen
sudo ufw allow 3000/tcp
sudo ufw enable

# Status prüfen
sudo ufw status
```

## 🔍 Service Management

### Service Befehle

```bash
# Service Status prüfen
sudo systemctl status minecraft-check-api

# Service starten
sudo systemctl start minecraft-check-api

# Service stoppen
sudo systemctl stop minecraft-check-api

# Service neu starten
sudo systemctl restart minecraft-check-api

# Service neu laden (nach Konfigurationsänderungen)
sudo systemctl reload minecraft-check-api

# Service deaktivieren (kein Autostart)
sudo systemctl disable minecraft-check-api

# Service aktivieren (Autostart)
sudo systemctl enable minecraft-check-api
```

### Logs und Monitoring

```bash
# Live Logs anzeigen
sudo journalctl -u minecraft-check-api -f

# Logs der letzten Stunde
sudo journalctl -u minecraft-check-api --since '1 hour ago'

# Logs der letzten 100 Zeilen
sudo journalctl -u minecraft-check-api -n 100

# Alle Logs seit heute
sudo journalctl -u minecraft-check-api --since today

# Logs mit höherer Detailstufe
sudo journalctl -u minecraft-check-api -o verbose
```

## 🔧 Konfiguration anpassen

### Umgebungsvariablen ändern

```bash
# .env Datei bearbeiten
sudo nano /opt/minecraft-check-api/.env

# Service nach Änderungen neu starten
sudo systemctl restart minecraft-check-api
```

### Port ändern

```bash
# Port in .env ändern
echo "PORT=8080" | sudo tee -a /opt/minecraft-check-api/.env

# Firewall anpassen
sudo ufw allow 8080/tcp
sudo ufw delete allow 3000/tcp

# Service neu starten
sudo systemctl restart minecraft-check-api
```

## 🔄 Updates durchführen

### Automatisches Update Script

```bash
# Update Script erstellen
sudo tee /opt/minecraft-check-api/update.sh > /dev/null << 'EOF'
#!/bin/bash
cd /opt/minecraft-check-api
sudo git pull origin main
sudo npm ci --only=production
sudo systemctl restart minecraft-check-api
echo "Update abgeschlossen!"
EOF

# Script ausführbar machen
sudo chmod +x /opt/minecraft-check-api/update.sh

# Update durchführen
sudo /opt/minecraft-check-api/update.sh
```

### Manuelle Updates

```bash
# Service stoppen
sudo systemctl stop minecraft-check-api

# Code aktualisieren
cd /opt/minecraft-check-api
sudo git pull origin main

# Dependencies aktualisieren
sudo npm ci --only=production

# Berechtigungen korrigieren
sudo chown -R www-data:www-data /opt/minecraft-check-api

# Service wieder starten
sudo systemctl start minecraft-check-api
```

## 🛡️ Sicherheit

### SSL/HTTPS mit Nginx (Empfohlen)

```bash
# Nginx installieren
sudo apt install -y nginx

# Nginx Konfiguration erstellen
sudo tee /etc/nginx/sites-available/minecraft-api > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Rate Limiting auf Nginx Ebene
        limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
        limit_req zone=api burst=20 nodelay;
    }
}
EOF

# Site aktivieren
sudo ln -s /etc/nginx/sites-available/minecraft-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Certbot für SSL installieren
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Zusätzliche Sicherheitsmaßnahmen

```bash
# Fail2ban installieren (Schutz vor Brute-Force)
sudo apt install -y fail2ban

# UFW restriktiver konfigurieren
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 📊 Monitoring und Alerting

### Einfaches Health Check Script

```bash
# Health Check Script erstellen
sudo tee /opt/minecraft-check-api/health-check.sh > /dev/null << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:3000/api/health"

if curl -f -s $HEALTH_URL > /dev/null; then
    echo "$(date): API ist gesund"
    exit 0
else
    echo "$(date): API ist nicht erreichbar - Service wird neu gestartet"
    systemctl restart minecraft-check-api
    exit 1
fi
EOF

# Script ausführbar machen
sudo chmod +x /opt/minecraft-check-api/health-check.sh

# Cron Job für Health Check (alle 5 Minuten)
echo "*/5 * * * * /opt/minecraft-check-api/health-check.sh >> /var/log/minecraft-api-health.log 2>&1" | sudo crontab -
```

## 🧪 Testing

### API testen

```bash
# Health Check
curl http://localhost:3000/api/health

# Server Status testen
curl "http://localhost:3000/api/server/status?host=mc.hypixel.net&port=25565&type=java"

# Performance Test
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/health"
```

### Lasttest

```bash
# Apache Bench installieren
sudo apt install -y apache2-utils

# 1000 Requests mit 10 gleichzeitigen Verbindungen
ab -n 1000 -c 10 http://localhost:3000/api/health
```

## 🚨 Troubleshooting

### Häufige Probleme

**Service startet nicht:**
```bash
# Detaillierte Logs prüfen
sudo journalctl -u minecraft-check-api -n 50

# Node.js Pfad prüfen
which node

# Berechtigungen prüfen
ls -la /opt/minecraft-check-api/
```

**Port bereits belegt:**
```bash
# Prozess auf Port 3000 finden
sudo netstat -tlnp | grep :3000
sudo lsof -i :3000

# Prozess beenden
sudo kill -9 <PID>
```

**Hoher Speicherverbrauch:**
```bash
# Memory Limit in Service setzen
sudo systemctl edit minecraft-check-api

# Inhalt hinzufügen:
[Service]
MemoryLimit=512M
```

## 📞 Support

Bei Problemen:

1. **Logs prüfen:** `sudo journalctl -u minecraft-check-api -f`
2. **Service Status:** `sudo systemctl status minecraft-check-api`
3. **GitHub Issues:** [Repository Issues](https://github.com/AveGamers/Minecraft-Check-API/issues)
4. **Email:** support@avegamers.de

---

**Die API läuft jetzt als robuster systemd Service und startet automatisch beim Systemstart! 🎉**