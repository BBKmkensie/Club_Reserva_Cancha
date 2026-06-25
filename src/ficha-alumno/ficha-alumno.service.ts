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

  /** Todos los estudiantes del sistema con su ficha en el taller seleccionado */
  private async listarTodosAlumnosConFicha(tallerId: number): Promise<FichaAlumnoListItem[]> {
    const alumnos = await this.alumnoRepo.find({ order: { nombre: 'ASC' } });
    const fichas = await this.fichaRepo.find({ where: { tallerId }, relations: ['alumno'] });
    const inscripciones = await this.inscripcionRepo.find({ where: { tallerId } });

    const fichaMap = new Map(fichas.map((f) => [f.alumnoId, f]));
    const inscMap = new Map(inscripciones.map((i) => [i.alumnoId, i]));

    return alumnos.map((a) => {
      const f = fichaMap.get(a.id);
      const ins = inscMap.get(a.id);
      return this.toItem(a, tallerId, f, ins);
    });
  }

  /** Solo alumnos con inscripción ACEPTADA en el taller */
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

  async obtener(alumnoId: number, tallerId: number): Promise<FichaAlumnoListItem> {
    const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    const ficha = await this.fichaRepo.findOne({ where: { alumnoId, tallerId } });
    const inscripcion = await this.inscripcionRepo.findOne({ where: { alumnoId, tallerId } });
    return this.toItem(alumno, tallerId, ficha ?? undefined, inscripcion ?? undefined);
  }

  async guardar(alumnoId: number, tallerId: number, dto: ActualizarFichaAlumnoDto): Promise<FichaAlumnoTaller> {
    let ficha = await this.fichaRepo.findOne({ where: { alumnoId, tallerId } });
    if (!ficha) {
      ficha = this.fichaRepo.create({ alumnoId, tallerId });
    }
    if (dto.altura != null) ficha.altura = dto.altura;
    if (dto.peso != null) ficha.peso = dto.peso;
    if (dto.porcentajeGrasa != null) ficha.porcentajeGrasa = dto.porcentajeGrasa;
    if (dto.sedentario != null) ficha.sedentario = dto.sedentario;
    return this.fichaRepo.save(ficha);
  }
}
