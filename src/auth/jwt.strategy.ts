/**
 * =============================================================================
 * 4.4 (extra) jwt.strategy.ts — CÓMO SE VALIDA EL TOKEN EN CADA REQUEST
 * =============================================================================
 * Passport Strategy 'jwt':
 *   1) Extrae el token del header: Authorization: Bearer <token>
 *   2) Verifica firma y expiración con jwt.secret
 *   3) Llama a validate(payload)
 *   4) El valor retornado se guarda en req.user
 *
 * Por eso en AuthController.me() puedes hacer: const user = req.user
 * =============================================================================
 */

// Injectable = Nest puede inyectar esta clase; UnauthorizedException = HTTP 401.
import { Injectable, UnauthorizedException } from '@nestjs/common';

// ConfigService = lee jwt.secret del .env (vía ConfigModule).
import { ConfigService } from '@nestjs/config';

// PassportStrategy = puente Nest ↔ Passport (estrategias de autenticación).
import { PassportStrategy } from '@nestjs/passport';

// ExtractJwt = helpers para sacar el token; Strategy = estrategia JWT de passport-jwt.
import { ExtractJwt, Strategy } from 'passport-jwt';

// AuthService.validatePayload = punto único para validaciones extra del payload.
import { AuthService } from './auth.service';

// JwtPayload = forma esperada de lo que va dentro del token.
import { JwtPayload } from './auth.types';

/**
 * JwtStrategy:
 *   - Extiende PassportStrategy(Strategy) → se registra como estrategia 'jwt'
 *   - Nest/Passport la usan cada vez que JwtAuthGuard exige token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * constructor:
   *   - configService → secreto para verificar firma
   *   - authService   → hook validatePayload()
   *   - super({...})  → configura de dónde sacar el token y cómo verificarlo
   */
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    // Configuración de Passport-JWT (obligatorio llamar a super)
    super({
      // De dónde sacar el token: header Authorization Bearer
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false → si el token expiró, rechazar
      ignoreExpiration: false,
      // Misma clave secreta con la que AuthService firmó el token
      secretOrKey:
        configService.get<string>('jwt.secret') ?? 'dev-secret-change-me',
    });
  }

  /**
   * validate(payload):
   *   Se ejecuta DESPUÉS de que Passport verificó firma/expiración.
   *   Aquí revisamos que el payload tenga campos mínimos (sub, role, tipo).
   *   Lo que retornamos se convierte en req.user.
   */
  validate(payload: JwtPayload): JwtPayload {
    // Payload incompleto o corrupto → 401
    if (!payload?.sub || !payload?.role || !payload?.tipo) {
      throw new UnauthorizedException('Token inválido');
    }
    // Punto único para validaciones extra (hoy solo reenvía el payload)
    return this.authService.validatePayload(payload);
  }
}
