/**
 * Configuración de correo SMTP y URL del frontend.
 * Controla habilitación, credenciales y remitente de los envíos.
 */
import { registerAs } from '@nestjs/config';

/** Registro de configuración `mail` para NestJS ConfigModule. */
export default registerAs('mail', () => ({
  enabled: process.env.MAIL_ENABLED === 'true',
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.SMTP_FROM || 'Reservas Cancha <noreply@reservas.local>',
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, ''),
}));
