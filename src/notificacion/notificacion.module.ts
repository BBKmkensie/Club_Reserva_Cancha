/**
 * =============================================================================
 * notificacion/notificacion.module.ts — MÓDULO DE NOTIFICACIONES IN-APP
 * =============================================================================
 * Combina:
 *   - Persistencia (entidad Notificacion en PostgreSQL)
 *   - Correo (MailModule) al crear avisos
 *   - SSE en tiempo real (NotificacionStreamService)
 *
 * Destinatarios posibles: alumnoId | profesorId | adminId (uno por fila).
 * =============================================================================
 */
import { Module } from '@nestjs/common';
// Entidades: notificación + destinatarios (para correo al crear)
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from '../entities/notificacion.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { Admin } from '../entities/admin.entity';
import { NotificacionService } from './notificacion.service';
import { NotificacionController } from './notificacion.controller';
// SSE en tiempo real (Subject RxJS por usuario)
import { NotificacionStreamService } from './notificacion-stream.service';
// MailModule = envío de correo al crear notificaciones
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

/** Agrupa servicios y controlador de notificaciones del sistema. */
@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion, Alumno, Profesor, Admin]),
    MailModule,
    AuthModule,
  ],
  controllers: [NotificacionController],
  providers: [NotificacionService, NotificacionStreamService],
  exports: [NotificacionService, NotificacionStreamService],
})
export class NotificacionModule {}
