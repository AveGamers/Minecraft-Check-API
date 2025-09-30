const mcUtil = require('minecraft-server-util');

/**
 * Minecraft Server Query Utility
 * Unterstützt sowohl Java als auch Bedrock Server
 */
class MinecraftServerQuery {
    constructor() {
        this.defaultTimeout = parseInt(process.env.DEFAULT_TIMEOUT) || 5000;
        this.maxTimeout = parseInt(process.env.MAX_TIMEOUT) || 30000;
    }

    /**
     * Validiert und normalisiert Eingabeparameter
     */
    validateParams(host, port, type, timeout) {
        if (!host || typeof host !== 'string') {
            throw new Error('Host ist erforderlich und muss ein String sein');
        }

        if (!port || isNaN(port) || port < 1 || port > 65535) {
            throw new Error('Port muss eine gültige Zahl zwischen 1 und 65535 sein');
        }

        if (!['java', 'bedrock'].includes(type)) {
            throw new Error('Server-Typ muss entweder "java" oder "bedrock" sein');
        }

        const timeoutMs = timeout ? 
            Math.min(Math.max(parseInt(timeout), 1000), this.maxTimeout) : 
            this.defaultTimeout;

        return {
            host: host.trim(),
            port: parseInt(port),
            type: type.toLowerCase(),
            timeout: timeoutMs
        };
    }

    /**
     * Berechnet Ping aus Start- und Endzeit
     */
    calculatePing(startTime, endTime) {
        return Math.round(endTime - startTime);
    }

    /**
     * Formatiert MOTD Text (entfernt Minecraft Farbcodes)
     */
    formatMotd(motd) {
        if (!motd) return '';
        
        // Entfernt Minecraft Farbcodes (§ codes)
        return motd.replace(/§[0-9a-fk-or]/gi, '').trim();
    }

    /**
     * Fragt Java Edition Server ab
     */
    async queryJavaServer(host, port, timeout) {
        const startTime = Date.now();
        
        try {
            const response = await mcUtil.status(host, port, {
                timeout: timeout,
                enableSRV: true
            });

            const endTime = Date.now();
            const ping = this.calculatePing(startTime, endTime);

            return {
                online: true,
                ping: ping,
                players: {
                    online: response.players.online,
                    max: response.players.max,
                    sample: response.players.sample || []
                },
                version: response.version.name || 'Unbekannt',
                motd: this.formatMotd(response.motd.clean || response.motd.raw),
                favicon: response.favicon || null,
                host: host,
                port: port,
                type: 'java'
            };
        } catch (error) {
            return {
                online: false,
                ping: null,
                players: null,
                version: null,
                motd: null,
                favicon: null,
                host: host,
                port: port,
                type: 'java',
                error: error.message
            };
        }
    }

    /**
     * Fragt Bedrock Edition Server ab
     */
    async queryBedrockServer(host, port, timeout) {
        const startTime = Date.now();
        
        try {
            const response = await mcUtil.statusBedrock(host, port, {
                timeout: timeout
            });

            const endTime = Date.now();
            const ping = this.calculatePing(startTime, endTime);

            return {
                online: true,
                ping: ping,
                players: {
                    online: response.players.online,
                    max: response.players.max
                },
                version: response.version || 'Unbekannt',
                motd: this.formatMotd(response.motd),
                gamemode: response.gamemode || null,
                serverId: response.serverId || null,
                host: host,
                port: port,
                type: 'bedrock'
            };
        } catch (error) {
            return {
                online: false,
                ping: null,
                players: null,
                version: null,
                motd: null,
                gamemode: null,
                serverId: null,
                host: host,
                port: port,
                type: 'bedrock',
                error: error.message
            };
        }
    }

    /**
     * Hauptmethode zum Abfragen eines Minecraft Servers
     */
    async queryServer(host, port, type, timeout) {
        const params = this.validateParams(host, port, type, timeout);
        
        if (params.type === 'java') {
            return await this.queryJavaServer(params.host, params.port, params.timeout);
        } else {
            return await this.queryBedrockServer(params.host, params.port, params.timeout);
        }
    }

    /**
     * Fragt einen Server ab und gibt zusätzliche Metadaten zurück
     */
    async queryServerWithMetadata(host, port, type, timeout) {
        const startTime = Date.now();
        const result = await this.queryServer(host, port, type, timeout);
        const endTime = Date.now();

        return {
            ...result,
            metadata: {
                queryTime: endTime - startTime,
                timestamp: new Date().toISOString(),
                api: {
                    name: 'Minecraft Check API',
                    version: '1.0.0'
                }
            }
        };
    }
}

module.exports = MinecraftServerQuery;