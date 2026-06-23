import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { CreateInscripcionTallerDto } from '../dto/create-inscripcion-taller.dto';
import { ResponderInscripcionTallerDto } from '../dto/responder-inscripcion-taller.dto';
import { ActualizarFichaAlumnoDto } from '../dto/ficha-alumno.dto';
import { NotificacionService } from '../notificacion/notificacion.service';
import { PeriodoService } from '../periodo/periodo.service';

export interface ValidacionInscripcion {
  puedeInscribirse: boolean;
  cuposOcupados: number;
  cuposDisponibles: number;
  capacidad: number;
  conflictoHorario: boolean;
  tallerConflicto?: string;
  motivo?: string;
}

@Injectable()
export class InscripcionTallerService {
  constructor(
    @InjectRepository(InscripcionTaller)
    private repo: Repository<InscripcionTaller>,
    @InjectRepository(Taller)
    private tallerRepo: Repository<Taller>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    private notificacionService: NotificacionService,
    private periodoService: PeriodoService,
  ) {}

  async validar(alumnoId: number, tallerId: number): Promise<ValidacionInscripcion> {
    const taller = await this.tallerRepo.findOne({ where: { id: tallerId } });
    if (!taller) {
      throw new NotFoundException('Taller no encontrado');
    }

    if (taller.estado !== 'PUBLICADO') {
      return {
        puedeInscribirse: false,
        cuposOcupados: 0,
        cuposDisponibles: 0,
        capacidad: taller.capacidad,
        conflictoHorario: false,
        motivo: 'Esta actividad aún no está publicada en el catálogo',
      };
    }

    const hoy = new Date().toISOString().split('T')[0];
    const periodo = await this.periodoService.getActivo();
    const msgPeriodo = this.periodoService.mensajePeriodoCerrado(periodo, hoy);
    if (msgPeriodo) {
      return {
        puedeInscribirse: false,
        cuposOcupados: 0,
        cuposDisponibles: 0,
        capacidad: taller.capacidad,
        conflictoHorario: false,
        motivo: msgPeriodo,
      };
    }
    const apertura = taller.fechaAperturaInscripcion
      ? new Date(taller.fechaAperturaInscripcion).toISOString().split('T')[0]
      : null;
    const cierre = taller.fechaCierreInscripcion
      ? new Date(taller.fechaCierreInscripcion).toISOString().split('T')[0]
      : null;
    if (apertura && hoy < apertura) {
      return {
        puedeInscribirse: false,
        cuposOcupados: 0,
        cuposDisponibles: 0,
        capacidad: taller.capacidad,
        conflictoHorario: false,
        motivo: 'El período de inscripción aún no ha abierto',
      };
    }
    if (cierre && hoy > cierre) {
      return {
        puedeInscribirse: false,
        cuposOcupados: 0,
        cuposDisponibles: 0,
        capacidad: taller.capacidad,
        conflictoHorario: false,
        motivo: 'El período de inscripción ya cerró',
      };
    }

    const existente = await this.repo.findOne({
      where: { alumnoId, tallerId },
    });
    if (existente?.estado === 'PENDIENTE') {
      return {
        puedeInscribirse: false,
        cuposOcupados: 0,
        cuposDisponibles: 0,
        capacidad: taller.capacidad,
        conflictoHorario: false,
        motivo: 'Ya tienes una solicitud pendiente para este taller',
      };
    }
    if (existente?.estado === 'ACEPTADO') {
      return {
        puedeInscribirse: false,
        cuposOcupados: 0,
        cuposDisponibles: 0,
        capacidad: taller.capacidad,
        conflictoHorario: false,
        motivo: 'Ya estás inscrito en este taller',
      };
    }

    const cuposOcupados = await this.contarCuposOcupados(tallerId);
    const cuposDisponibles = Math.max(0, taller.capacidad - cuposOcupados);
    const conflicto = await this.buscarConflictoHorario(alumnoId, taller);

    if (cuposDisponibles <= 0) {
      return {
        puedeInscribirse: false,
        cuposOcupados,
        cuposDisponibles: 0,
        capacidad: taller.capacidad,
        conflictoHorario: false,
        motivo: 'No hay cupos disponibles en este taller',
      };
    }

    if (conflicto) {
      return {
        puedeInscribirse: false,
        cuposOcupados,
        cuposDisponibles,
        capacidad: taller.capacidad,
        conflictoHorario: true,
        tallerConflicto: conflicto.tipo,
        motivo: `Conflicto de horario con el taller "${conflicto.tipo}"`,
      };
    }

    return {
      puedeInscribirse: true,
      cuposOcupados,
      cuposDisponibles,
      capacidad: taller.capacidad,
      conflictoHorario: false,
    };
  }

