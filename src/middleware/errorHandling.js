/**
 * Globales Error Handling Middleware
 */

// 404 Handler für nicht gefundene Routen
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint nicht gefunden',
        message: `Die Route ${req.method} ${req.originalUrl} existiert nicht.`,
        availableEndpoints: [
            'GET /api/server/status',
            'POST /api/server/status',
            'POST /api/server/batch',
            'GET /api/server/ping',
            'GET /api/health',
            'GET /api/docs'
        ],
        timestamp: new Date().toISOString()
    });
};

// Globaler Error Handler
const errorHandler = (error, req, res, next) => {
    console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Verschiedene Error-Typen behandeln
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validierungsfehler',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    if (error.name === 'TimeoutError') {
        return res.status(408).json({
            success: false,
            error: 'Request Timeout',
            message: 'Die Anfrage hat zu lange gedauert.',
            timestamp: new Date().toISOString()
        });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            error: 'Server nicht erreichbar',
            message: 'Der angegebene Minecraft Server ist nicht erreichbar.',
            timestamp: new Date().toISOString()
        });
    }

    // Standard Server Error
    res.status(500).json({
        success: false,
        error: 'Interner Server Fehler',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Ein unerwarteter Fehler ist aufgetreten.',
        timestamp: new Date().toISOString()
    });
};

// Request Logger Middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Log Request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}`);
    
    // Log Response
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
};

// Health Check Middleware
const healthCheck = (req, res) => {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: {
            seconds: Math.floor(uptime),
            human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
        },
        memory: {
            used: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
            total: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
            external: `${Math.round(memory.external / 1024 / 1024)} MB`
        },
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        api: {
            name: 'Minecraft Check API',
            version: '1.0.0'
        }
    });
};

module.exports = {
    notFoundHandler,
    errorHandler,
    requestLogger,
    healthCheck
};