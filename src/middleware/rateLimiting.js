const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Konfiguration für verschiedene Endpoints
 */

// Standard Rate Limit für alle API Calls
const generalRateLimit = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 Minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Max 100 Requests pro Minute
    message: {
        error: 'Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut.',
        retryAfter: '60 Sekunden',
        limit: 100,
        window: '1 Minute'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
            limit: req.rateLimit.limit,
            remaining: req.rateLimit.remaining,
            resetTime: new Date(req.rateLimit.resetTime).toISOString()
        });
    }
});

// Strengeres Rate Limit für Batch-Anfragen
const batchRateLimit = rateLimit({
    windowMs: 60000, // 1 Minute
    max: 10, // Max 10 Batch-Requests pro Minute
    message: {
        error: 'Zu viele Batch-Anfragen von dieser IP.',
        retryAfter: '60 Sekunden',
        limit: 10,
        window: '1 Minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Batch rate limit exceeded',
            message: 'Zu viele Batch-Anfragen von dieser IP. Batch-Anfragen sind auf 10 pro Minute limitiert.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
            limit: req.rateLimit.limit,
            remaining: req.rateLimit.remaining,
            resetTime: new Date(req.rateLimit.resetTime).toISOString()
        });
    }
});

// Sehr lockeres Rate Limit für Ping-Anfragen
const pingRateLimit = rateLimit({
    windowMs: 60000, // 1 Minute
    max: 200, // Max 200 Ping-Requests pro Minute
    message: {
        error: 'Zu viele Ping-Anfragen von dieser IP.',
        retryAfter: '60 Sekunden',
        limit: 200,
        window: '1 Minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Globales Rate Limit für alle Requests (sehr hoch, nur als Schutz vor extremem Missbrauch)
const globalRateLimit = rateLimit({
    windowMs: 60000, // 1 Minute
    max: 500, // Max 500 Requests pro Minute global
    message: {
        error: 'Globales Rate Limit erreicht.',
        retryAfter: '60 Sekunden'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalRateLimit,
    batchRateLimit,
    pingRateLimit,
    globalRateLimit
};