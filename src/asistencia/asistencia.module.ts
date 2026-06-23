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
import { MailModule } from '../mail/mail.module';

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
    MailModule,
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
  exports: [AsistenciaService],
})
export class AsistenciaModule {}
