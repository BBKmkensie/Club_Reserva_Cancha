/**
 * =============================================================================
 * config/mail.config.ts — CONFIGURACIÓN DE CORREO SMTP
 * =============================================================================
 * Namespace ConfigModule: "mail"
 * Lo consume MailService para enviar notificaciones por email.
 *
 * Variables de entorno:
 *   MAIL_ENABLED   → "true" para enviar de verdad; si no, se simula/loguea
 *   SMTP_HOST/PORT/USER/PASS → credenciales del servidor SMTP
 *   SMTP_FROM      → remitente visible
 *   FRONTEND_URL   → base de links en los correos (sin barra final)
 *
 * Por defecto apunta a Mailtrap (sandbox de pruebas de email).
 * =============================================================================
 */

// registerAs = registra el namespace 'mail' en ConfigModule.
import { registerAs } from '@nestjs/config';

/**
 * registerAs('mail', factory):
 *   - ConfigService.get('mail.host'), get('mail.enabled'), etc.
 *   - MailService usa estos valores para nodemailer / SMTP
 */
export default registerAs('mail', () => ({
  // Solo envía correos reales si MAIL_ENABLED=true
  enabled: process.env.MAIL_ENABLED === 'true',
  // Host SMTP (default = sandbox Mailtrap para desarrollo)
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  // Puerto SMTP (2525 típico en Mailtrap; 587/465 en producción)
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  // Usuario / contraseña del SMTP
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  // Remitente visible en el correo ("From:")
  from: process.env.SMTP_FROM || 'Reservas Cancha <noreply@reservas.local>',
  // Quita la barra final para armar URLs limpias: frontendUrl + '/ruta'
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, ''),
}));
