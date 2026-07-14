/**
 * =============================================================================
 * alumno/alumno.module.ts — MÓDULO DE ALUMNOS
 * =============================================================================
 * Además del CRUD (AlumnoService), registra seeds:
 *   - AlumnoEdadSeedService     → rellena edades en lote
 *   - AlumnoPasswordSeedService → asigna hashes de password iniciales
 * Se usan desde scripts npm (seed:alumno-edades, seed:alumno-passwords).
 * =============================================================================
 */

// Module = decorador Nest que agrupa imports/controllers/providers/exports.
import { Module } from '@nestjs/common';

// TypeOrmModule = registra la entidad Alumno para Repository<Alumno>.
import { TypeOrmModule } from '@nestjs/typeorm';

// AlumnoService = lógica CRUD de alumnos.
import { AlumnoService } from './alumno.service';

// Seeds = servicios que inicializan datos en lote (edades / passwords).
import { AlumnoEdadSeedService } from './alumno-edad-seed.service';
import { AlumnoPasswordSeedService } from './alumno-password-seed.service';

// AlumnoController = rutas HTTP /alumno.
import { AlumnoController } from './alumno.controller';

// Alumno = entidad TypeORM (= tabla `alumnos`).
import { Alumno } from '../entities/alumno.entity';

/**
 * AlumnoModule:
 *   - CRUD de alumnos + seeds exportados para scripts CLI
 */
@Module({
  imports: [TypeOrmModule.forFeature([Alumno])], // tabla `alumnos`
  controllers: [AlumnoController],
  providers: [AlumnoService, AlumnoEdadSeedService, AlumnoPasswordSeedService],
  exports: [AlumnoService, AlumnoEdadSeedService, AlumnoPasswordSeedService],
})
export class AlumnoModule {}
