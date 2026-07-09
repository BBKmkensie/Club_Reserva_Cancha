/**
 * Módulo de gestión de alumnos.
 * Registra CRUD, seeds de edad/contraseña y repositorio TypeORM.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnoService } from './alumno.service';
import { AlumnoEdadSeedService } from './alumno-edad-seed.service';
import { AlumnoPasswordSeedService } from './alumno-password-seed.service';
import { AlumnoController } from './alumno.controller';
import { Alumno } from '../entities/alumno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alumno])],
  controllers: [AlumnoController],
  providers: [AlumnoService, AlumnoEdadSeedService, AlumnoPasswordSeedService],
  exports: [AlumnoService, AlumnoEdadSeedService, AlumnoPasswordSeedService],
})
export class AlumnoModule {}
