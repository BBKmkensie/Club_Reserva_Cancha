import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Salida } from '../entities/salida.entity';
import { Profesor } from '../entities/profesor.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { CreateSalidaDto } from '../dto/create-salida.dto';
import { AsignarSalidaDto } from '../dto/asignar-salida.dto';
import { ProponerSalidaDto } from '../dto/proponer-salida.dto';
import { ResponderSalidaDto } from '../dto/responder-salida.dto';
import { AbrirSalidaDto } from '../dto/abrir-salida.dto';
import { CerrarSalidaDto } from '../dto/cerrar-salida.dto';
import { ESTADOS_SALIDA_VISIBLES_ESTUDIANTE } from './salida.types';
import { fechaLocal } from '../reserva/cancha.constants';

@Injectable()
export class SalidaService {
  constructor(
    @InjectRepository(Salida)
    private salidaRepository: Repository<Salida>,
    @InjectRepository(Profesor)
    private profesorRepository: Repository<Profesor>,
    @InjectRepository(Taller)
    private tallerRepository: Repository<Taller>,
    @InjectRepository(Alumno)
    private alumnoRepository: Repository<Alumno>,
    @InjectRepository(InscripcionTaller)
    private inscripcionTallerRepository: Repository<InscripcionTaller>,
  ) {}

  private relaciones = ['taller', 'admin', 'profesor'] as const;

  private async validarTallerYProfesor(tallerId: number, profesorId: number): Promise<void> {
    const taller = await this.tallerRepository.findOne({ where: { id: tallerId } });
    if (!taller) throw new NotFoundException('Taller no encontrado');
    const profesor = await this.profesorRepository.findOne({ where: { id: profesorId } });
    if (!profesor) throw new NotFoundException('Profesor no encontrado');
  }

  /** Directiva asigna partido/salida a un profesor */
  async asignarDirectiva(dto: AsignarSalidaDto): Promise<Salida> {
    await this.validarTallerYProfesor(dto.tallerId, dto.profesorId);
    const salida = this.salidaRepository.create({
      destino: dto.destino,
      fecha: fechaLocal(dto.fecha),
      hora: dto.hora ?? undefined,
      descripcion: dto.descripcion ?? undefined,
      tallerId: dto.tallerId,
      profesorId: dto.profesorId,
      adminId: dto.adminId ?? undefined,
      origen: 'ASIGNACION_DIRECTIVA',
      estado: 'PENDIENTE_PROFESOR',
    } as Partial<Salida>);
    return this.salidaRepository.save(salida);
  }

  /** Profesor propone partido/salida */
  async proponerProfesor(dto: ProponerSalidaDto): Promise<Salida> {
    await this.validarTallerYProfesor(dto.tallerId, dto.profesorId);
    const salida = this.salidaRepository.create({
      destino: dto.destino,
      fecha: fechaLocal(dto.fecha),
      hora: dto.hora ?? undefined,
      descripcion: dto.descripcion ?? undefined,
      tallerId: dto.tallerId,
      profesorId: dto.profesorId,
      adminId: undefined,
      origen: 'PROPUESTA_PROFESOR',
      estado: 'PENDIENTE_DIRECTIVA',
    } as Partial<Salida>);
    return this.salidaRepository.save(salida);
  }

  /** Aceptar o rechazar según el estado pendiente */
  async responder(id: number, dto: ResponderSalidaDto, actor: 'profesor' | 'directiva', actorId?: number): Promise<Salida> {
    const salida = await this.findOne(id);

    if (salida.estado === 'PENDIENTE_PROFESOR') {
      if (actor !== 'profesor') throw new ForbiddenException('Solo el profesor asignado puede responder');
      if (actorId && salida.profesorId !== actorId) {
        throw new ForbiddenException('No eres el profesor asignado a esta salida');
      }
    } else if (salida.estado === 'PENDIENTE_DIRECTIVA') {
      if (actor !== 'directiva') throw new ForbiddenException('Solo la directiva puede responder esta propuesta');
    } else {
      throw new BadRequestException('Esta salida no está pendiente de aprobación');
    }

    if (dto.acepta) {
      salida.estado = 'PUBLICADA';
      salida.motivoRechazo = null;
    } else {
      salida.estado = 'RECHAZADA';
      salida.motivoRechazo = dto.motivo?.trim() || 'Rechazada';
    }
    salida.fechaRespuesta = new Date();
    return this.salidaRepository.save(salida);
  }

  /** Profesor abre la salida el día del evento */
  async abrir(id: number, profesorId: number, dto: AbrirSalidaDto): Promise<Salida> {
    const salida = await this.findOne(id);
    if (salida.profesorId !== profesorId) {
      throw new ForbiddenException('Solo el profesor responsable puede abrir esta salida');
    }
    if (salida.estado !== 'PUBLICADA') {
      throw new BadRequestException('Solo se pueden abrir salidas publicadas y aceptadas');
    }
    salida.estado = 'EN_CURSO';
    salida.comentarioApertura = dto.comentario?.trim() || null;
    salida.fechaApertura = new Date();
    return this.salidaRepository.save(salida);
  }

  /** Profesor cierra con éxito/fracaso y comentario */
  async cerrar(id: number, profesorId: number, dto: CerrarSalidaDto): Promise<Salida> {
    const salida = await this.findOne(id);
    if (salida.profesorId !== profesorId) {
      throw new ForbiddenException('Solo el profesor responsable puede cerrar esta salida');
    }
    if (salida.estado !== 'EN_CURSO') {
      throw new BadRequestException('Debe abrir la salida antes de cerrarla');
    }
    salida.estado = 'CERRADA';
    salida.resultado = dto.resultado;
    salida.comentarioCierre = dto.comentario.trim();
    salida.fechaCierre = new Date();
    return this.salidaRepository.save(salida);
  }

