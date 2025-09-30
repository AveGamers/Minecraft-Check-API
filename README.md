# Minecraft Check API

Eine leistungsstarke REST API zum Abfragen von Minecraft Server Status und Informationen. Unterstützt sowohl Java Edition als auch Bedrock Edition Server.

## 🚀 Schnellstart

```bash
# Dependencies installieren
npm install

# Server starten
npm start

# API testen
curl "http://localhost:3000/api/server/status?host=mc.hypixel.net&port=25565&type=java"
```

## ✨ Features

- ✅ **Java & Bedrock Edition** - Vollständige Unterstützung für beide Minecraft Editionen
- ✅ **Umfassende Server-Informationen** - Status, Ping, Spieleranzahl, MOTD, Version
- ✅ **Rate Limiting** - Schutz vor API-Missbrauch mit verschiedenen Limits
- ✅ **Batch Queries** - Bis zu 10 Server gleichzeitig abfragen
- ✅ **Error Handling** - Robuste Fehlerbehandlung und aussagekräftige Fehlermeldungen
- ✅ **Health Monitoring** - Built-in Health Check und API-Status
- ✅ **CORS & Sicherheit** - Sichere API mit Helmet.js und CORS-Support

## 📖 API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/server/status` | GET/POST | Vollständiger Server Status |
| `/api/server/batch` | POST | Mehrere Server gleichzeitig |
| `/api/server/ping` | GET | Schneller Ping Check |
| `/api/health` | GET | API Health Check |
| `/api/docs` | GET | API Dokumentation |

## 📚 Dokumentation

Die vollständige API-Dokumentation finden Sie in der Datei [`API-DOKUMENTATION.md`](./API-DOKUMENTATION.md).

Alternativ können Sie die interaktive Dokumentation unter `http://localhost:3000/api/docs` aufrufen, wenn die API läuft.

## 🔧 Installation & Setup

### Voraussetzungen
- Node.js 16.0 oder höher
- npm oder yarn

### Lokale Entwicklung

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
# .env Datei existiert bereits mit Standard-Werten
# Bei Bedarf anpassen
```

4. **Server starten:**
```bash
# Entwicklung (mit nodemon)
npm run dev

# Produktion
npm start
```

5. **API testen:**
```bash
# Health Check
curl http://localhost:3000/api/health

# Java Server Status
curl "http://localhost:3000/api/server/status?host=mc.hypixel.net&port=25565&type=java"

# Bedrock Server Status
curl "http://localhost:3000/api/server/status?host=play.cubecraft.net&port=19132&type=bedrock"
```

## 🌐 Beispiel-Requests

### Java Edition Server
```bash
curl "http://localhost:3000/api/server/status?host=mc.hypixel.net&port=25565&type=java"
```

### Bedrock Edition Server
```bash
curl "http://localhost:3000/api/server/status?host=play.cubecraft.net&port=19132&type=bedrock"
```

### Batch Request
```bash
curl -X POST http://localhost:3000/api/server/batch \
  -H "Content-Type: application/json" \
  -d '{
    "servers": [
      {"host": "mc.hypixel.net", "port": 25565, "type": "java"},
      {"host": "play.cubecraft.net", "port": 19132, "type": "bedrock"}
    ]
  }'
```

## ⚡ Rate Limits

| Endpoint | Limit | Zeitfenster |
|----------|-------|-------------|
| Allgemein | 100 Requests | 1 Minute |
| Batch Queries | 10 Requests | 1 Minute |
| Ping Checks | 200 Requests | 1 Minute |

## 🔒 Sicherheit

- **Helmet.js** - Sichere HTTP Headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Schutz vor DDoS und Missbrauch
- **Input Validation** - Validierung aller Parameter
- **Error Handling** - Keine sensitiven Daten in Fehlermeldungen

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### PM2 (Empfohlen für Produktion)
```bash
npm install -g pm2
pm2 start app.js --name minecraft-api
pm2 startup
pm2 save
```

## 📁 Projektstruktur

```
Minecraft-Check-API/
├── src/
│   ├── routes/
│   │   └── server.js          # API Endpoints
│   ├── utils/
│   │   └── minecraftQuery.js  # Server Query Logic
│   └── middleware/
│       ├── rateLimiting.js    # Rate Limiting
│       └── errorHandling.js   # Error Handling
├── app.js                     # Express App
├── package.json
├── .env                       # Umgebungsvariablen
├── README.md                  # Diese Datei
└── API-DOKUMENTATION.md       # Vollständige API Docs
```

## 🤝 Beitragen

Wir freuen uns über Beiträge! Bitte:

1. Forken Sie das Repository
2. Erstellen Sie einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushen Sie zum Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert - siehe die [LICENSE.md](LICENSE.md) Datei für Details.

## 👥 Autoren

- **AveGamers** - *Initial work* - [AveGamers](https://github.com/AveGamers)

## 🙏 Danksagungen

- [minecraft-server-util](https://www.npmjs.com/package/minecraft-server-util) - Minecraft Server Query Library
- [Express.js](https://expressjs.com/) - Web Framework
- Alle Mitwirkenden und Tester

## 📞 Support

- GitHub Issues: [Issues](https://github.com/AveGamers/Minecraft-Check-API/issues)
- Email: support@avegamers.de
- Discord: AveGamers Discord Server

---

**Entwickelt mit ❤️ von AveGamers** 🎮
