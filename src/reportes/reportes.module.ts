/**
 * =============================================================================
 * reportes/reportes.module.ts — MÓDULO DE REPORTES ADMINISTRATIVOS
 * =============================================================================
 * Consolida listados cruzados (alumnos, apoderados, profes, directiva)
 * para pantallas de coordinación. No genera PDFs: devuelve JSON.
 * =============================================================================
 */
import { Module } from '@nestjs/common';
// Entidades cruzadas para el reporte de personas e inscripciones
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alumno } from '../entities/alumno.entity';
import { Admin } from '../entities/admin.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';

/** Agrupa la generación de reportes administrativos y de coordinación. */
@Module({
  imports: [TypeOrmModule.forFeature([Alumno, Admin, InscripcionTaller, Profesor])],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
