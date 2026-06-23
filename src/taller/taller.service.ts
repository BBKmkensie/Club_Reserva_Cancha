import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Taller } from '../entities/taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { AsignacionDocente } from '../entities/asignacion-docente.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { CreateTallerDto } from '../dto/create-taller.dto';
import { AsignarDocenteDto } from '../dto/asignar-docente.dto';
import { ResponderAsignacionDto } from '../dto/responder-asignacion.dto';
import { DefinirHorarioDto } from '../dto/definir-horario.dto';
import { PublicarActividadDto } from '../dto/publicar-actividad.dto';
import { NotificacionService } from '../notificacion/notificacion.service';
import { PeriodoService } from '../periodo/periodo.service';
import { PeriodoAcademico } from '../entities/periodo-academico.entity';

@Injectable()
export class TallerService {
  constructor(
    @InjectRepository(Taller)
    private tallerRepository: Repository<Taller>,
    @InjectRepository(Profesor)
    private profesorRepository: Repository<Profesor>,
    @InjectRepository(AsignacionDocente)
    private asignacionRepository: Repository<AsignacionDocente>,
    @InjectRepository(InscripcionTaller)
    private inscripcionRepository: Repository<InscripcionTaller>,
    @InjectRepository(SesionAsistencia)
    private sesionAsistenciaRepository: Repository<SesionAsistencia>,
    private notificacionService: NotificacionService,
    private periodoService: PeriodoService,
  ) {}

  async create(createTallerDto: CreateTallerDto): Promise<Taller> {
    const taller = this.tallerRepository.create({
      tipo: createTallerDto.tipo,
      descripcion: createTallerDto.descripcion,
      capacidad: createTallerDto.capacidad || 20,
      imagenUrl: createTallerDto.imagenUrl ?? null,
      fechaInicio: createTallerDto.fechaInicio
        ? new Date(createTallerDto.fechaInicio)
        : null,
      adminId: createTallerDto.adminId,
      estado: 'BORRADOR',
    });
    return await this.tallerRepository.save(taller);
  }

  async findAll(): Promise<Taller[]> {
    return await this.tallerRepository.find({
      relations: ['profesores'],
      order: { id: 'DESC' },
    });
  }

  async findCatalogo(): Promise<Taller[]> {
    const hoy = new Date().toISOString().split('T')[0];
    const talleres = await this.tallerRepository.find({
      where: { estado: 'PUBLICADO' },
      order: { tipo: 'ASC' },
    });
    return talleres.filter((t) => this.inscripcionesAbiertas(t, hoy));
  }

