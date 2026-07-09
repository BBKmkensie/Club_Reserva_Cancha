/**
 * Módulo NestJS de asistencia.
 * Registra entidades, servicio y controlador; importa notificaciones para alertas.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { RegistroAsistencia } from '../entities/registro-asistencia.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { AlertaAusencia } from '../entities/alerta-ausencia.entity';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { NotificacionModule } from '../notificacion/notificacion.module';

/** Agrupa la funcionalidad de control de asistencia en talleres. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SesionAsistencia,
      RegistroAsistencia,
      InscripcionTaller,
      Taller,
      Alumno,
      Profesor,
      AlertaAusencia,
    ]),
    NotificacionModule,
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
  exports: [AsistenciaService],
})
export class AsistenciaModule {}
