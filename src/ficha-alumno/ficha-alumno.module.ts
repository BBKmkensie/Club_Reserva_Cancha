import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaAlumnoTaller } from '../entities/ficha-alumno-taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { FichaAlumnoService } from './ficha-alumno.service';
import { FichaAlumnoController } from './ficha-alumno.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FichaAlumnoTaller, Alumno, InscripcionTaller, Profesor])],
  controllers: [FichaAlumnoController],
  providers: [FichaAlumnoService],
  exports: [FichaAlumnoService],
})
export class FichaAlumnoModule {}