  async create(createSalidaDto: CreateSalidaDto): Promise<Salida> {
    const salida = this.salidaRepository.create({
      destino: createSalidaDto.destino,
      fecha: fechaLocal(createSalidaDto.fecha),
      hora: createSalidaDto.hora ?? undefined,
      descripcion: createSalidaDto.descripcion ?? undefined,
      tallerId: createSalidaDto.tallerId,
      adminId: createSalidaDto.adminId ?? undefined,
      profesorId: createSalidaDto.profesorId ?? undefined,
      origen: createSalidaDto.adminId ? 'ASIGNACION_DIRECTIVA' : 'PROPUESTA_PROFESOR',
      estado: 'PUBLICADA',
    } as Partial<Salida>);
    return this.salidaRepository.save(salida);
  }

  async findAll(): Promise<Salida[]> {
    return this.salidaRepository.find({
      relations: [...this.relaciones],
      order: { fecha: 'DESC', hora: 'ASC' },
    });
  }

  /** Salidas visibles para estudiantes (aprobadas) */
  async findPublicadas(tallerId?: number): Promise<Salida[]> {
    const where: any = { estado: In(ESTADOS_SALIDA_VISIBLES_ESTUDIANTE) };
    if (tallerId) where.tallerId = tallerId;
    return this.salidaRepository.find({
      where,
      relations: [...this.relaciones],
      order: { fecha: 'ASC', hora: 'ASC' },
    });
  }

  /** Salidas publicadas solo de talleres donde el alumno está inscrito (ACEPTADO) */
  async findPublicadasParaAlumno(alumnoId: number): Promise<Salida[]> {
    const tallerIds = await this.talleresInscritosAlumno(alumnoId);
    if (!tallerIds.length) return [];

    return this.salidaRepository.find({
      where: {
        estado: In(ESTADOS_SALIDA_VISIBLES_ESTUDIANTE),
        tallerId: In(tallerIds),
      },
      relations: [...this.relaciones],
      order: { fecha: 'ASC', hora: 'ASC' },
    });
  }

  /** Talleres con inscripción ACEPTADA (o taller principal del alumno) */
  async talleresInscritosAlumno(alumnoId: number): Promise<number[]> {
    const inscripciones = await this.inscripcionTallerRepository.find({
      where: { alumnoId, estado: 'ACEPTADO' },
    });
    const ids = new Set(inscripciones.map((i) => i.tallerId));

    const alumno = await this.alumnoRepository.findOne({ where: { id: alumnoId } });
    if (alumno?.tallerId) ids.add(alumno.tallerId);

    return [...ids];
  }

  async alumnoPuedeVerSalidas(alumnoId: number): Promise<boolean> {
    const ids = await this.talleresInscritosAlumno(alumnoId);
    return ids.length > 0;
  }

  async findPendientesProfesor(profesorId: number): Promise<Salida[]> {
    return this.salidaRepository.find({
      where: { profesorId, estado: 'PENDIENTE_PROFESOR' },
      relations: [...this.relaciones],
      order: { fecha: 'ASC' },
    });
  }

  async findPendientesDirectiva(): Promise<Salida[]> {
    return this.salidaRepository.find({
      where: { estado: 'PENDIENTE_DIRECTIVA' },
      relations: [...this.relaciones],
      order: { fecha: 'ASC' },
    });
  }

  async findByProfesor(profesorId: number): Promise<Salida[]> {
    return this.salidaRepository.find({
      where: { profesorId },
      relations: [...this.relaciones],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Salida> {
    const salida = await this.salidaRepository.findOne({
      where: { id },
      relations: [...this.relaciones],
    });
    if (!salida) throw new NotFoundException(`Salida con ID ${id} no encontrada`);
    return salida;
  }

  async findByTaller(tallerId: number): Promise<Salida[]> {
    return this.salidaRepository.find({
      where: { tallerId },
      relations: [...this.relaciones],
      order: { fecha: 'DESC' },
    });
  }

  async update(id: number, updateSalidaDto: Partial<CreateSalidaDto>): Promise<Salida> {
    const salida = await this.findOne(id);
    if (updateSalidaDto.fecha) {
      salida.fecha = fechaLocal(updateSalidaDto.fecha);
    }
    Object.assign(salida, {
      destino: updateSalidaDto.destino ?? salida.destino,
      hora: updateSalidaDto.hora ?? salida.hora,
      descripcion: updateSalidaDto.descripcion ?? salida.descripcion,
      tallerId: updateSalidaDto.tallerId ?? salida.tallerId,
    });
    return this.salidaRepository.save(salida);
  }

  async remove(id: number): Promise<void> {
    const salida = await this.findOne(id);
    await this.salidaRepository.remove(salida);
  }

  /** Etiqueta legible del origen y aprobación */
  etiquetaFlujo(s: Salida): string {
    if (s.estado === 'RECHAZADA') return 'Rechazada';
    if (s.estado === 'PENDIENTE_PROFESOR') {
      return 'Asignada por directiva · pendiente de aceptación del profesor';
    }
    if (s.estado === 'PENDIENTE_DIRECTIVA') {
      return `Propuesta por ${s.profesor?.nombre ?? 'profesor'} · pendiente de directiva`;
    }
    if (s.origen === 'ASIGNACION_DIRECTIVA') {
      return `Asignada por directiva · aceptada por ${s.profesor?.nombre ?? 'profesor'}`;
    }
    return `Propuesta por ${s.profesor?.nombre ?? 'profesor'} · aceptada por directiva`;
  }
}
