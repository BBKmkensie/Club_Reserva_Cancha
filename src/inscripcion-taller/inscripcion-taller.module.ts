import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTallerService } from './inscripcion-taller.service';
import { InscripcionTallerController } from './inscripcion-taller.controller';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InscripcionTaller, Taller, Alumno]),
    NotificacionModule,
  ],
  controllers: [InscripcionTallerController],
  providers: [InscripcionTallerService],
  exports: [InscripcionTallerService],
})
export class InscripcionTallerModule {}