  async findOne(id: number): Promise<Taller> {
    const taller = await this.tallerRepository.findOne({
      where: { id },
      relations: ['admin', 'alumnos', 'profesores', 'reservas', 'salidas'],
    });
    if (!taller) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }
    return taller;
  }

  async update(id: number, updateTallerDto: Partial<CreateTallerDto>): Promise<Taller> {
    const taller = await this.findOne(id);
    if (taller.estado === 'CERRADO') {
      throw new BadRequestException('No se puede editar una actividad cerrada');
    }
    Object.assign(taller, updateTallerDto);
    if (updateTallerDto.fechaInicio) {
      taller.fechaInicio = new Date(updateTallerDto.fechaInicio);
    }
    return await this.tallerRepository.save(taller);
  }

  async remove(id: number): Promise<void> {
    const taller = await this.findOne(id);
    await this.tallerRepository.remove(taller);
  }

  async asignarDocente(tallerId: number, dto: AsignarDocenteDto): Promise<AsignacionDocente> {
    const taller = await this.findOne(tallerId);
    if (!['BORRADOR', 'ESPERA_DOCENTE'].includes(taller.estado)) {
      throw new BadRequestException(
        'Solo se puede asignar docente en actividades en borrador o reasignación',
      );
    }

    const profesor = await this.profesorRepository.findOne({
      where: { id: dto.profesorId },
      relations: ['taller'],
    });
    if (!profesor) throw new NotFoundException('Profesor no encontrado');

    const pendienteExistente = await this.asignacionRepository.findOne({
      where: { tallerId, estado: 'PENDIENTE' },
    });
    if (pendienteExistente) {
      throw new ConflictException('Ya hay una asignación pendiente para esta actividad');
    }

    await this.validarDisponibilidadDocente(dto.profesorId, taller);

    const asignacion = await this.asignacionRepository.save({
      tallerId,
      profesorId: dto.profesorId,
      estado: 'PENDIENTE',
    });

    taller.estado = 'ESPERA_DOCENTE';
    await this.tallerRepository.save(taller);

    await this.notificacionService.crearParaProfesor(
      dto.profesorId,
      'Nueva asignación de actividad',
      `Fuiste asignado/a a la actividad "${taller.tipo}". Confirma tu disponibilidad en el panel de asignaciones.`,
      'asignacion_actividad',
    );

    return await this.asignacionRepository.findOne({
      where: { id: asignacion.id },
      relations: ['taller', 'profesor'],
    }) as AsignacionDocente;
  }

  async responderAsignacion(
    asignacionId: number,
    profesorId: number,
    dto: ResponderAsignacionDto,
  ): Promise<AsignacionDocente> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id: asignacionId },
      relations: ['taller', 'profesor'],
    });
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');
    if (asignacion.profesorId !== profesorId) {
      throw new BadRequestException('No puedes responder esta asignación');
    }
    if (asignacion.estado !== 'PENDIENTE') {
      throw new BadRequestException('Esta asignación ya fue respondida');
    }

    asignacion.respondedAt = new Date();

    if (dto.acepta) {
      asignacion.estado = 'ACEPTADA';
      asignacion.taller.estado = 'ESPERA_HORARIO';
      asignacion.profesor.tallerId = asignacion.tallerId;
      await this.profesorRepository.save(asignacion.profesor);
      await this.tallerRepository.save(asignacion.taller);
      await this.notificacionService.crearParaProfesor(
        profesorId,
        'Asignación confirmada',
        `Aceptaste la actividad "${asignacion.taller.tipo}". El coordinador definirá el horario y publicará el catálogo.`,
        'asignacion_actividad',
      );
    } else {
      asignacion.estado = 'RECHAZADA';
      asignacion.motivoRechazo = dto.motivoRechazo ?? null;
      asignacion.taller.estado = 'BORRADOR';
      await this.tallerRepository.save(asignacion.taller);
      const motivo = dto.motivoRechazo ? ` Motivo: ${dto.motivoRechazo}` : '';
      await this.notificacionService.notificarCoordinadores(
        'Docente rechazó asignación',
        `El docente ${asignacion.profesor.nombre} rechazó la actividad "${asignacion.taller.tipo}".${motivo}`,
        'asignacion_rechazada',
      );
    }

    return await this.asignacionRepository.save(asignacion);
  }

  async definirHorario(tallerId: number, dto: DefinirHorarioDto): Promise<Taller> {
    const taller = await this.findOne(tallerId);
    if (taller.estado !== 'ESPERA_HORARIO') {
      throw new BadRequestException('La actividad debe tener docente confirmado antes de definir horario');
    }

    const asignacionAceptada = await this.asignacionRepository.findOne({
      where: { tallerId, estado: 'ACEPTADA' },
    });
    if (!asignacionAceptada) {
      throw new BadRequestException('No hay docente aceptado para esta actividad');
    }

    if (dto.horaInicio >= dto.horaFin) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
    }

    await this.validarConflictoHorarioDocente(
      asignacionAceptada.profesorId,
      dto.diaSemana,
      dto.horaInicio,
      dto.horaFin,
      tallerId,
    );

    taller.diaSemana = dto.diaSemana;
    taller.horaInicio = dto.horaInicio;
    taller.horaFin = dto.horaFin;
    return await this.tallerRepository.save(taller);
  }

  async publicar(tallerId: number, dto: PublicarActividadDto): Promise<Taller> {
    const taller = await this.findOne(tallerId);
    if (taller.estado !== 'ESPERA_HORARIO') {
      throw new BadRequestException('Solo se publican actividades con horario definido');
    }
    if (taller.diaSemana == null || !taller.horaInicio || !taller.horaFin) {
      throw new BadRequestException('Debes definir el horario antes de publicar');
    }

    const asignacion = await this.asignacionRepository.findOne({
      where: { tallerId, estado: 'ACEPTADA' },
    });
    if (!asignacion) {
      throw new BadRequestException('Debe haber un docente que haya aceptado la actividad');
    }

    taller.estado = 'PUBLICADO';
    taller.publicadoAt = new Date();
    taller.fechaAperturaInscripcion = dto.fechaAperturaInscripcion
      ? new Date(dto.fechaAperturaInscripcion)
      : null;
    taller.fechaCierreInscripcion = dto.fechaCierreInscripcion
      ? new Date(dto.fechaCierreInscripcion)
      : null;

    return await this.tallerRepository.save(taller);
  }

  async cerrarPeriodo(tallerId: number): Promise<Taller> {
    const taller = await this.findOne(tallerId);
    if (taller.estado !== 'PUBLICADO') {
      throw new BadRequestException('Solo se puede cerrar una actividad publicada');
    }
    taller.estado = 'CERRADO';
    taller.cerradoAt = new Date();
    return await this.tallerRepository.save(taller);
  }

  async getAsignacionesPendientes(profesorId: number): Promise<AsignacionDocente[]> {
    return await this.asignacionRepository.find({
      where: { profesorId, estado: 'PENDIENTE' },
      relations: ['taller'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReporteActividad(tallerId: number) {
    const taller = await this.findOne(tallerId);
    const inscripciones = await this.inscripcionRepository.find({
      where: { tallerId },
      relations: ['alumno'],
    });
    const asignacion = await this.asignacionRepository.findOne({
      where: { tallerId, estado: 'ACEPTADA' },
      relations: ['profesor'],
    });
    const periodo = await this.periodoService.getActivo();
    const sesiones = await this.sesionAsistenciaRepository.find({
      where: { tallerId, estado: 'CERRADA' },
      relations: ['registros'],
    });

    let registrosPresentes = 0;
    let registrosAusentes = 0;
    let registrosTardes = 0;
    for (const sesion of sesiones) {
      for (const reg of sesion.registros ?? []) {
        if (reg.estado === 'PRESENTE') registrosPresentes++;
        else if (reg.estado === 'AUSENTE') registrosAusentes++;
        else if (reg.estado === 'TARDE') registrosTardes++;
      }
    }

    const formatFecha = (f: Date | string) =>
      f instanceof Date ? f.toISOString().split('T')[0] : String(f).split('T')[0];

    return {
      actividad: {
        id: taller.id,
        tipo: taller.tipo,
        estado: taller.estado,
        capacidad: taller.capacidad,
        horario: {
          diaSemana: taller.diaSemana,
          horaInicio: taller.horaInicio,
          horaFin: taller.horaFin,
        },
        publicadoAt: taller.publicadoAt,
        cerradoAt: taller.cerradoAt,
      },
      docente: asignacion?.profesor
        ? { id: asignacion.profesor.id, nombre: asignacion.profesor.nombre }
        : null,
      periodoAcademico: periodo
        ? {
            nombre: periodo.nombre,
            fechaApertura: formatFecha(periodo.fechaApertura),
            fechaCierre: formatFecha(periodo.fechaCierre),
          }
        : null,
      inscripciones: {
        total: inscripciones.length,
        pendientes: inscripciones.filter((i) => i.estado === 'PENDIENTE').length,
        aceptados: inscripciones.filter((i) => i.estado === 'ACEPTADO').length,
        rechazados: inscripciones.filter((i) => i.estado === 'RECHAZADO').length,
      },
      asistencia: {
        sesionesRealizadas: sesiones.length,
        registrosPresentes,
        registrosAusentes,
        registrosTardes,
      },
      alumnos: inscripciones.map((i) => ({
        nombre: i.alumno?.nombre,
        rut: i.alumno?.rut,
        estado: i.estado,
      })),
    };
  }

  private inscripcionesAbiertas(taller: Taller, hoy: string): boolean {
    const apertura = taller.fechaAperturaInscripcion
      ? new Date(taller.fechaAperturaInscripcion).toISOString().split('T')[0]
      : null;
    const cierre = taller.fechaCierreInscripcion
      ? new Date(taller.fechaCierreInscripcion).toISOString().split('T')[0]
      : null;
    if (apertura && hoy < apertura) return false;
    if (cierre && hoy > cierre) return false;
    return true;
  }

  private async validarDisponibilidadDocente(profesorId: number, taller: Taller): Promise<void> {
    const asignacionesActivas = await this.asignacionRepository.find({
      where: {
        profesorId,
        estado: In(['PENDIENTE', 'ACEPTADA']),
        tallerId: Not(taller.id),
      },
      relations: ['taller'],
    });

    for (const asig of asignacionesActivas) {
      const otro = asig.taller;
      if (!otro || otro.estado === 'CERRADO' || otro.estado === 'BORRADOR') continue;
      if (asig.estado === 'PENDIENTE') {
        throw new ConflictException(
          `El docente ya tiene una asignación pendiente en "${otro.tipo}"`,
        );
      }
      if (
        taller.diaSemana != null &&
        taller.horaInicio &&
        taller.horaFin &&
        otro.diaSemana != null &&
        otro.horaInicio &&
        otro.horaFin &&
        this.horariosSeSolapan(taller, otro)
      ) {
        throw new ConflictException(
          `El docente tiene conflicto de horario con la actividad "${otro.tipo}"`,
        );
      }
    }
  }

  private async validarConflictoHorarioDocente(
    profesorId: number,
    diaSemana: number,
    horaInicio: string,
    horaFin: string,
    excluirTallerId: number,
  ): Promise<void> {
    const asignaciones = await this.asignacionRepository.find({
      where: { profesorId, estado: 'ACEPTADA' },
      relations: ['taller'],
    });

    const candidato = {
      diaSemana,
      horaInicio,
      horaFin,
    } as Taller;

    for (const asig of asignaciones) {
      const otro = asig.taller;
      if (!otro || otro.id === excluirTallerId || otro.estado === 'CERRADO') continue;
      if (
        otro.diaSemana != null &&
        otro.horaInicio &&
        otro.horaFin &&
        this.horariosSeSolapan(candidato, otro)
      ) {
        throw new ConflictException(
          `Conflicto de horario con la actividad "${otro.tipo}" del mismo docente`,
        );
      }
    }
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

  async getComparacionSemestre(periodoId?: number, profesorId?: number) {
    const periodos = await this.periodoService.findAll();
    let periodo: PeriodoAcademico | null = null;

    if (periodoId) {
      periodo = periodos.find((p) => p.id === periodoId) ?? null;
      if (!periodo) {
        throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
      }
    } else {
      periodo = periodos.find((p) => p.activo) ?? periodos[0] ?? null;
    }

    const apertura = periodo ? this.fechaIso(periodo.fechaApertura) : '1900-01-01';
    const cierre = periodo ? this.fechaIso(periodo.fechaCierre) : '2099-12-31';

    const idxPeriodo = periodo ? periodos.findIndex((p) => p.id === periodo!.id) : -1;
    const periodoAnterior =
      idxPeriodo >= 0 && idxPeriodo < periodos.length - 1 ? periodos[idxPeriodo + 1] : null;

    let tallerIdProfesor: number | null = null;
    if (profesorId) {
      const profesor = await this.profesorRepository.findOne({ where: { id: profesorId } });
      tallerIdProfesor = profesor?.tallerId ?? null;
    }

    const inscripciones = await this.inscripcionRepository.find({ relations: ['taller'] });
    const inscPeriodo = this.filtrarInscripcionesPorFechas(inscripciones, apertura, cierre);
    const inscAnterior = periodoAnterior
      ? this.filtrarInscripcionesPorFechas(
          inscripciones,
          this.fechaIso(periodoAnterior.fechaApertura),
          this.fechaIso(periodoAnterior.fechaCierre),
        )
      : [];

    const tallerIds = [...new Set(inscPeriodo.map((i) => i.tallerId))];
    const talleres =
      tallerIds.length > 0
        ? await this.tallerRepository.find({ where: { id: In(tallerIds) } })
        : [];

    const mapaTaller = new Map(talleres.map((t) => [t.id, t]));
    const statsMap = new Map<
      number,
      {
        tallerId: number;
        tipo: string;
        capacidad: number;
        estado: string;
        horario: { diaSemana: number | null; horaInicio: string | null; horaFin: string | null };
        total: number;
        pendientes: number;
        aceptados: number;
        rechazados: number;
        ocupacionPct: number;
        demandaPct: number;
      }
    >();

    for (const insc of inscPeriodo) {
      const taller = insc.taller ?? mapaTaller.get(insc.tallerId);
      if (!taller) continue;

      if (!statsMap.has(insc.tallerId)) {
        statsMap.set(insc.tallerId, {
          tallerId: taller.id,
          tipo: taller.tipo,
          capacidad: taller.capacidad,
          estado: taller.estado,
          horario: {
            diaSemana: taller.diaSemana,
            horaInicio: taller.horaInicio,
            horaFin: taller.horaFin,
          },
          total: 0,
          pendientes: 0,
          aceptados: 0,
          rechazados: 0,
          ocupacionPct: 0,
          demandaPct: 0,
        });
      }

      const stat = statsMap.get(insc.tallerId)!;
      stat.total += 1;
      if (insc.estado === 'PENDIENTE') stat.pendientes += 1;
      else if (insc.estado === 'ACEPTADO') stat.aceptados += 1;
      else if (insc.estado === 'RECHAZADO') stat.rechazados += 1;
    }

    const talleresStats = [...statsMap.values()].map((s) => {
      const cap = Math.max(s.capacidad, 1);
      return {
        ...s,
        ocupacionPct: Math.round((s.aceptados / cap) * 100),
        demandaPct: Math.round(((s.aceptados + s.pendientes) / cap) * 100),
      };
    });

    talleresStats.sort((a, b) => b.aceptados - a.aceptados || b.total - a.total);
    const ranking = talleresStats.map((t, i) => ({ ...t, posicion: i + 1 }));

    const porTipoActual = this.agruparAceptadosPorTipo(inscPeriodo);
    const porTipoAnterior = this.agruparAceptadosPorTipo(inscAnterior);
    const tipos = new Set([...Object.keys(porTipoActual), ...Object.keys(porTipoAnterior)]);

    const comparacionPorTipo = [...tipos].map((tipo) => {
      const actual = porTipoActual[tipo] ?? 0;
      const anterior = porTipoAnterior[tipo] ?? 0;
      const variacion = actual - anterior;
      const variacionPct =
        anterior > 0 ? Math.round((variacion / anterior) * 100) : actual > 0 ? 100 : 0;
      return { tipo, periodoActual: actual, periodoAnterior: anterior, variacion, variacionPct };
    });
    comparacionPorTipo.sort((a, b) => b.periodoActual - a.periodoActual);

    const sugerencias = this.generarSugerenciasTalleres(ranking, comparacionPorTipo);

    const resumen = {
      totalTalleres: ranking.length,
      totalInscripciones: inscPeriodo.length,
      totalAceptados: inscPeriodo.filter((i) => i.estado === 'ACEPTADO').length,
      totalPendientes: inscPeriodo.filter((i) => i.estado === 'PENDIENTE').length,
      tallerMasOcupado: ranking[0]?.tipo ?? null,
      promedioOcupacion:
        ranking.length > 0
          ? Math.round(ranking.reduce((acc, t) => acc + t.ocupacionPct, 0) / ranking.length)
          : 0,
    };

    const miTaller =
      tallerIdProfesor != null
        ? ranking.find((t) => t.tallerId === tallerIdProfesor) ?? null
        : null;

    return {
      periodo: periodo
        ? {
            id: periodo.id,
            nombre: periodo.nombre,
            fechaApertura: apertura,
            fechaCierre: cierre,
            activo: periodo.activo,
          }
        : null,
      periodoAnterior: periodoAnterior
        ? {
            id: periodoAnterior.id,
            nombre: periodoAnterior.nombre,
            fechaApertura: this.fechaIso(periodoAnterior.fechaApertura),
            fechaCierre: this.fechaIso(periodoAnterior.fechaCierre),
          }
        : null,
      resumen,
      ranking,
      comparacionPorTipo,
      sugerencias,
      miTaller,
      periodosDisponibles: periodos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        fechaApertura: this.fechaIso(p.fechaApertura),
        fechaCierre: this.fechaIso(p.fechaCierre),
        activo: p.activo,
      })),
    };
  }

  private fechaIso(fecha: Date | string): string {
    return new Date(fecha).toISOString().split('T')[0];
  }

  private filtrarInscripcionesPorFechas(
    inscripciones: InscripcionTaller[],
    apertura: string,
    cierre: string,
  ): InscripcionTaller[] {
    return inscripciones.filter((i) => {
      const d = this.fechaIso(i.createdAt);
      return d >= apertura && d <= cierre;
    });
  }

  private agruparAceptadosPorTipo(inscripciones: InscripcionTaller[]): Record<string, number> {
    const map: Record<string, number> = {};
    for (const insc of inscripciones) {
      if (insc.estado !== 'ACEPTADO') continue;
      const tipo = insc.taller?.tipo ?? `Taller #${insc.tallerId}`;
      map[tipo] = (map[tipo] ?? 0) + 1;
    }
    return map;
  }

  private generarSugerenciasTalleres(
    ranking: Array<{
      tallerId: number;
      tipo: string;
      capacidad: number;
      aceptados: number;
      pendientes: number;
      ocupacionPct: number;
      demandaPct: number;
      total: number;
    }>,
    comparacionPorTipo: Array<{
      tipo: string;
      periodoActual: number;
      periodoAnterior: number;
      variacion: number;
    }>,
  ) {
    const sugerencias: Array<{
      tipo: string;
      prioridad: 'alta' | 'media' | 'baja';
      mensaje: string;
      tallerId?: number;
      tallerTipo?: string;
    }> = [];

    for (const t of ranking) {
      if (t.ocupacionPct >= 85 || t.demandaPct >= 100) {
        sugerencias.push({
          tipo: 'ALTA_DEMANDA',
          prioridad: 'alta',
          mensaje: `"${t.tipo}" alcanzó ${t.ocupacionPct}% de ocupación (${t.aceptados}/${t.capacidad} cupos). Considera abrir otra sección o ampliar cupos.`,
          tallerId: t.tallerId,
          tallerTipo: t.tipo,
        });
      } else if (t.ocupacionPct < 35 && t.total >= 3) {
        sugerencias.push({
          tipo: 'BAJA_OCUPACION',
          prioridad: 'media',
          mensaje: `"${t.tipo}" tiene baja ocupación (${t.ocupacionPct}%). Evalúa cambiar horario, promover la actividad o reemplazarla.`,
          tallerId: t.tallerId,
          tallerTipo: t.tipo,
        });
      }
    }

    const porTipo = new Map<string, { aceptados: number; talleres: number; ocupacionSum: number }>();
    for (const t of ranking) {
      const prev = porTipo.get(t.tipo) ?? { aceptados: 0, talleres: 0, ocupacionSum: 0 };
      prev.aceptados += t.aceptados;
      prev.talleres += 1;
      prev.ocupacionSum += t.ocupacionPct;
      porTipo.set(t.tipo, prev);
    }

    for (const [tipo, data] of porTipo) {
      const promedioOcup = Math.round(data.ocupacionSum / data.talleres);
      if (data.aceptados >= 20 || promedioOcup >= 80) {
        sugerencias.push({
          tipo: 'NUEVO_TALLER',
          prioridad: 'alta',
          mensaje: `Alta demanda en "${tipo}" (${data.aceptados} alumnos aceptados). Sugerencia: ofrecer otro taller de ${tipo} el próximo semestre.`,
          tallerTipo: tipo,
        });
      }
    }

    for (const c of comparacionPorTipo) {
      if (c.periodoActual >= 15 && c.variacion > 0) {
        sugerencias.push({
          tipo: 'REPETIR_EXITOSO',
          prioridad: 'media',
          mensaje: `"${c.tipo}" mantiene buena convocatoria (${c.periodoActual} alumnos, +${c.variacion} vs período anterior). Conviene repetirlo.`,
          tallerTipo: c.tipo,
        });
      }
    }

    const vistos = new Set<string>();
    return sugerencias.filter((s) => {
      const key = `${s.tipo}-${s.tallerTipo ?? ''}-${s.tallerId ?? ''}`;
      if (vistos.has(key)) return false;
      vistos.add(key);
      return true;
    });
  }

}
