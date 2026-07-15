/**
 * =============================================================================
 * ficha-alumno/ficha-alumno.service.ts — LÓGICA DE FICHAS POR TALLER
 * =============================================================================
 * La ficha (FichaAlumnoTaller) guarda medidas por par alumno+taller.
 * Si aún no hay ficha, se pueden mostrar valores “heredados” de la
 * InscripcionTaller (altura/peso capturados al inscribirse).
 *
 * Permisos en listarPorTaller:
 *   - Profesor (con profesorId): solo inscritos ACEPTADOS de SU taller
 *   - Coordinación (esCoordinacion): todos o solo inscritos según flag
 * =============================================================================
 */
// ForbiddenException = 403 si el profesor pide fichas de otro taller
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FichaAlumnoTaller } from '../entities/ficha-alumno-taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { ActualizarFichaAlumnoDto } from '../dto/ficha-alumno.dto';

/** Elemento de listado con datos del alumno, inscripción y ficha en un taller. */
export interface FichaAlumnoListItem {
  alumnoId: number;
  nombre: string;
  rut: string;
  tallerId: number;
  inscrito: boolean;
  estadoInscripcion?: string;
  altura: number | null;
  peso: number | null;
  porcentajeGrasa: number | null;
  sedentario: boolean | null;
}

/** Lógica de negocio para fichas de alumnos vinculadas a talleres. */
@Injectable()
export class FichaAlumnoService {
  constructor(
    @InjectRepository(FichaAlumnoTaller)
    private fichaRepo: Repository<FichaAlumnoTaller>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    @InjectRepository(InscripcionTaller)
    private inscripcionRepo: Repository<InscripcionTaller>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
  ) {}

  /**
   * Directiva: todos los estudiantes del taller (ficha por taller) o solo inscritos aceptados.
   * Profesor: siempre solo inscritos ACEPTADOS en su taller.
   */
  async listarPorTaller(
    tallerId: number,
    opts: { soloInscritos?: boolean; esCoordinacion?: boolean; profesorId?: number },
  ): Promise<FichaAlumnoListItem[]> {
    const { soloInscritos = false, esCoordinacion = false, profesorId } = opts;

    // Profesor: debe pertenecer al taller pedido
    if (!esCoordinacion && profesorId) {
      const profesor = await this.profesorRepo.findOne({ where: { id: profesorId } });
      if (!profesor || profesor.tallerId !== tallerId) {
        throw new ForbiddenException('Solo puedes ver fichas de alumnos inscritos en tu taller');
      }
      return this.listarInscritosAceptados(tallerId);
    }

    if (soloInscritos) {
      return this.listarInscritosAceptados(tallerId);
    }

    return this.listarTodosAlumnosConFicha(tallerId);
  }

  /** Todos los estudiantes del sistema con su ficha en el taller seleccionado. */
  private async listarTodosAlumnosConFicha(tallerId: number): Promise<FichaAlumnoListItem[]> {
    const alumnos = await this.alumnoRepo.find({ order: { nombre: 'ASC' } });
    const fichas = await this.fichaRepo.find({ where: { tallerId }, relations: ['alumno'] });
    const inscripciones = await this.inscripcionRepo.find({ where: { tallerId } });

    // Mapas para lookup O(1) al armar cada fila
    const fichaMap = new Map(fichas.map((f) => [f.alumnoId, f]));
    const inscMap = new Map(inscripciones.map((i) => [i.alumnoId, i]));

    return alumnos.map((a) => {
      const f = fichaMap.get(a.id);
      const ins = inscMap.get(a.id);
      return this.toItem(a, tallerId, f, ins);
    });
  }

  /** Solo alumnos con inscripción ACEPTADA en el taller. */
  private async listarInscritosAceptados(tallerId: number): Promise<FichaAlumnoListItem[]> {
    const inscripciones = await this.inscripcionRepo.find({
      where: { tallerId, estado: 'ACEPTADO' },
      relations: ['alumno'],
      order: { createdAt: 'ASC' },
    });

    const fichas = await this.fichaRepo.find({ where: { tallerId } });
    const fichaMap = new Map(fichas.map((f) => [f.alumnoId, f]));

    return inscripciones
      .filter((i) => i.alumno)
      .map((ins) => {
        const f = fichaMap.get(ins.alumnoId);
        return this.toItem(ins.alumno, tallerId, f, ins);
      });
  }

