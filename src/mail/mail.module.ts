/**
 * Módulo global de correo electrónico.
 * Registra MailService para uso en toda la aplicación.
 */
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/** Provee y exporta el servicio de envío de correos a todos los módulos. */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
