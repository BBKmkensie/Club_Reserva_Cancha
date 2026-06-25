import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalidaService } from './salida.service';
import { SalidaController } from './salida.controller';
import { Salida } from '../entities/salida.entity';
import { Profesor } from '../entities/profesor.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Salida, Profesor, Taller, Alumno, InscripcionTaller])],
  controllers: [SalidaController],
  providers: [SalidaService],
  exports: [SalidaService],
})
export class SalidaModule {}