  async solicitar(dto: CreateInscripcionTallerDto): Promise<InscripcionTaller> {
    const alumno = await this.alumnoRepo.findOne({ where: { id: dto.alumnoId } });
    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }

    const validacion = await this.validar(dto.alumnoId, dto.tallerId);
    if (!validacion.puedeInscribirse) {
      throw new ConflictException(validacion.motivo ?? 'No puedes inscribirte en este taller');
    }

    const taller = await this.tallerRepo.findOne({ where: { id: dto.tallerId } });
    const existente = await this.repo.findOne({
      where: { alumnoId: dto.alumnoId, tallerId: dto.tallerId },
    });
    let guardada: InscripcionTaller;
    const datosFicha = {
      altura: dto.ficha.altura,
      peso: dto.ficha.peso,
      porcentajeGrasa: dto.ficha.porcentajeGrasa,
      sedentario: dto.ficha.sedentario,
    };

    if (existente?.estado === 'RECHAZADO') {
      existente.estado = 'PENDIENTE';
      Object.assign(existente, datosFicha);
      guardada = await this.repo.save(existente);
    } else {
      const inscripcion = this.repo.create({
        alumnoId: dto.alumnoId,
        tallerId: dto.tallerId,
        estado: 'PENDIENTE',
        ...datosFicha,
      });
      guardada = await this.repo.save(inscripcion);
    }

