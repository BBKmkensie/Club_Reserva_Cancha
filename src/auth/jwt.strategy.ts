/**
 * Estrategia Passport para validar tokens JWT en el header Authorization.
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') ?? 'dev-secret-change-me',
    });
  }

  /** Verifica campos mínimos del payload antes de adjuntarlo a `req.user`. */
  validate(payload: JwtPayload): JwtPayload {
    if (!payload?.sub || !payload?.role || !payload?.tipo) {
      throw new UnauthorizedException('Token inválido');
    }
    return this.authService.validatePayload(payload);
  }
}
