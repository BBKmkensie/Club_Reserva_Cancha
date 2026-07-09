/**
 * Guard global de autenticación JWT.
 * Respeta rutas marcadas como públicas y acepta token por query string.
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Permite autenticación vía ?access_token= para descargas o enlaces directos
    const queryToken = request.query?.access_token;
    if (!request.headers.authorization && queryToken) {
      request.headers.authorization = `Bearer ${queryToken}`;
    }

    return super.canActivate(context);
  }
}
