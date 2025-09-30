const express = require('express');
const MinecraftServerQuery = require('../utils/minecraftQuery');

const router = express.Router();
const mcQuery = new MinecraftServerQuery();

/**
 * GET /api/server/status
 * Fragt den Status eines Minecraft Servers ab
 * 
 * Query Parameter:
 * - host (required): Server hostname oder IP
 * - port (required): Server port
 * - type (required): "java" oder "bedrock"
 * - timeout (optional): Timeout in ms (1000-30000)
 */
router.get('/status', async (req, res) => {
    try {
        const { host, port, type, timeout } = req.query;

        // Validierung der erforderlichen Parameter
        if (!host) {
            return res.status(400).json({
                error: 'Parameter "host" ist erforderlich',
                example: '/api/server/status?host=mc.hypixel.net&port=25565&type=java'
            });
        }

        if (!port) {
            return res.status(400).json({
                error: 'Parameter "port" ist erforderlich',
                example: '/api/server/status?host=mc.hypixel.net&port=25565&type=java'
            });
        }

        if (!type) {
            return res.status(400).json({
                error: 'Parameter "type" ist erforderlich (java oder bedrock)',
                example: '/api/server/status?host=mc.hypixel.net&port=25565&type=java'
            });
        }

        const result = await mcQuery.queryServerWithMetadata(host, port, type, timeout);
        
        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/server/status
 * Alternative zum GET Request mit Body Parameters
 */
router.post('/status', async (req, res) => {
    try {
        const { host, port, type, timeout } = req.body;

        // Validierung der erforderlichen Parameter
        if (!host || !port || !type) {
            return res.status(400).json({
                error: 'Parameter "host", "port" und "type" sind erforderlich',
                example: {
                    host: 'mc.hypixel.net',
                    port: 25565,
                    type: 'java',
                    timeout: 5000
                }
            });
        }

        const result = await mcQuery.queryServerWithMetadata(host, port, type, timeout);
        
        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/server/batch
 * Fragt mehrere Server gleichzeitig ab
 */
router.post('/batch', async (req, res) => {
    try {
        const { servers } = req.body;

        if (!Array.isArray(servers) || servers.length === 0) {
            return res.status(400).json({
                error: 'Parameter "servers" muss ein Array mit Server-Objekten sein',
                example: {
                    servers: [
                        { host: 'mc.hypixel.net', port: 25565, type: 'java' },
                        { host: 'play.cubecraft.net', port: 25565, type: 'java' }
                    ]
                }
            });
        }

        if (servers.length > 10) {
            return res.status(400).json({
                error: 'Maximal 10 Server können gleichzeitig abgefragt werden'
            });
        }

        const promises = servers.map(async (server, index) => {
            try {
                const result = await mcQuery.queryServerWithMetadata(
                    server.host, 
                    server.port, 
                    server.type, 
                    server.timeout
                );
                return { index, success: true, data: result };
            } catch (error) {
                return { 
                    index, 
                    success: false, 
                    error: error.message,
                    server: { host: server.host, port: server.port, type: server.type }
                };
            }
        });

        const results = await Promise.all(promises);

        res.json({
            success: true,
            data: {
                total: servers.length,
                results: results,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/server/ping
 * Vereinfachter Endpoint nur für Ping-Check
 */
router.get('/ping', async (req, res) => {
    try {
        const { host, port, type, timeout } = req.query;

        if (!host || !port || !type) {
            return res.status(400).json({
                error: 'Parameter "host", "port" und "type" sind erforderlich'
            });
        }

        const result = await mcQuery.queryServer(host, port, type, timeout);
        
        res.json({
            success: true,
            data: {
                host: result.host,
                port: result.port,
                type: result.type,
                online: result.online,
                ping: result.ping,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;