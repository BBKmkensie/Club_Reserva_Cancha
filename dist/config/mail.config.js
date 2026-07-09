"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('mail', () => ({
    enabled: process.env.MAIL_ENABLED === 'true',
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Reservas Cancha <noreply@reservas.local>',
    frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, ''),
}));
//# sourceMappingURL=mail.config.js.map