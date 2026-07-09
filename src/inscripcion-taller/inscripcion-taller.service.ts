/**
 * Servicio de inscripciones a talleres.
 * Valida cupos y conflictos de horario, gestiona solicitudes, propuestas de directiva
 * y notificaciones a alumnos, profesores y apoderados.
 */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { CreateInscripcionTallerDto } from '../dto/create-inscripcion-taller.dto';
import { ResponderInscripcionTallerDto } from '../dto/responder-inscripcion-taller.dto';
import { ActualizarFichaAlumnoDto } from '../dto/ficha-alumno.dto';
import { ProponerInscripcionDirectivaDto } from '../dto/proponer-inscripcion-directiva.dto';
import { ProponerActividadLibreDto } from '../dto/proponer-actividad-libre.dto';
import { ResponderPropuestaInscripcionDto } from '../dto/responder-propuesta-inscripcion.dto';
import { PropuestaInscripcionTaller } from '../entities/propuesta-inscripcion-taller.entity';
import { TallerHorario } from '../entities/taller-horario.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { PeriodoService } from '../periodo/periodo.service';
import { MailService } from '../mail/mail.service';
import {
  opcionesHorarioTaller,
  textoHorarioBloque,
  textoHorarioPorId,
  textoHorarioTaller,
} from '../common/taller-horario.util';

/** Resultado de la validación previa a inscribirse en un taller. */
export interface ValidacionInscripcion {
  puedeInscribirse: boolean;
  cuposOcupados: number;
  cuposDisponibles: number;
  capacidad: number;
  conflictoHorario: boolean;
  sinCupo?: boolean;
  tallerConflicto?: string;
  motivo?: string;
  advertencias?: string[];
  tieneProfesor?: boolean;
  cantidadOtrasInscripciones?: number;
}

/** Lógica de negocio para solicitudes e inscripciones de alumnos en talleres. */
@Injectable()
export class InscripcionTallerService {
  constructor(
    @InjectRepository(InscripcionTaller)
    private repo: Repository<InscripcionTaller>,
    @InjectRepository(Taller)
    private tallerRepo: Repository<Taller>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
    @InjectRepository(PropuestaInscripcionTaller)
    private propuestaRepo: Repository<PropuestaInscripcionTaller>,
    @InjectRepository(TallerHorario)
    private tallerHorarioRepo: Repository<TallerHorario>,
    private notificacionService: NotificacionService,
    private periodoService: PeriodoService,
    private mailService: MailService,
    private dataSource: DataSource,
  ) {}

