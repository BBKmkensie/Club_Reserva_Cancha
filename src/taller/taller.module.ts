/**
 * =============================================================================
 * taller/taller.module.ts — MÓDULO DE TALLERES (núcleo del negocio)
 * =============================================================================
 * Un "taller" = actividad extracurricular (fútbol, danza, etc.).
 *
 * Ciclo de vida (estado en tabla talleres):
 *   BORRADOR → ESPERA_DOCENTE → ESPERA_HORARIO → PUBLICADO → CERRADO
 *
 * Este módulo necesita varias tablas porque el taller toca:
 *   - profesores / asignaciones_docente (quién lo imparte)
 *   - taller_horario (cuándo)
 *   - inscripcion_taller (quién se anota)
 *   - sesiones_asistencia / reservas (operación diaria)
 *
 * También importa NotificacionModule (avisar al docente) y PeriodoModule
 * (ventanas académicas / estadísticas de semestre).
 * =============================================================================
 */
// @Module = decorador Nest que declara imports/controllers/providers/exports.
import { Module } from '@nestjs/common';
// TypeOrmModule.forFeature([...]) = registra entidades para @InjectRepository.
import { TypeOrmModule } from '@nestjs/typeorm';
import { TallerService } from './taller.service';
import { TallerController } from './taller.controller';
import { Taller } from '../entities/taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { AsignacionDocente } from '../entities/asignacion-docente.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { TallerHorario } from '../entities/taller-horario.entity';
import { Reserva } from '../entities/reserva.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { PeriodoModule } from '../periodo/periodo.module';
import { TallerSeedService } from './taller-seed.service';

@Module({
  imports: [
    // Entidades que TallerService puede inyectar con @InjectRepository(...)
    TypeOrmModule.forFeature([
      Taller,
      Profesor,
      AsignacionDocente,
      InscripcionTaller,
      SesionAsistencia,
      TallerHorario,
      Reserva,
    ]),
    NotificacionModule, // para notificar al profesor asignado
    PeriodoModule, // para comparar talleres por período académico
  ],
  controllers: [TallerController],
  providers: [TallerService, TallerSeedService], // seed = carga catálogo inicial
  exports: [TallerService, TallerSeedService],
})
export class TallerModule {}
