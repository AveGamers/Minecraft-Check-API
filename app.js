require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import Routes und Middleware
const serverRoutes = require('./src/routes/server');
const { 
    generalRateLimit, 
    batchRateLimit, 
    pingRateLimit, 
    globalRateLimit 
} = require('./src/middleware/rateLimiting');
const { 
    notFoundHandler, 
    errorHandler, 
    requestLogger, 
    healthCheck 
} = require('./src/middleware/errorHandling');

const app = express();
const PORT = process.env.PORT || 3000;

// Sicherheits-Middleware
app.use(helmet());
app.use(cors());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
    app.use(requestLogger);
}

// Globales Rate Limiting
app.use(globalRateLimit);

// Health Check Route
app.get('/api/health', healthCheck);

// API Documentation Route
app.get('/api/docs', (req, res) => {
    res.json({
        success: true,
        api: {
            name: 'Minecraft Check API',
            version: '1.0.0',
            description: 'API zum Abfragen von Minecraft Server Status und Informationen'
        },
        endpoints: {
            'GET /api/health': 'API Health Check',
            'GET /api/docs': 'API Dokumentation',
            'GET /api/server/status': 'Server Status abfragen (Query Parameters)',
            'POST /api/server/status': 'Server Status abfragen (Body Parameters)',
            'POST /api/server/batch': 'Mehrere Server gleichzeitig abfragen',
            'GET /api/server/ping': 'Vereinfachter Ping Check'
        },
        parameters: {
            host: 'Server hostname oder IP (erforderlich)',
            port: 'Server port (erforderlich, 1-65535)',
            type: 'Server typ: "java" oder "bedrock" (erforderlich)',
            timeout: 'Timeout in Millisekunden (optional, 1000-30000)'
        },
        examples: {
            java: 'GET /api/server/status?host=mc.hypixel.net&port=25565&type=java',
            bedrock: 'GET /api/server/status?host=play.cubecraft.net&port=19132&type=bedrock'
        },
        rateLimits: {
            general: '100 requests per minute',
            batch: '10 requests per minute',
            ping: '200 requests per minute',
            global: '500 requests per minute'
        },
        timestamp: new Date().toISOString()
    });
});

// API Routes mit spezifischen Rate Limits
app.use('/api/server/batch', batchRateLimit);
app.use('/api/server/ping', pingRateLimit);
app.use('/api/server', generalRateLimit, serverRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Server starten
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Minecraft Check API läuft auf Port ${PORT}`);
        console.log(`📚 Dokumentation: http://localhost:${PORT}/api/docs`);
        console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM empfangen. Graceful Shutdown...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT empfangen. Graceful Shutdown...');
    process.exit(0);
});

module.exports = app;