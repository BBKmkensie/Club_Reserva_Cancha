/**
 * =============================================================================
 * 4.4 (extra) public.decorator.ts — MARCAR RUTAS PÚBLICAS
 * =============================================================================
 * Por defecto, JwtAuthGuard exige token en casi todas las rutas.
 * Con @Public() dices: "esta ruta NO necesita login" (ej. POST /auth/login).
 *
 * Cómo funciona:
 *   1) Public() guarda metadata { isPublic: true } en el método/clase
 *   2) JwtAuthGuard lee esa metadata con Reflector
 *   3) Si isPublic === true → deja pasar sin validar JWT
 * =============================================================================
 */

// SetMetadata = guarda un par clave/valor en el decorador (Nest lo lee luego).
import { SetMetadata } from '@nestjs/common';

/** Clave interna de la metadata (debe coincidir con la que lee JwtAuthGuard). */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador @Public()
 *
 * Uso:
 *   @Public()
 *   @Post('login')
 *   login(...) { ... }
 *
 * Equivale a: SetMetadata('isPublic', true) sobre el método o la clase.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
