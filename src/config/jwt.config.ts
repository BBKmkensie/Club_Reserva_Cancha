/**
 * =============================================================================
 * config/jwt.config.ts — CONFIGURACIÓN DEL TOKEN JWT
 * =============================================================================
 * Namespace ConfigModule: "jwt"
 *
 *   secret     → clave con la que se FIRMA y VERIFICA el token
 *   expiresIn  → cuánto dura el accessToken (ej. "24h", "7d")
 *
 * IMPORTANTE en producción: cambiar JWT_SECRET por un valor largo y secreto.
 * El valor por defecto solo sirve para desarrollo local.
 * =============================================================================
 */

// registerAs = registra el namespace 'jwt' en ConfigModule.
import { registerAs } from '@nestjs/config';

/**
 * registerAs('jwt', factory):
 *   - ConfigService.get('jwt.secret') / get('jwt.expiresIn')
 *   - Lo usan AuthModule (firmar) y JwtStrategy (verificar)
 */
export default registerAs('jwt', () => ({
  // Clave secreta de firma; NUNCA subir el valor real de producción al repo
  secret: process.env.JWT_SECRET || 'reservas-cancha-dev-secret-cambiar-en-produccion',
  // Tiempo de vida del token (formato Nest/JWT: '24h', '7d', '3600s'...)
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));
