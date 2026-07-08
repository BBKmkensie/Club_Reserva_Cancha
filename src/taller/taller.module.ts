import { Module } from '@nestjs/common';
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
    TypeOrmModule.forFeature([
      Taller,
      Profesor,
      AsignacionDocente,
      InscripcionTaller,
      SesionAsistencia,
      TallerHorario,
      Reserva,
    ]),
    NotificacionModule,
    PeriodoModule,
  ],
  controllers: [TallerController],
  providers: [TallerService, TallerSeedService],
  exports: [TallerService, TallerSeedService],
})
export class TallerModule {}
