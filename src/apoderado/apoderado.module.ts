import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { ApoderadoService } from './apoderado.service';
import { ApoderadoController } from './apoderado.controller';
import { ApoderadoSeedService } from './apoderado-seed.service';
import { ApoderadoNotifyService } from './apoderado-notify.service';
import { RegistroAsistencia } from '../entities/registro-asistencia.entity';
import { AuthModule } from '../auth/auth.module';
import { Profesor } from '../entities/profesor.entity';
import { InscripcionTallerModule } from '../inscripcion-taller/inscripcion-taller.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alumno, InscripcionTaller, SesionAsistencia, Profesor, RegistroAsistencia]),
    AuthModule,
    forwardRef(() => InscripcionTallerModule),
  ],
  controllers: [ApoderadoController],
  providers: [ApoderadoService, ApoderadoSeedService, ApoderadoNotifyService],
  exports: [ApoderadoService, ApoderadoSeedService, ApoderadoNotifyService],
})
export class ApoderadoModule {}
