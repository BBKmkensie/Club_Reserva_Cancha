/**
 * =============================================================================
 * app.service.ts — SERVICIO RAÍZ (lógica asociada a AppController)
 * =============================================================================
 * Un Service = donde va la lógica de negocio.
 * Se marca con @Injectable() para que Nest pueda inyectarlo en controllers.
 *
 * En este caso es trivial (solo un string), pero el patrón es el mismo
 * que en AuthService, TallerService, etc.:
 *   Controller llama → Service hace el trabajo → retorna el resultado
 * =============================================================================
 */

// Injectable = "esta clase puede inyectarse en otros sitios (DI de Nest)".
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * AppService:
 *   Service mínimo ligado a AppController (GET /health).
 */
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  /**
   * getHello = devuelve un mensaje simple.
   * Usado por GET /health para confirmar que el proceso Node responde.
   */
  getHello(): string {
    return 'Hello World!';
  }

  getHealthStatus(): { ok: true; mailEnabled: boolean } {
    return {
      ok: true,
      mailEnabled: this.configService.get<boolean>('mail.enabled') ?? false,
    };
  }
}
