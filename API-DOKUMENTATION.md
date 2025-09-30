# Minecraft Check API - Dokumentation

Eine REST API zum Abfragen von Minecraft Server Status und Informationen für sowohl Java als auch Bedrock Edition Server.

## 📋 Inhaltsverzeichnis

- [Features](#features)
- [Installation](#installation)
- [Schnellstart](#schnellstart)
- [API Endpoints](#api-endpoints)
- [Rate Limiting](#rate-limiting)
- [Fehlerbehandlung](#fehlerbehandlung)
- [Beispiele](#beispiele)
- [Umgebungsvariablen](#umgebungsvariablen)

## ✨ Features

- ✅ **Java Edition Server** - Vollständige Unterstützung für Minecraft Java Edition
- ✅ **Bedrock Edition Server** - Vollständige Unterstützung für Minecraft Bedrock Edition
- ✅ **Umfassende Informationen** - Status, Ping, Spieleranzahl, MOTD, Version und mehr
- ✅ **Rate Limiting** - Schutz vor API-Missbrauch
- ✅ **Batch Queries** - Mehrere Server gleichzeitig abfragen
- ✅ **Error Handling** - Umfassende Fehlerbehandlung
- ✅ **Health Monitoring** - API Health Check Endpoint
- ✅ **CORS Support** - Cross-Origin Resource Sharing

## 🚀 Installation

### Voraussetzungen
- Node.js 16.0 oder höher
- npm oder yarn

### Setup

1. **Repository klonen:**
```bash
git clone https://github.com/AveGamers/Minecraft-Check-API.git
cd Minecraft-Check-API
```

2. **Dependencies installieren:**
```bash
npm install
```

3. **Umgebungsvariablen konfigurieren:**
```bash
cp .env.example .env
# .env Datei nach Bedarf anpassen
```

4. **Server starten:**
```bash
# Entwicklung
npm run dev

# Produktion
npm start
```

## 🏃‍♂️ Schnellstart

```bash
# Server starten
npm start

# API testen
curl "http://localhost:3000/api/server/status?host=mc.hypixel.net&port=25565&type=java"
```

## 🔗 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### 1. Server Status abfragen

#### GET `/server/status`

Fragt den vollständigen Status eines Minecraft Servers ab.

**Query Parameter:**
- `host` (required) - Server hostname oder IP-Adresse
- `port` (required) - Server port (1-65535)
- `type` (required) - Server-Typ: `java` oder `bedrock`
- `timeout` (optional) - Timeout in Millisekunden (1000-30000, Standard: 5000)

**Beispiel Anfrage:**
```bash
GET /api/server/status?host=mc.hypixel.net&port=25565&type=java&timeout=10000
```

**Antwort (Java Server):**
```json
{
  "success": true,
  "data": {
    "online": true,
    "ping": 45,
    "players": {
      "online": 42847,
      "max": 200000,
      "sample": [
        { "name": "Player1", "id": "uuid-here" }
      ]
    },
    "version": "1.20.1",
    "motd": "Hypixel Network [1.8-1.20]",
    "favicon": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
    "host": "mc.hypixel.net",
    "port": 25565,
    "type": "java",
    "metadata": {
      "queryTime": 156,
      "timestamp": "2025-09-30T10:30:00.000Z",
      "api": {
        "name": "Minecraft Check API",
        "version": "1.0.0"
      }
    }
  }
}
```

**Antwort (Bedrock Server):**
```json
{
  "success": true,
  "data": {
    "online": true,
    "ping": 32,
    "players": {
      "online": 1543,
      "max": 50000
    },
    "version": "1.20.30",
    "motd": "CubeCraft Games",
    "gamemode": "Survival",
    "serverId": "12345678",
    "host": "play.cubecraft.net",
    "port": 19132,
    "type": "bedrock",
    "metadata": {
      "queryTime": 89,
      "timestamp": "2025-09-30T10:30:00.000Z",
      "api": {
        "name": "Minecraft Check API",
        "version": "1.0.0"
      }
    }
  }
}
```

#### POST `/server/status`

Alternative zum GET Request mit Body-Parametern.

**Request Body:**
```json
{
  "host": "mc.hypixel.net",
  "port": 25565,
  "type": "java",
  "timeout": 5000
}
```

### 2. Mehrere Server abfragen

#### POST `/server/batch`

Fragt bis zu 10 Server gleichzeitig ab.

**Request Body:**
```json
{
  "servers": [
    { "host": "mc.hypixel.net", "port": 25565, "type": "java" },
    { "host": "play.cubecraft.net", "port": 19132, "type": "bedrock" },
    { "host": "mc.mineplex.com", "port": 25565, "type": "java", "timeout": 10000 }
  ]
}
```

**Antwort:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "results": [
      {
        "index": 0,
        "success": true,
        "data": { /* Server Status Daten */ }
      },
      {
        "index": 1,
        "success": false,
        "error": "Server nicht erreichbar",
        "server": { "host": "offline.server.com", "port": 25565, "type": "java" }
      }
    ],
    "timestamp": "2025-09-30T10:30:00.000Z"
  }
}
```

### 3. Ping Check

#### GET `/server/ping`

Vereinfachter Endpoint nur für Online-Status und Ping.

**Query Parameter:**
- `host` (required) - Server hostname oder IP
- `port` (required) - Server port
- `type` (required) - `java` oder `bedrock`
- `timeout` (optional) - Timeout in Millisekunden

**Beispiel:**
```bash
GET /api/server/ping?host=mc.hypixel.net&port=25565&type=java
```

**Antwort:**
```json
{
  "success": true,
  "data": {
    "host": "mc.hypixel.net",
    "port": 25565,
    "type": "java",
    "online": true,
    "ping": 45,
    "timestamp": "2025-09-30T10:30:00.000Z"
  }
}
```

### 4. Health Check

#### GET `/health`

API Health Check und Systemstatus.

**Antwort:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-09-30T10:30:00.000Z",
  "uptime": {
    "seconds": 3661,
    "human": "1h 1m 1s"
  },
  "memory": {
    "used": "45 MB",
    "total": "87 MB",
    "external": "12 MB"
  },
  "environment": "production",
  "nodeVersion": "v18.17.0",
  "api": {
    "name": "Minecraft Check API",
    "version": "1.0.0"
  }
}
```

### 5. API Dokumentation

#### GET `/docs`

Interaktive API-Dokumentation mit allen verfügbaren Endpoints.

## ⚡ Rate Limiting

Die API implementiert verschiedene Rate Limits zum Schutz vor Missbrauch:

| Endpoint | Limit | Zeitfenster |
|----------|-------|-------------|
| Allgemein | 100 Requests | 1 Minute |
| Batch Queries | 10 Requests | 1 Minute |
| Ping Checks | 200 Requests | 1 Minute |
| Global | 500 Requests | 1 Minute |

**Rate Limit Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1696073400
```

**Rate Limit Überschritten (429):**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut.",
  "retryAfter": 45,
  "limit": 100,
  "remaining": 0,
  "resetTime": "2025-09-30T10:31:00.000Z"
}
```

## 🚨 Fehlerbehandlung

### HTTP Status Codes

| Code | Bedeutung |
|------|-----------|
| 200 | Erfolgreiche Anfrage |
| 400 | Ungültige Parameter |
| 404 | Endpoint nicht gefunden |
| 408 | Request Timeout |
| 429 | Rate Limit überschritten |
| 500 | Server Fehler |
| 503 | Service nicht verfügbar |

### Fehler-Response Format

```json
{
  "success": false,
  "error": "Fehler Typ",
  "message": "Detaillierte Fehlerbeschreibung",
  "timestamp": "2025-09-30T10:30:00.000Z"
}
```

### Häufige Fehler

**Ungültige Parameter (400):**
```json
{
  "success": false,
  "error": "Parameter \"host\" ist erforderlich",
  "example": "/api/server/status?host=mc.hypixel.net&port=25565&type=java"
}
```

**Server nicht erreichbar (503):**
```json
{
  "success": false,
  "error": "Server nicht erreichbar",
  "message": "Der angegebene Minecraft Server ist nicht erreichbar.",
  "timestamp": "2025-09-30T10:30:00.000Z"
}
```

## 💡 Beispiele

### JavaScript (Fetch)

```javascript
// Einzelnen Server abfragen
async function getServerStatus(host, port, type) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/server/status?host=${host}&port=${port}&type=${type}`
    );
    const data = await response.json();
    
    if (data.success) {
      console.log('Server Online:', data.data.online);
      console.log('Spieler:', data.data.players?.online);
    } else {
      console.error('Fehler:', data.error);
    }
  } catch (error) {
    console.error('Request Fehler:', error);
  }
}

// Mehrere Server abfragen
async function getBatchStatus(servers) {
  try {
    const response = await fetch('http://localhost:3000/api/server/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ servers })
    });
    
    const data = await response.json();
    console.log('Batch Results:', data.data.results);
  } catch (error) {
    console.error('Batch Request Fehler:', error);
  }
}

// Verwendung
getServerStatus('mc.hypixel.net', 25565, 'java');
getBatchStatus([
  { host: 'mc.hypixel.net', port: 25565, type: 'java' },
  { host: 'play.cubecraft.net', port: 19132, type: 'bedrock' }
]);
```

### Python (requests)

```python
import requests

def get_server_status(host, port, server_type):
    url = f"http://localhost:3000/api/server/status"
    params = {
        'host': host,
        'port': port,
        'type': server_type
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['success']:
            print(f"Server Online: {data['data']['online']}")
            if data['data']['online']:
                print(f"Spieler: {data['data']['players']['online']}")
        else:
            print(f"Fehler: {data['error']}")
            
    except requests.RequestException as e:
        print(f"Request Fehler: {e}")

def get_batch_status(servers):
    url = "http://localhost:3000/api/server/batch"
    payload = {'servers': servers}
    
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        
        for result in data['data']['results']:
            if result['success']:
                server_data = result['data']
                print(f"{server_data['host']}:{server_data['port']} - Online: {server_data['online']}")
            else:
                print(f"Server Fehler: {result['error']}")
                
    except requests.RequestException as e:
        print(f"Batch Request Fehler: {e}")

# Verwendung
get_server_status('mc.hypixel.net', 25565, 'java')
get_batch_status([
    {'host': 'mc.hypixel.net', 'port': 25565, 'type': 'java'},
    {'host': 'play.cubecraft.net', 'port': 19132, 'type': 'bedrock'}
])
```

### cURL

```bash
# Einzelnen Server abfragen
curl "http://localhost:3000/api/server/status?host=mc.hypixel.net&port=25565&type=java"

# POST Request
curl -X POST "http://localhost:3000/api/server/status" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "mc.hypixel.net",
    "port": 25565,
    "type": "java",
    "timeout": 10000
  }'

# Batch Request
curl -X POST "http://localhost:3000/api/server/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "servers": [
      {"host": "mc.hypixel.net", "port": 25565, "type": "java"},
      {"host": "play.cubecraft.net", "port": 19132, "type": "bedrock"}
    ]
  }'