  /**
   * Evalúa si un alumno puede inscribirse: período, cupos, conflicto horario y advertencias.
   * Opcionalmente notifica bloqueos (conflicto o sin cupo).
   */
  async validar(
    alumnoId: number,
    tallerId: number,
    notificar = false,
  ): Promise<ValidacionInscripcion> {
    const taller = await this.tallerRepo.findOne({
      where: { id: tallerId },
      relations: ['profesores'],
    });
    if (!taller) {
      throw new NotFoundException('Taller no encontrado');
    }

    if (taller.estado !== 'PUBLICADO') {
      return this.conAdvertencias(
        {
          puedeInscribirse: false,
          cuposOcupados: 0,
          cuposDisponibles: 0,
          capacidad: taller.capacidad,
          conflictoHorario: false,
          motivo: 'Esta actividad aún no está publicada en el catálogo',
        },
        alumnoId,
        tallerId,
        taller,
      );
    }

    const hoy = new Date().toISOString().split('T')[0];
    const periodo = await this.periodoService.getActivo();
    const msgPeriodo = this.periodoService.mensajePeriodoCerrado(periodo, hoy);
    if (msgPeriodo) {
      return this.conAdvertencias(
        {
          puedeInscribirse: false,
          cuposOcupados: 0,
          cuposDisponibles: 0,
          capacidad: taller.capacidad,
          conflictoHorario: false,
          motivo: msgPeriodo,
        },
        alumnoId,
        tallerId,
        taller,
      );
    }
    const apertura = taller.fechaAperturaInscripcion
      ? new Date(taller.fechaAperturaInscripcion).toISOString().split('T')[0]
      : null;
    const cierre = taller.fechaCierreInscripcion
      ? new Date(taller.fechaCierreInscripcion).toISOString().split('T')[0]
      : null;
    if (apertura && hoy < apertura) {
      return this.conAdvertencias(
        {
          puedeInscribirse: false,
          cuposOcupados: 0,
          cuposDisponibles: 0,
          capacidad: taller.capacidad,
          conflictoHorario: false,
          motivo: 'El período de inscripción aún no ha abierto',
        },
        alumnoId,
        tallerId,
        taller,
      );
    }
    if (cierre && hoy > cierre) {
      return this.conAdvertencias(
        {
          puedeInscribirse: false,
          cuposOcupados: 0,
          cuposDisponibles: 0,
          capacidad: taller.capacidad,
          conflictoHorario: false,
          motivo: 'El período de inscripción ya cerró',
        },
        alumnoId,
        tallerId,
        taller,
      );
    }

    const existente = await this.repo.findOne({
      where: { alumnoId, tallerId },
    });
    if (existente?.estado === 'PENDIENTE') {
      return this.conAdvertencias(
        {
          puedeInscribirse: false,
          cuposOcupados: 0,
          cuposDisponibles: 0,
          capacidad: taller.capacidad,
          conflictoHorario: false,
          motivo: 'Ya tienes una solicitud pendiente para este taller',
        },
        alumnoId,
        tallerId,
        taller,
      );
    }
    if (existente?.estado === 'ACEPTADO') {
      return this.conAdvertencias(
        {
          puedeInscribirse: false,
          cuposOcupados: 0,
          cuposDisponibles: 0,
          capacidad: taller.capacidad,
          conflictoHorario: false,
          motivo: 'Ya estás inscrito en este taller',
        },
        alumnoId,
        tallerId,
        taller,
      );
    }

    const cuposOcupados = await this.contarCuposOcupados(tallerId);
    const cuposDisponibles = Math.max(0, taller.capacidad - cuposOcupados);
    const conflicto = await this.buscarConflictoHorario(alumnoId, taller);

    // Diagrama BPMN: primero conflicto horario, luego cupos
    if (conflicto) {
      const resultado: ValidacionInscripcion = {
        puedeInscribirse: false,
        cuposOcupados,
        cuposDisponibles,
        capacidad: taller.capacidad,
        conflictoHorario: true,
        tallerConflicto: conflicto.tipo,
        motivo: `Conflicto de horario con el taller "${conflicto.tipo}"`,
      };
      if (notificar) await this.notificarBloqueoInscripcion(alumnoId, resultado, taller.tipo);
      return this.conAdvertencias(resultado, alumnoId, tallerId, taller);
    }

    if (cuposDisponibles <= 0) {
      const resultado: ValidacionInscripcion = {
        puedeInscribirse: false,
        cuposOcupados,
        cuposDisponibles: 0,
        capacidad: taller.capacidad,
        conflictoHorario: false,
        sinCupo: true,
        motivo: 'No hay cupos disponibles en este taller',
      };
      if (notificar) await this.notificarBloqueoInscripcion(alumnoId, resultado, taller.tipo);
      return this.conAdvertencias(resultado, alumnoId, tallerId, taller);
    }

    return this.conAdvertencias(
      {
        puedeInscribirse: true,
        cuposOcupados,
        cuposDisponibles,
        capacidad: taller.capacidad,
        conflictoHorario: false,
      },
      alumnoId,
      tallerId,
      taller,
    );
  }

  private async conAdvertencias(
    base: ValidacionInscripcion,
    alumnoId: number,
    tallerId: number,
    taller: Taller,
  ): Promise<ValidacionInscripcion> {
    const meta = await this.obtenerMetaAdvertencias(alumnoId, tallerId, taller);
    return {
      ...base,
      advertencias: meta.advertencias,
      tieneProfesor: meta.tieneProfesor,
      cantidadOtrasInscripciones: meta.cantidadOtrasInscripciones,
    };
  }

