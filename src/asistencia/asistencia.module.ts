/**
 * =============================================================================
 * asistencia/asistencia.module.ts — MÓDULO DE ASISTENCIA A TALLERES
 * =============================================================================
 * Controla sesiones de asistencia (abrir/guardar lista/cerrar), registros por
 * alumno (PRESENTE / AUSENTE / TARDE) y alertas por ausencias recurrentes.
 *
 * Importa NotificacionModule para avisar a alumno, profesor y coordinación
 * cuando se supera el umbral de ausencias del taller.
 * =============================================================================
 */
// Module = agrupa controllers, providers e imports de Nest
import { Module } from '@nestjs/common';
// TypeOrmModule.forFeature = registra repositorios de entidades en este módulo
import { TypeOrmModule } from '@nestjs/typeorm';
// Entidades que AsistenciaService inyecta vía @InjectRepository
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { RegistroAsistencia } from '../entities/registro-asistencia.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { AlertaAusencia } from '../entities/alerta-ausencia.entity';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
// NotificacionModule exporta NotificacionService (alertas in-app)
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
    NotificacionModule, // para crear notificaciones in-app al disparar alertas
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
  exports: [AsistenciaService],
})
export class AsistenciaModule {}
