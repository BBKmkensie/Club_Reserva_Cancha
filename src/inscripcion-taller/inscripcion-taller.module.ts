/**
 * Módulo de inscripciones a talleres.
 * Registra entidades y servicios para el flujo alumno → profesor → directiva.
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
  ],
  controllers: [InscripcionTallerController],
  providers: [InscripcionTallerService],
  exports: [InscripcionTallerService],
})
export class InscripcionTallerModule {}
