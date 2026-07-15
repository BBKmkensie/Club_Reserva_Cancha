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

  getHealthStatus(): {
    ok: true;
    mailEnabled: boolean;
    smtpConfigured: boolean;
    mensaje: string;
  } {
    const mailEnabled = this.configService.get<boolean>('mail.enabled') ?? false;
    const host = this.configService.get<string>('mail.host') ?? '';
    const user = this.configService.get<string>('mail.user') ?? '';
    const pass = this.configService.get<string>('mail.pass') ?? '';
    const smtpConfigured = mailEnabled && !!host.trim() && !!user.trim() && !!pass.trim();
    let mensaje = 'Correo desactivado en el servidor (MAIL_ENABLED=false).';
    if (mailEnabled && !smtpConfigured) {
      mensaje = 'Correo activado pero faltan credenciales SMTP en Azure.';
    }
    if (smtpConfigured) {
      mensaje = 'Correo configurado; los avisos se envían al email del alumno.';
    }
    return { ok: true, mailEnabled, smtpConfigured, mensaje };
  }
}