  private async obtenerMetaAdvertencias(
    alumnoId: number,
    tallerId: number,
    taller: Taller,
  ): Promise<{
    advertencias: string[];
    tieneProfesor: boolean;
    cantidadOtrasInscripciones: number;
  }> {
    const advertencias: string[] = [];

    const otrasInscripciones = await this.repo.find({
      where: { alumnoId, estado: In(['PENDIENTE', 'ACEPTADO']) },
      relations: ['taller'],
    });
    const otras = otrasInscripciones.filter((i) => i.tallerId !== tallerId);
    if (otras.length > 0) {
      const nombres = otras
        .map((i) => `"${i.taller?.tipo ?? 'otro taller'}"`)
        .join(', ');
      advertencias.push(
        `Ya tienes solicitud o inscripción activa en ${nombres}. Si te inscribes en más de un taller, debes cumplir con tus deberes de estudiante: asistencia, evaluaciones y responsabilidades en el aula.`,
      );
    }

    const tieneProfesor = (taller.profesores?.length ?? 0) > 0;
    if (!tieneProfesor) {
      advertencias.push(
        'Este taller aún no tiene profesor asignado. Tu solicitud podrá quedar en espera hasta que la directiva confirme un docente.',
      );
    }

    return {
      advertencias,
      tieneProfesor,
      cantidadOtrasInscripciones: otras.length,
    };
  }

  private async notificarBloqueoInscripcion(
    alumnoId: number,
    validacion: ValidacionInscripcion,
    tallerNombre: string,
  ): Promise<void> {
    if (validacion.conflictoHorario) {
      await this.notificacionService.crear(
        alumnoId,
        'Conflicto de horario',
        `No puedes inscribirte en "${tallerNombre}" porque coincide con el horario del taller "${validacion.tallerConflicto}".`,
        'inscripcion_conflicto',
      );
      return;
    }
    if (validacion.sinCupo) {
      await this.notificacionService.crear(
        alumnoId,
        'Sin cupos disponibles',
        `No hay cupos disponibles en el taller "${tallerNombre}". Puedes intentar con otra actividad.`,
        'inscripcion_sin_cupo',
      );
    }
  }

  /** Registra solicitud PENDIENTE con ficha antropométrica del alumno. */
  async solicitar(dto: CreateInscripcionTallerDto): Promise<InscripcionTaller> {
    const alumno = await this.alumnoRepo.findOne({ where: { id: dto.alumnoId } });
    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }

    const validacion = await this.validar(dto.alumnoId, dto.tallerId);
    const taller = await this.tallerRepo.findOne({ where: { id: dto.tallerId } });
    if (!validacion.puedeInscribirse) {
      await this.notificarBloqueoInscripcion(
        dto.alumnoId,
        validacion,
        taller?.tipo ?? 'taller',
      );
      throw new ConflictException(validacion.motivo ?? 'No puedes inscribirte en este taller');
    }

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

  /** El profesor acepta o rechaza una solicitud pendiente. */
  async responder(
    id: number,
    dto: ResponderInscripcionTallerDto,
  ): Promise<InscripcionTaller> {
    if (dto.estado === 'RECHAZADO') {
      return this.responderRechazo(id);
    }
    return this.responderAceptacionTransaccional(id);
  }

  private async responderRechazo(id: number): Promise<InscripcionTaller> {
    const inscripcion = await this.repo.findOne({
      where: { id },
      relations: ['alumno', 'taller'],
    });
    if (!inscripcion) throw new NotFoundException('Solicitud no encontrada');
    if (inscripcion.estado !== 'PENDIENTE') {
      throw new BadRequestException('Esta solicitud ya fue respondida');
    }

    inscripcion.estado = 'RECHAZADO';
    const guardada = await this.repo.save(inscripcion);
    const nombreTaller = inscripcion.taller?.tipo ?? 'taller';
    await this.notificacionService.crear(
      inscripcion.alumnoId,
      'Inscripción rechazada',
      `Tu solicitud al taller "${nombreTaller}" fue rechazada. Puedes intentar con otro taller.`,
    );
    return guardada;
  }

