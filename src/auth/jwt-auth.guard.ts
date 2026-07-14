/**
 * =============================================================================
 * 4.4 (extra) jwt-auth.guard.ts — "PORTERO" QUE EXIGE JWT
 * =============================================================================
 * Un Guard decide si una petición PUEDE entrar a un controller.
 *
 * Este guard:
 *   1) Si la ruta tiene @Public() → deja pasar
 *   2) Si no, exige Authorization: Bearer <token>
 *   3) Extra: también acepta ?access_token=... (útil para descargas/enlaces)
 *   4) Llama a Passport (estrategia 'jwt') → JwtStrategy.validate()
 * =============================================================================
 */

// ExecutionContext = contexto de la petición (HTTP, handler, clase);
// Injectable = Nest puede inyectar esta clase.
import { ExecutionContext, Injectable } from '@nestjs/common';

// Reflector = lee metadata de decoradores (ej. la que pone @Public()).
import { Reflector } from '@nestjs/core';

// AuthGuard('jwt') = guard de Passport ligado a la estrategia JwtStrategy.
import { AuthGuard } from '@nestjs/passport';

// IS_PUBLIC_KEY = clave de metadata que escribe el decorador @Public().
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * JwtAuthGuard:
 *   - Extiende AuthGuard('jwt') → usa JwtStrategy por debajo
 *   - Primero mira si la ruta es @Public(); si no, exige token
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Reflector = herramienta de Nest para leer metadata de decoradores
   * (como la que pone @Public() con SetMetadata).
   * super() = inicializa el AuthGuard de Passport.
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * canActivate(context):
   *   return true  → la petición sigue
   *   return false / throw → se bloquea (401 Unauthorized)
   */
  canActivate(context: ExecutionContext) {
    // Lee si el handler o la clase tienen @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // el método (ej. login)
      context.getClass(), // la clase controller
    ]);

    // Ruta pública → no pedir token
    if (isPublic) {
      return true;
    }

    // Objeto Request de Express (headers, query, etc.)
    const request = context.switchToHttp().getRequest();

    // Permite autenticación vía query: /algo?access_token=XXX
    // (útil cuando el header Authorization no se puede enviar, ej. link de descarga)
    const queryToken = request.query?.access_token;
    if (!request.headers.authorization && queryToken) {
      // Convertimos el query token al formato que espera Passport-JWT
      request.headers.authorization = `Bearer ${queryToken}`;
    }

    // Delega a Passport → valida JWT con JwtStrategy
    return super.canActivate(context);
  }
}
