/**
 * Configuración de autenticación JWT.
 * Define secreto y tiempo de expiración del token.
 */
import { registerAs } from '@nestjs/config';

/** Registro de configuración `jwt` para NestJS ConfigModule. */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'reservas-cancha-dev-secret-cambiar-en-produccion',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));
