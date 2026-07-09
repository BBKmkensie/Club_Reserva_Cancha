/**
 * Servicio de seed para edades de alumnos.
 * Asigna edades sugeridas a registros que no tienen una edad válida.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import {
  EDAD_ALUMNO_MAX,
  EDAD_ALUMNO_MIN,
  edadAlumnoValida,
  edadSugeridaParaAlumno,
} from '../common/alumno-edad.constants';

/** Resultado del proceso de seed de edades en alumnos. */
export interface SeedAlumnoEdadesResult {
  actualizados: number;
  omitidos: number;
  detalle: Array<{ alumnoId: number; nombre: string; edadAnterior: number | null; edadNueva: number }>;
}

/** Completa edades faltantes o inválidas en el catálogo de alumnos. */
@Injectable()
export class AlumnoEdadSeedService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
  ) {}

  /** Recorre alumnos y asigna edad sugerida a quienes no tienen una válida. */
  async seedMissingEdades(): Promise<SeedAlumnoEdadesResult> {
    const alumnos = await this.alumnoRepo.find({ order: { id: 'ASC' } });
    const detalle: SeedAlumnoEdadesResult['detalle'] = [];
    let actualizados = 0;
    let omitidos = 0;

    for (const alumno of alumnos) {
      if (edadAlumnoValida(alumno.edad)) {
        omitidos++;
        continue;
      }

      const edadAnterior = alumno.edad ?? null;
      alumno.edad = edadSugeridaParaAlumno(alumno.id);
      await this.alumnoRepo.save(alumno);
      actualizados++;
      detalle.push({
        alumnoId: alumno.id,
        nombre: alumno.nombre,
        edadAnterior,
        edadNueva: alumno.edad,
      });
    }

    return { actualizados, omitidos, detalle };
  }
}

export { EDAD_ALUMNO_MIN, EDAD_ALUMNO_MAX };
