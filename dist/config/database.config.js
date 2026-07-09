"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => {
    const rawPort = process.env.DB_PORT || '5432';
    const port = parseInt(rawPort, 10);
    if (!Number.isFinite(port) || port <= 0 || port > 65535) {
        throw new Error(`DB_PORT inválido: "${rawPort}". Debe ser un número (ej. 5432), no una IP.`);
    }
    return {
        host: process.env.DB_HOST || '127.0.0.1',
        port,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'proyecto_taller',
        ssl: process.env.DB_SSL === 'true',
    };
});
//# sourceMappingURL=database.config.js.map