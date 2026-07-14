/**
 * =============================================================================
 * mail/mail.module.ts — MÓDULO GLOBAL DE CORREO
 * =============================================================================
 * @Global() = MailService se puede inyectar en CUALQUIER módulo sin
 * importar MailModule (asistencia, notificacion, apoderado, etc.).
 *
 * La configuración SMTP viene de config/mail.config.ts (namespace 'mail').
 * =============================================================================
 */
// Global = MailService inyectable en cualquier módulo sin re-importar
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/** Provee y exporta el servicio de envío de correos a todos los módulos. */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
