/**
 * =============================================================================
 * inscripcion-salida/inscripcion-salida.module.ts — MÓDULO INSCRIPCIÓN A SALIDAS
 * =============================================================================
 * Relaciona alumno ↔ salida (tabla InscripcionSalida).
 * También necesita InscripcionTaller y Alumno para validar que el alumno
 * pertenezca al taller de la salida antes de inscribirse.
 * =============================================================================
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscripcionSalidaService } from './inscripcion-salida.service';
import { InscripcionSalidaController } from './inscripcion-salida.controller';
import { InscripcionSalida } from '../entities/inscripcion-salida.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { Salida } from '../entities/salida.entity';

/**
 * @Module: agrupa la gestión de inscripciones de alumnos en salidas deportivas.
 * forFeature([...]) habilita @InjectRepository en el service.
 */
@Module({
  imports: [TypeOrmModule.forFeature([InscripcionSalida, InscripcionTaller, Alumno, Salida])],
  controllers: [InscripcionSalidaController],
  providers: [InscripcionSalidaService],
  exports: [InscripcionSalidaService],
})
export class InscripcionSalidaModule {}