# Ping Check
curl "http://localhost:3000/api/server/ping?host=mc.hypixel.net&port=25565&type=java"

# Health Check
curl "http://localhost:3000/api/health"
```

## ⚙️ Umgebungsvariablen

Erstellen Sie eine `.env` Datei im Projekt-Root:

```env
# Server Konfiguration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Server Settings
DEFAULT_TIMEOUT=5000
MAX_TIMEOUT=30000
```

### Verfügbare Variablen

| Variable | Standard | Beschreibung |
|----------|----------|--------------|
| `PORT` | 3000 | Server Port |
| `NODE_ENV` | development | Umgebung (development/production) |
| `RATE_LIMIT_WINDOW_MS` | 60000 | Rate Limit Zeitfenster (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max Requests pro Zeitfenster |
| `DEFAULT_TIMEOUT` | 5000 | Standard Timeout (ms) |
| `MAX_TIMEOUT` | 30000 | Maximaler Timeout (ms) |

## 🔒 Sicherheit

- **Helmet.js** - Setzt sichere HTTP Headers
- **CORS** - Cross-Origin Resource Sharing Konfiguration
- **Rate Limiting** - Schutz vor DDoS und API-Missbrauch
- **Input Validation** - Validierung aller Eingabeparameter
- **Error Handling** - Keine sensitiven Informationen in Fehlermeldungen

## 🚀 Deployment

### Production Setup

1. **Environment setzen:**
```bash
export NODE_ENV=production
```

2. **PM2 (empfohlen):**
```bash
npm install -g pm2
pm2 start app.js --name minecraft-api
pm2 startup
pm2 save
```

3. **Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📊 Monitoring

Die API bietet verschiedene Monitoring-Features:

- **Health Check Endpoint** - `/api/health`
- **Request Logging** - Alle Requests werden geloggt
- **Error Tracking** - Detaillierte Fehlerprotokollierung
- **Performance Metrics** - Query-Zeit und Uptime

## 🤝 Support

- **GitHub Issues** - Für Bugs und Feature Requests
- **Email** - support@avegamers.de
- **Discord** - AveGamers Discord Server

## 📄 Lizenz

Diese API ist unter der MIT Lizenz veröffentlicht. Siehe `LICENSE.md` für Details.

---

**Entwickelt von AveGamers** 🎮