    await this.notificacionService.crear(
      dto.alumnoId,
      'Solicitud enviada',
      `Tu solicitud al taller "${taller?.tipo ?? 'taller'}" fue registrada. El profesor la revisará pronto.`,
    );
    return guardada;
  }

  async findByTaller(tallerId: number): Promise<InscripcionTaller[]> {
    return await this.repo.find({
      where: { tallerId },
      relations: ['alumno', 'taller'],
      order: { createdAt: 'DESC' },
    });
  }

  async getResumen(tallerId: number) {
    const taller = await this.tallerRepo.findOne({ where: { id: tallerId } });
    if (!taller) {
      throw new NotFoundException('Taller no encontrado');
    }

    const inscripciones = await this.findByTaller(tallerId);
    const pendientes = inscripciones.filter((i) => i.estado === 'PENDIENTE');
    const aceptados = inscripciones.filter((i) => i.estado === 'ACEPTADO');
    const rechazados = inscripciones.filter((i) => i.estado === 'RECHAZADO');
    const cuposOcupados = pendientes.length + aceptados.length;

    return {
      taller: {
        id: taller.id,
        tipo: taller.tipo,
        descripcion: taller.descripcion,
        capacidad: taller.capacidad,
        diaSemana: taller.diaSemana,
        horaInicio: taller.horaInicio,
        horaFin: taller.horaFin,
      },
      resumen: {
        total: inscripciones.length,
        pendientes: pendientes.length,
        aceptados: aceptados.length,
        rechazados: rechazados.length,
        cuposOcupados,
        cuposDisponibles: Math.max(0, taller.capacidad - cuposOcupados),
      },
      inscripciones,
    };
  }

  async findByAlumno(alumnoId: number): Promise<InscripcionTaller[]> {
    return await this.repo.find({
      where: { alumnoId },
      relations: ['taller', 'alumno'],
      order: { createdAt: 'DESC' },
    });
  }

  async actualizarFicha(id: number, dto: ActualizarFichaAlumnoDto): Promise<InscripcionTaller> {
    const inscripcion = await this.repo.findOne({
      where: { id },
      relations: ['alumno', 'taller'],
    });
    if (!inscripcion) {
      throw new NotFoundException('Inscripción no encontrada');
    }
    if (dto.altura != null) inscripcion.altura = dto.altura;
    if (dto.peso != null) inscripcion.peso = dto.peso;
    if (dto.porcentajeGrasa != null) inscripcion.porcentajeGrasa = dto.porcentajeGrasa;
    if (dto.sedentario != null) inscripcion.sedentario = dto.sedentario;
    return await this.repo.save(inscripcion);
  }

  async responder(
    id: number,
    dto: ResponderInscripcionTallerDto,
  ): Promise<InscripcionTaller> {
    const inscripcion = await this.repo.findOne({
      where: { id },
      relations: ['alumno', 'taller'],
    });
    if (!inscripcion) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (inscripcion.estado !== 'PENDIENTE') {
      throw new BadRequestException('Esta solicitud ya fue respondida');
    }

    if (dto.estado === 'ACEPTADO') {
      const cuposOcupados = await this.contarCuposOcupados(inscripcion.tallerId);
      if (cuposOcupados >= inscripcion.taller.capacidad) {
        throw new ConflictException('No hay cupos disponibles para aceptar esta solicitud');
      }
      const conflicto = await this.buscarConflictoHorario(
        inscripcion.alumnoId,
        inscripcion.taller,
        inscripcion.tallerId,
      );
      if (conflicto) {
        throw new ConflictException(
          `El alumno tiene conflicto de horario con el taller "${conflicto.tipo}"`,
        );
      }
      inscripcion.alumno.tallerId = inscripcion.tallerId;
      await this.alumnoRepo.save(inscripcion.alumno);
    }

    inscripcion.estado = dto.estado;
    const guardada = await this.repo.save(inscripcion);

    const nombreTaller = inscripcion.taller?.tipo ?? 'taller';
    if (dto.estado === 'ACEPTADO') {
      await this.notificacionService.crear(
        inscripcion.alumnoId,
        'Inscripción aceptada',
        `¡Felicitaciones! Fuiste aceptado en el taller "${nombreTaller}".`,
      );
    } else {
      await this.notificacionService.crear(
        inscripcion.alumnoId,
        'Inscripción rechazada',
        `Tu solicitud al taller "${nombreTaller}" fue rechazada. Puedes intentar con otro taller.`,
      );
    }
    return guardada;
  }

  private async contarCuposOcupados(tallerId: number): Promise<number> {
    return await this.repo.count({
      where: {
        tallerId,
        estado: In(['PENDIENTE', 'ACEPTADO']),
      },
    });
  }

  private async buscarConflictoHorario(
    alumnoId: number,
    tallerDestino: Taller,
    excluirTallerId?: number,
  ): Promise<Taller | null> {
    if (
      tallerDestino.diaSemana == null ||
      !tallerDestino.horaInicio ||
      !tallerDestino.horaFin
    ) {
      return null;
    }

    const inscripciones = await this.repo.find({
      where: {
        alumnoId,
        estado: In(['PENDIENTE', 'ACEPTADO']),
      },
      relations: ['taller'],
    });

    for (const insc of inscripciones) {
      if (excluirTallerId && insc.tallerId === excluirTallerId) continue;
      const otro = insc.taller;
      if (
        otro?.diaSemana == null ||
        !otro.horaInicio ||
        !otro.horaFin
      ) {
        continue;
      }
      if (this.horariosSeSolapan(tallerDestino, otro)) {
        return otro;
      }
    }
    return null;
  }

  private horariosSeSolapan(a: Taller, b: Taller): boolean {
    if (a.diaSemana !== b.diaSemana) return false;
    const inicioA = this.normalizarHora(a.horaInicio!);
    const finA = this.normalizarHora(a.horaFin!);
    const inicioB = this.normalizarHora(b.horaInicio!);
    const finB = this.normalizarHora(b.horaFin!);
    return inicioA < finB && inicioB < finA;
  }

  private normalizarHora(hora: string): string {
    return hora.length >= 5 ? hora.slice(0, 5) : hora;
  }
}
