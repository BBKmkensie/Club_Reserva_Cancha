/**
 * =============================================================================
 * inscripcion-taller/inscripcion-taller.module.ts — MÓDULO DE INSCRIPCIONES
 * =============================================================================
 * Núcleo del flujo alumno → profesor → (opcional) propuestas de directiva.
 *
 * Entidades clave:
 *   InscripcionTaller          → solicitud PENDIENTE/ACEPTADO/RECHAZADO
 *   PropuestaInscripcionTaller → propuesta del apoderado a la directiva
 *   TallerHorario              → horarios opcionales del taller
 *
 * NotificacionModule + MailModule: avisan en cada cambio de estado.
 * =============================================================================
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { PropuestaInscripcionTaller } from '../entities/propuesta-inscripcion-taller.entity';
import { TallerHorario } from '../entities/taller-horario.entity';
import { InscripcionTallerService } from './inscripcion-taller.service';
import { InscripcionTallerController } from './inscripcion-taller.controller';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { FichaAlumnoModule } from '../ficha-alumno/ficha-alumno.module';

/**
 * @Module: registra entidades TypeORM + controllers/providers.
 * forFeature([...]) habilita @InjectRepository en InscripcionTallerService.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InscripcionTaller,
      Taller,
      Alumno,
      Profesor,
      PropuestaInscripcionTaller,
      TallerHorario,
    ]),
    NotificacionModule,
    MailModule,
    AuthModule,
    FichaAlumnoModule,
  ],
  controllers: [InscripcionTallerController],
  providers: [InscripcionTallerService],
  exports: [InscripcionTallerService],
})
export class InscripcionTallerModule {}