  /**
   * Une alumno + ficha + inscripción en un DTO de respuesta.
   * Prioridad de medidas: ficha > inscripción > null.
   */
  private toItem(
    alumno: Alumno,
    tallerId: number,
    ficha?: FichaAlumnoTaller,
    inscripcion?: InscripcionTaller,
  ): FichaAlumnoListItem {
    const inscrito = inscripcion?.estado === 'ACEPTADO';
    return {
      alumnoId: alumno.id,
      nombre: alumno.nombre,
      rut: alumno.rut,
      tallerId,
      inscrito,
      estadoInscripcion: inscripcion?.estado,
      altura: ficha?.altura ?? inscripcion?.altura ?? null,
      peso: ficha?.peso ?? inscripcion?.peso ?? null,
      porcentajeGrasa: ficha?.porcentajeGrasa ?? inscripcion?.porcentajeGrasa ?? null,
      sedentario: ficha?.sedentario ?? inscripcion?.sedentario ?? null,
    };
  }

  /** Obtiene la ficha de un alumno en un taller, combinando datos de inscripción si existen. */
  async obtener(alumnoId: number, tallerId: number): Promise<FichaAlumnoListItem> {
    const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    const ficha = await this.fichaRepo.findOne({ where: { alumnoId, tallerId } });
    const inscripcion = await this.inscripcionRepo.findOne({ where: { alumnoId, tallerId } });
    return this.toItem(alumno, tallerId, ficha ?? undefined, inscripcion ?? undefined);
  }

  /**
   * Última ficha física conocida del alumno (cualquier taller deportivo).
   * Sirve para reutilizar altura/peso/%grasa/sedentario al inscribirse en otro deporte.
   */
  async obtenerUltimaDelAlumno(alumnoId: number): Promise<{
    encontrada: boolean;
    altura?: number;
    peso?: number;
    porcentajeGrasa?: number;
    sedentario?: boolean;
    tallerId?: number | null;
    fuente?: 'ficha' | 'inscripcion';
  }> {
    const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const completo = (
      altura: unknown,
      peso: unknown,
      porcentajeGrasa: unknown,
    ): boolean =>
      altura != null &&
      peso != null &&
      porcentajeGrasa != null &&
      !Number.isNaN(Number(altura)) &&
      !Number.isNaN(Number(peso)) &&
      !Number.isNaN(Number(porcentajeGrasa));

    const fichas = await this.fichaRepo.find({
      where: { alumnoId },
      order: { updatedAt: 'DESC' },
    });
    for (const f of fichas) {
      if (completo(f.altura, f.peso, f.porcentajeGrasa)) {
        return {
          encontrada: true,
          altura: Number(f.altura),
          peso: Number(f.peso),
          porcentajeGrasa: Number(f.porcentajeGrasa),
          sedentario: f.sedentario ?? false,
          tallerId: f.tallerId,
          fuente: 'ficha',
        };
      }
    }

    const inscripciones = await this.inscripcionRepo.find({
      where: { alumnoId },
      order: { createdAt: 'DESC' },
    });
    for (const i of inscripciones) {
      if (completo(i.altura, i.peso, i.porcentajeGrasa)) {
        return {
          encontrada: true,
          altura: Number(i.altura),
          peso: Number(i.peso),
          porcentajeGrasa: Number(i.porcentajeGrasa),
          sedentario: i.sedentario ?? false,
          tallerId: i.tallerId,
          fuente: 'inscripcion',
        };
      }
    }

    return { encontrada: false };
  }

  /** Crea o actualiza la ficha antropométrica (upsert manual). */
  async guardar(alumnoId: number, tallerId: number, dto: ActualizarFichaAlumnoDto): Promise<FichaAlumnoTaller> {
    let ficha = await this.fichaRepo.findOne({ where: { alumnoId, tallerId } });
    if (!ficha) {
      ficha = this.fichaRepo.create({ alumnoId, tallerId });
    }
    // Solo sobrescribe campos enviados (parcial)
    if (dto.altura != null) ficha.altura = dto.altura;
    if (dto.peso != null) ficha.peso = dto.peso;
    if (dto.porcentajeGrasa != null) ficha.porcentajeGrasa = dto.porcentajeGrasa;
    if (dto.sedentario != null) ficha.sedentario = dto.sedentario;
    return this.fichaRepo.save(ficha);
  }
}
