/**
 * =============================================================================
 * ficha-alumno/ficha-alumno.module.ts — MÓDULO DE FICHAS ANTROPOMÉTRICAS
 * =============================================================================
 * Cada alumno puede tener una ficha por taller (altura, peso, % grasa, sedentario).
 * Usado por profesores y coordinación para seguimiento deportivo/médico.
 * =============================================================================
 */
// Module = contenedor Nest de este dominio
import { Module } from '@nestjs/common';
// forFeature = repositorios disponibles para inyección en FichaAlumnoService
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaAlumnoTaller } from '../entities/ficha-alumno-taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { FichaAlumnoService } from './ficha-alumno.service';
import { FichaAlumnoController } from './ficha-alumno.controller';

/** Agrupa la funcionalidad de fichas antropométricas por alumno y taller. */
@Module({
  imports: [TypeOrmModule.forFeature([FichaAlumnoTaller, Alumno, InscripcionTaller, Profesor])],
  controllers: [FichaAlumnoController],
  providers: [FichaAlumnoService],
  exports: [FichaAlumnoService],
})
export class FichaAlumnoModule {}