  /** Aceptación con bloqueo pesimista del taller para evitar sobre-cupo concurrente. */
  private async responderAceptacionTransaccional(id: number): Promise<InscripcionTaller> {
    const guardada = await this.dataSource.transaction(async (manager) => {
      const inscripcion = await manager.findOne(InscripcionTaller, {
        where: { id },
        relations: ['alumno', 'taller'],
      });
      if (!inscripcion) throw new NotFoundException('Solicitud no encontrada');
      if (inscripcion.estado !== 'PENDIENTE') {
        throw new BadRequestException('Esta solicitud ya fue respondida');
      }

      const taller = await manager.findOne(Taller, {
        where: { id: inscripcion.tallerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!taller) throw new NotFoundException('Taller no encontrado');

      const aceptados = await manager.count(InscripcionTaller, {
        where: { tallerId: inscripcion.tallerId, estado: 'ACEPTADO' },
      });
      if (aceptados >= taller.capacidad) {
        throw new ConflictException('No hay cupos disponibles para aceptar esta solicitud');
      }

      const conflicto = await this.buscarConflictoHorario(
        inscripcion.alumnoId,
        inscripcion.taller,
        inscripcion.tallerId,
        manager,
      );
      if (conflicto) {
        throw new ConflictException(
          `El alumno tiene conflicto de horario con el taller "${conflicto.tipo}"`,
        );
      }

      inscripcion.estado = 'ACEPTADO';
      inscripcion.alumno.tallerId = inscripcion.tallerId;
      await manager.save(inscripcion.alumno);
      return manager.save(inscripcion);
    });

    const nombreTaller = guardada.taller?.tipo ?? 'taller';
    await this.notificacionService.crear(
      guardada.alumnoId,
      'Inscripción aceptada',
      `¡Felicitaciones! Fuiste aceptado en el taller "${nombreTaller}".`,
    );
    await this.mailService.inscripcionTallerApoderado(
      guardada.alumno?.apoderadoEmail,
      guardada.alumno?.nombre ?? 'Alumno',
      nombreTaller,
      guardada.alumno?.apoderadoNombre,
      guardada.taller ? this.formatHorarioTaller(guardada.taller) : null,
    );
    return guardada;
  }

  /** El alumno cancela solicitud pendiente o se retira si ya estaba aceptado. */
  async retirarse(inscripcionId: number, alumnoId: number): Promise<{ ok: true }> {
    const inscripcion = await this.repo.findOne({
      where: { id: inscripcionId },
      relations: ['alumno', 'taller', 'taller.profesores'],
    });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
    if (inscripcion.alumnoId !== alumnoId) {
      throw new BadRequestException('No puedes retirar una inscripción de otro alumno');
    }
    if (inscripcion.estado === 'RECHAZADO') {
      throw new BadRequestException('No tienes una inscripción activa en este taller');
    }

    const nombreAlumno = inscripcion.alumno?.nombre ?? 'Un alumno';
    const nombreTaller = inscripcion.taller?.tipo ?? 'taller';
    const tallerId = inscripcion.tallerId;
    const eraAceptado = inscripcion.estado === 'ACEPTADO';

    await this.dataSource.transaction(async (manager) => {
      const ins = await manager.findOne(InscripcionTaller, {
        where: { id: inscripcionId },
        relations: ['alumno'],
      });
      if (!ins) throw new NotFoundException('Inscripción no encontrada');
      if (ins.alumnoId !== alumnoId) {
        throw new BadRequestException('No puedes retirar una inscripción de otro alumno');
      }
      if (ins.estado === 'RECHAZADO') {
        throw new BadRequestException('No tienes una inscripción activa en este taller');
      }

      if (ins.estado === 'ACEPTADO') {
        const alumno = await manager.findOne(Alumno, { where: { id: alumnoId } });
        if (alumno?.tallerId === ins.tallerId) {
          alumno.tallerId = null;
          await manager.save(alumno);
        }
      }
      await manager.remove(ins);
    });

    const profesores =
      inscripcion.taller?.profesores?.length
        ? inscripcion.taller.profesores
        : await this.profesorRepo.find({ where: { tallerId } });

    const mensajeProfesor = `${nombreAlumno} se ha retirado del taller "${nombreTaller}".`;
    for (const profesor of profesores) {
      await this.notificacionService.crearParaProfesor(
        profesor.id,
        'Alumno se retiró del taller',
        mensajeProfesor,
        'retiro_taller',
      );
    }

    const mensajeAlumno =
      eraAceptado
        ? `Te has retirado del taller "${nombreTaller}". Ya no estás inscrito.`
        : `Has cancelado tu solicitud al taller "${nombreTaller}".`;
    await this.notificacionService.crear(
      alumnoId,
      'Retiro confirmado',
      mensajeAlumno,
      'retiro_taller',
    );

    return { ok: true };
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
    manager?: EntityManager,
  ): Promise<Taller | null> {
    if (
      tallerDestino.diaSemana == null ||
      !tallerDestino.horaInicio ||
      !tallerDestino.horaFin
    ) {
      return null;
    }

    const inscripciones = manager
      ? await manager.find(InscripcionTaller, {
          where: { alumnoId, estado: In(['PENDIENTE', 'ACEPTADO']) },
          relations: ['taller'],
        })
      : await this.repo.find({
          where: { alumnoId, estado: In(['PENDIENTE', 'ACEPTADO']) },
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

  private formatHorarioTaller(taller: Taller): string | null {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    if (taller.diaSemana == null || !taller.horaInicio || !taller.horaFin) return null;
    return `${dias[taller.diaSemana]} ${this.normalizarHora(taller.horaInicio)} - ${this.normalizarHora(taller.horaFin)}`;
  }

  /** Apoderado/directiva propone inscripción con horario; notifica a coordinadores. */
  async proponerDirectiva(dto: ProponerInscripcionDirectivaDto) {
    const alumno = await this.alumnoRepo.findOne({ where: { id: dto.alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const taller = await this.tallerRepo.findOne({
      where: { id: dto.tallerId },
      relations: ['horarios'],
    });
    if (!taller) throw new NotFoundException('Taller no encontrado');
    if (taller.estado !== 'PUBLICADO') {
      throw new BadRequestException('Solo se pueden proponer actividades publicadas en el catálogo');
    }

    const validacion = await this.validar(dto.alumnoId, dto.tallerId);
    if (!validacion.puedeInscribirse) {
      throw new ConflictException(validacion.motivo ?? 'No se puede proponer esta inscripción');
    }

    const { tallerHorarioId, horarioPropuestoTexto } = await this.resolverHorarioPropuesta(
      taller,
      dto.tallerHorarioId,
      dto.horarioPropuestoTexto,
    );

    const existente = await this.propuestaRepo.findOne({
      where: { alumnoId: dto.alumnoId, tallerId: dto.tallerId },
    });
    if (existente?.estado === 'PENDIENTE') {
      throw new ConflictException('Ya existe una propuesta pendiente para este taller');
    }

    const propuesta = existente
      ? Object.assign(existente, {
          estado: 'PENDIENTE',
          motivoRechazo: null,
          mensajeDirectiva: null,
          horarioSugeridoId: null,
          respondedAt: null,
          tallerHorarioId,
          horarioPropuestoTexto,
          mensajeApoderado: dto.mensajeApoderado?.trim() || null,
        })
      : this.propuestaRepo.create({
          alumnoId: dto.alumnoId,
          tallerId: dto.tallerId,
          estado: 'PENDIENTE',
          tallerHorarioId,
          horarioPropuestoTexto,
          mensajeApoderado: dto.mensajeApoderado?.trim() || null,
        });
    const guardada = await this.propuestaRepo.save(propuesta);

    const apoderadoNombre = alumno.apoderadoNombre ?? 'Apoderado';
    await this.notificacionService.notificarCoordinadoresPropuestaApoderado({
      propuestaId: guardada.id,
      apoderadoNombre,
      alumnoNombre: alumno.nombre,
      alumnoRut: alumno.rut,
      tallerNombre: taller.tipo,
      horarioPropuesto: horarioPropuestoTexto,
      mensajeApoderado: dto.mensajeApoderado?.trim() || null,
    });

    return guardada;
  }

  /** Apoderado propone una actividad que no está en el catálogo de talleres. */
  async proponerActividadLibre(alumnoId: number, dto: ProponerActividadLibreDto) {
    const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const nombre = dto.actividadNombre.trim();
    const horario = dto.horarioPropuestoTexto.trim();
    const descripcion = dto.actividadDescripcion?.trim() || null;

    const pendiente = await this.propuestaRepo.findOne({
      where: { alumnoId, actividadLibreNombre: nombre, estado: 'PENDIENTE' },
    });
    if (pendiente) {
      throw new ConflictException('Ya existe una propuesta pendiente para esta actividad');
    }

    const propuesta = await this.propuestaRepo.save(
      this.propuestaRepo.create({
        alumnoId,
        tallerId: null,
        actividadLibreNombre: nombre,
        actividadLibreDescripcion: descripcion,
        estado: 'PENDIENTE',
        horarioPropuestoTexto: horario,
        mensajeApoderado: dto.mensajeApoderado?.trim() || null,
      }),
    );

    const apoderadoNombre = alumno.apoderadoNombre ?? 'Apoderado';
    await this.notificacionService.notificarCoordinadoresPropuestaApoderado({
      propuestaId: propuesta.id,
      apoderadoNombre,
      alumnoNombre: alumno.nombre,
      alumnoRut: alumno.rut,
      tallerNombre: nombre,
      horarioPropuesto: horario,
      mensajeApoderado: dto.mensajeApoderado?.trim() || null,
      actividadDescripcion: descripcion,
      esActividadLibre: true,
    });

    return propuesta;
  }

  private nombreActividadPropuesta(propuesta: PropuestaInscripcionTaller): string {
    return propuesta.actividadLibreNombre ?? propuesta.taller?.tipo ?? 'Actividad';
  }

  private async resolverHorarioPropuesta(
    taller: Taller,
    tallerHorarioId?: number,
    horarioLibre?: string,
  ): Promise<{ tallerHorarioId: number | null; horarioPropuestoTexto: string | null }> {
    const horarioTexto = horarioLibre?.trim() || null;

    if (horarioTexto) {
      let horarioId: number | null = null;
      if (tallerHorarioId) {
        const horario = await this.tallerHorarioRepo.findOne({
          where: { id: tallerHorarioId, tallerId: taller.id },
        });
        if (horario) horarioId = horario.id;
      }
      return { tallerHorarioId: horarioId, horarioPropuestoTexto: horarioTexto };
    }

    const opciones = opcionesHorarioTaller(taller);

    if (opciones.length === 0) {
      throw new BadRequestException('Debe indicar el horario propuesto (día y hora)');
    }

    if (opciones.length === 1 && opciones[0].id == null) {
      return { tallerHorarioId: null, horarioPropuestoTexto: opciones[0].etiqueta };
    }

    if (!tallerHorarioId) {
      throw new BadRequestException('Debe indicar el horario propuesto');
    }

    const horario = await this.tallerHorarioRepo.findOne({
      where: { id: tallerHorarioId, tallerId: taller.id },
    });
    if (!horario) {
      throw new BadRequestException('El horario seleccionado no pertenece a esta actividad');
    }

    return {
      tallerHorarioId: horario.id,
      horarioPropuestoTexto: textoHorarioBloque(horario),
    };
  }

  async getPropuestasPendientes() {
    const propuestas = await this.propuestaRepo.find({
      where: { estado: 'PENDIENTE' },
      relations: ['alumno', 'taller', 'taller.horarios', 'tallerHorario'],
      order: { createdAt: 'DESC' },
    });
    return propuestas.map((p) => ({
      id: p.id,
      alumnoId: p.alumnoId,
      alumnoNombre: p.alumno?.nombre,
      alumnoRut: p.alumno?.rut,
      tallerId: p.tallerId,
      tallerNombre: this.nombreActividadPropuesta(p),
      esActividadLibre: !p.tallerId,
      actividadDescripcion: p.actividadLibreDescripcion,
      apoderadoNombre: p.alumno?.apoderadoNombre,
      apoderadoEmail: p.alumno?.apoderadoEmail,
      horarioPropuesto:
        p.horarioPropuestoTexto ??
        textoHorarioPorId(p.tallerHorario) ??
        (p.taller ? textoHorarioTaller(p.taller) : null),
      mensajeApoderado: p.mensajeApoderado,
      tallerHorarioId: p.tallerHorarioId,
      horariosDisponibles: p.taller ? opcionesHorarioTaller(p.taller) : [],
      createdAt: p.createdAt,
    }));
  }

  async getPropuestasPorAlumno(alumnoId: number) {
    const propuestas = await this.propuestaRepo.find({
      where: { alumnoId },
      relations: ['taller', 'tallerHorario', 'horarioSugerido'],
      order: { createdAt: 'DESC' },
    });
    return propuestas.map((p) => ({
      id: p.id,
      tallerId: p.tallerId,
      tallerNombre: this.nombreActividadPropuesta(p),
      esActividadLibre: !p.tallerId,
      actividadDescripcion: p.actividadLibreDescripcion,
      estado: p.estado,
      horarioPropuesto:
        p.horarioPropuestoTexto ?? textoHorarioPorId(p.tallerHorario),
      horarioSugerido: textoHorarioPorId(p.horarioSugerido) ?? p.horarioSugeridoTexto,
      motivoRechazo: p.motivoRechazo,
      mensajeApoderado: p.mensajeApoderado,
      mensajeDirectiva: p.mensajeDirectiva,
      createdAt: p.createdAt,
      respondedAt: p.respondedAt,
    }));
  }

  /** La directiva acepta o rechaza una propuesta; si acepta, crea solicitud PENDIENTE. */
  async responderPropuesta(id: number, dto: ResponderPropuestaInscripcionDto) {
    const propuesta = await this.propuestaRepo.findOne({
      where: { id },
      relations: ['alumno', 'taller', 'tallerHorario'],
    });
    if (!propuesta) throw new NotFoundException('Propuesta no encontrada');
    if (propuesta.estado !== 'PENDIENTE') {
      throw new BadRequestException('Esta propuesta ya fue respondida');
    }

    propuesta.respondedAt = new Date();
    const horarioPropuesto =
      propuesta.horarioPropuestoTexto ?? textoHorarioPorId(propuesta.tallerHorario);
    const horarioTxt = horarioPropuesto ? ` Horario propuesto: ${horarioPropuesto}.` : '';
    const nombreActividad = this.nombreActividadPropuesta(propuesta);
    const esLibre = !propuesta.tallerId;

    if (dto.acepta) {
      propuesta.estado = 'ACEPTADA';
      propuesta.mensajeDirectiva = dto.mensajeDirectiva?.trim() || null;
      propuesta.horarioSugeridoId = null;
      await this.propuestaRepo.save(propuesta);

      if (!esLibre && propuesta.tallerId) {
        const inscripcionExistente = await this.repo.findOne({
          where: { alumnoId: propuesta.alumnoId, tallerId: propuesta.tallerId },
        });
        if (!inscripcionExistente) {
          await this.repo.save(
            this.repo.create({
              alumnoId: propuesta.alumnoId,
              tallerId: propuesta.tallerId,
              estado: 'PENDIENTE',
            }),
          );
        } else if (inscripcionExistente.estado === 'RECHAZADO') {
          inscripcionExistente.estado = 'PENDIENTE';
          await this.repo.save(inscripcionExistente);
        }
      }

      const extra = dto.mensajeDirectiva?.trim() ? ` ${dto.mensajeDirectiva.trim()}` : '';
      const msgAceptacion = esLibre
        ? `La directiva aceptó tu propuesta de la actividad "${nombreActividad}".${horarioTxt} La coordinación gestionará la creación de la actividad.${extra}`
        : `La directiva aceptó tu propuesta al taller "${nombreActividad}".${horarioTxt} Tu solicitud quedó pendiente de aprobación del profesor.${extra}`;

      await this.notificacionService.crear(
        propuesta.alumnoId,
        'Propuesta aceptada por directiva',
        msgAceptacion,
        'propuesta_aceptada',
      );

      await this.mailService.respuestaPropuestaDirectivaApoderado(
        propuesta.alumno?.apoderadoEmail,
        {
          apoderadoNombre: propuesta.alumno?.apoderadoNombre,
          alumnoNombre: propuesta.alumno?.nombre ?? 'Estudiante',
          tallerNombre: nombreActividad,
          aceptada: true,
          horarioPropuesto,
          mensajeDirectiva: dto.mensajeDirectiva?.trim() || null,
          esActividadLibre: esLibre,
        },
      );
    } else {
      let horarioSugeridoTexto: string | null = null;
      if (dto.horarioSugeridoId && propuesta.tallerId) {
        const horario = await this.tallerHorarioRepo.findOne({
          where: { id: dto.horarioSugeridoId, tallerId: propuesta.tallerId },
        });
        if (!horario) {
          throw new BadRequestException('El horario sugerido no pertenece a esta actividad');
        }
        propuesta.horarioSugeridoId = horario.id;
        horarioSugeridoTexto = textoHorarioBloque(horario);
      } else if (dto.horarioSugeridoTexto?.trim()) {
        propuesta.horarioSugeridoId = null;
        propuesta.horarioSugeridoTexto = dto.horarioSugeridoTexto.trim();
        horarioSugeridoTexto = propuesta.horarioSugeridoTexto;
      } else {
        propuesta.horarioSugeridoId = null;
        propuesta.horarioSugeridoTexto = null;
      }

      propuesta.estado = 'RECHAZADA';
      propuesta.motivoRechazo = dto.motivoRechazo?.trim() || null;
      propuesta.mensajeDirectiva = dto.mensajeDirectiva?.trim() || null;
      await this.propuestaRepo.save(propuesta);

      const partes: string[] = [
        `La directiva rechazó la propuesta${esLibre ? ' de la actividad' : ' al taller'} "${nombreActividad}".${horarioTxt}`,
      ];
      if (dto.motivoRechazo?.trim()) partes.push(`Motivo: ${dto.motivoRechazo.trim()}.`);
      if (horarioSugeridoTexto) {
        partes.push(`Horario alternativo disponible: ${horarioSugeridoTexto}.`);
      }
      if (dto.mensajeDirectiva?.trim()) partes.push(dto.mensajeDirectiva.trim());

      await this.notificacionService.crear(
        propuesta.alumnoId,
        'Propuesta rechazada',
        partes.join(' '),
        'propuesta_rechazada',
      );

      await this.mailService.respuestaPropuestaDirectivaApoderado(
        propuesta.alumno?.apoderadoEmail,
        {
          apoderadoNombre: propuesta.alumno?.apoderadoNombre,
          alumnoNombre: propuesta.alumno?.nombre ?? 'Estudiante',
          tallerNombre: nombreActividad,
          aceptada: false,
          horarioPropuesto,
          motivoRechazo: dto.motivoRechazo?.trim() || null,
          horarioSugerido: horarioSugeridoTexto,
          mensajeDirectiva: dto.mensajeDirectiva?.trim() || null,
          esActividadLibre: esLibre,
        },
      );
    }

    return propuesta;
  }
}
