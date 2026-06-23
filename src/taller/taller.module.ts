import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TallerService } from './taller.service';
import { TallerController } from './taller.controller';
import { Taller } from '../entities/taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { AsignacionDocente } from '../entities/asignacion-docente.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Taller, Profesor, AsignacionDocente, InscripcionTaller, SesionAsistencia]),
    NotificacionModule,
  ],
  controllers: [TallerController],
  providers: [TallerService],
  exports: [TallerService],
})
export class TallerModule {}
