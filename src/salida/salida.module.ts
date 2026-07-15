/**
 * =============================================================================
 * salida/salida.module.ts — MÓDULO DE SALIDAS DEPORTIVAS
 * =============================================================================
 * Una "salida" es un partido, excursión o evento fuera del colegio vinculado
 * a un taller. Este módulo registra:
 *   - SalidaController → rutas /salida
 *   - SalidaService    → flujo de aprobación y ciclo de vida
 *
 * Entidades TypeORM usadas: Salida, Profesor, Taller, InscripcionTaller
 * (InscripcionTaller sirve para filtrar salidas visibles por alumno inscrito).
 * =============================================================================
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalidaService } from './salida.service';
import { SalidaController } from './salida.controller';
import { Salida } from '../entities/salida.entity';
import { Profesor } from '../entities/profesor.entity';
import { Taller } from '../entities/taller.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { InscripcionSalida } from '../entities/inscripcion-salida.entity';
import { RegistroAsistenciaSalida } from '../entities/registro-asistencia-salida.entity';
import { AsistenciaSalidaService } from './asistencia-salida.service';

/**
 * @Module: agrupa gestión de salidas deportivas y su flujo de aprobación.
 * forFeature([...]) permite @InjectRepository en SalidaService.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Salida,
      Profesor,
      Taller,
      InscripcionTaller,
      InscripcionSalida,
      RegistroAsistenciaSalida,
    ]),
  ],
  controllers: [SalidaController],
  providers: [SalidaService, AsistenciaSalidaService],
  exports: [SalidaService, AsistenciaSalidaService],
})
export class SalidaModule {}
