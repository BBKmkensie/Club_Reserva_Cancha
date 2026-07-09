/**
 * Módulo NestJS de notificaciones.
 * Integra persistencia TypeORM, correo y streaming SSE en tiempo real.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from '../entities/notificacion.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { Admin } from '../entities/admin.entity';
import { NotificacionService } from './notificacion.service';
import { NotificacionController } from './notificacion.controller';
import { NotificacionStreamService } from './notificacion-stream.service';
import { MailModule } from '../mail/mail.module';

/** Agrupa servicios y controlador de notificaciones del sistema. */
@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion, Alumno, Profesor, Admin]),
    MailModule,
  ],
  controllers: [NotificacionController],
  providers: [NotificacionService, NotificacionStreamService],
  exports: [NotificacionService, NotificacionStreamService],
})
export class NotificacionModule {}
