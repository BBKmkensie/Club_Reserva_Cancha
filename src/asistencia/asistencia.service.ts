/**
 * =============================================================================
 * asistencia/asistencia.service.ts — LÓGICA DE ASISTENCIA A TALLERES
 * =============================================================================
 * Flujo principal:
 *   abrirSesion() → actualizarAsistencia() → cerrarSesion()
 *     → evaluarAusenciasRecurrentes()  (si supera umbral → AlertaAusencia)
 *     → notificarApoderadosSesionCerrada() (email por cada alumno)
 *
 * Estados de sesión: ABIERTA | CERRADA
 * Estados de registro: PRESENTE | AUSENTE | TARDE
 * Estados de alerta: PENDIENTE → APODERADO_CONTACTADO → RESUELTO
 *
 * Archivo largo: comentarios de bloque en métodos públicos importantes.
 * =============================================================================
 */
// Excepciones HTTP: 404, 400, 409 (conflicto de sesión ya abierta)
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
// InjectRepository = pide el Repository<Entidad> registrado en el módulo
import { InjectRepository } from '@nestjs/typeorm';
// Repository = API TypeORM (find, findOne, save, create); In = WHERE campo IN (...)
import { Repository, In } from 'typeorm';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { RegistroAsistencia } from '../entities/registro-asistencia.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { AlertaAusencia } from '../entities/alerta-ausencia.entity';
import { AbrirSesionDto } from '../dto/abrir-sesion.dto';
import { ActualizarAsistenciaDto } from '../dto/actualizar-asistencia.dto';
import { CerrarSesionDto } from '../dto/cerrar-sesion.dto';
import { GestionarAlertaDto } from '../dto/gestionar-alerta.dto';
// Notificaciones in-app + correo al apoderado
import { NotificacionService } from '../notificacion/notificacion.service';
import { MailService } from '../mail/mail.service';

/**
 * @Injectable() = Nest inyecta repositorios TypeORM + NotificacionService + MailService.
 * MailService viene de MailModule (@Global).
 * Cada @InjectRepository(X) requiere TypeOrmModule.forFeature([X]) en AsistenciaModule.
 */
@Injectable()
export class AsistenciaService {
  constructor(
    @InjectRepository(SesionAsistencia)
    private sesionRepo: Repository<SesionAsistencia>, // tabla sesiones_asistencia
    @InjectRepository(RegistroAsistencia)
    private registroRepo: Repository<RegistroAsistencia>, // tabla registros_asistencia
    @InjectRepository(InscripcionTaller)
    private inscripcionRepo: Repository<InscripcionTaller>, // alumnos ACEPTADOS del taller
    @InjectRepository(Taller)
    private tallerRepo: Repository<Taller>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
    @InjectRepository(AlertaAusencia)
    private alertaRepo: Repository<AlertaAusencia>,
    private notificacionService: NotificacionService, // avisos in-app + SSE
    private mailService: MailService, // correos al apoderado
  ) {}

  /**
   * Abre una sesión de asistencia para un taller en la fecha indicada (o hoy).
   * Crea registros iniciales en estado PRESENTE para todos los alumnos inscritos aceptados.
   */
  async abrirSesion(dto: AbrirSesionDto): Promise<SesionAsistencia> {
    const taller = await this.tallerRepo.findOne({ where: { id: dto.tallerId } });
    if (!taller) throw new NotFoundException('Taller no encontrado');

    const fecha = dto.fecha ?? new Date().toISOString().split('T')[0];

    const sesionAbierta = await this.sesionRepo.findOne({
      where: { tallerId: dto.tallerId, fecha, estado: 'ABIERTA' },
    });
    if (sesionAbierta) {
      throw new ConflictException('Ya hay una sesión abierta para este taller hoy');
    }

    const inscritos = await this.inscripcionRepo.find({
      where: { tallerId: dto.tallerId, estado: 'ACEPTADO' },
      relations: ['alumno'],
    });
    if (inscritos.length === 0) {
      throw new BadRequestException('No hay alumnos inscritos (aceptados) en este taller');
    }

    const sesion = this.sesionRepo.create({
      tallerId: dto.tallerId,
      profesorId: dto.profesorId,
      fecha,
      estado: 'ABIERTA',
      listaGuardada: false,
    });
    const guardada = await this.sesionRepo.save(sesion);

    const registros = inscritos.map((insc) =>
      this.registroRepo.create({
        sesionId: guardada.id,
        alumnoId: insc.alumnoId,
        estado: 'PRESENTE',
      }),
    );
    await this.registroRepo.save(registros);

    return await this.obtenerSesion(guardada.id);
  }

  /** Obtiene una sesión con taller, profesor y registros de alumnos. */
  async obtenerSesion(id: number): Promise<SesionAsistencia> {
    const sesion = await this.sesionRepo.findOne({
      where: { id },
      relations: ['taller', 'profesor', 'registros', 'registros.alumno'],
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    return sesion;
  }

  /** Devuelve la sesión ABIERTA del taller para el día actual, si existe. */
  async sesionActiva(tallerId: number): Promise<SesionAsistencia | null> {
    const fecha = new Date().toISOString().split('T')[0];
    return await this.sesionRepo.findOne({
      where: { tallerId, fecha, estado: 'ABIERTA' },
      relations: ['taller', 'profesor', 'registros', 'registros.alumno'],
    });
  }

  /** Lista el historial de sesiones de un taller, más recientes primero. */
  async historialSesiones(tallerId: number): Promise<SesionAsistencia[]> {
    return await this.sesionRepo.find({
      where: { tallerId },
      relations: ['profesor', 'registros'],
      order: { fecha: 'DESC', openedAt: 'DESC' },
    });
  }

  /**
   * Actualiza los estados de asistencia de uno o más alumnos en una sesión abierta.
   * Marca la sesión como lista guardada al finalizar.
   */
  async actualizarAsistencia(
    sesionId: number,
    dto: ActualizarAsistenciaDto,
  ): Promise<SesionAsistencia> {
    const sesion = await this.sesionRepo.findOne({ where: { id: sesionId } });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    if (sesion.estado !== 'ABIERTA') {
      throw new BadRequestException('La sesión está cerrada y no se puede editar');
    }

    const estadosValidos = ['PRESENTE', 'AUSENTE'];
    for (const item of dto.registros) {
      if (!estadosValidos.includes(item.estado)) {
        throw new BadRequestException(
          `Estado inválido para alumno ${item.alumnoId}. Use PRESENTE o AUSENTE.`,
        );
      }
      const registro = await this.registroRepo.findOne({
        where: { sesionId, alumnoId: item.alumnoId },
      });
      if (!registro) {
        throw new BadRequestException(`El alumno ${item.alumnoId} no pertenece a esta sesión`);
      }
      registro.estado = item.estado;
      registro.observacion = item.observacion ?? null;
      await this.registroRepo.save(registro);
    }

    sesion.listaGuardada = true;
    await this.sesionRepo.save(sesion);

    return await this.obtenerSesion(sesionId);
  }

  /**
   * Cierra una sesión abierta tras validar que la lista fue guardada.
   * Evalúa ausencias recurrentes y notifica a los apoderados por correo.
   */
  async cerrarSesion(sesionId: number, dto: CerrarSesionDto): Promise<SesionAsistencia> {
    const sesion = await this.sesionRepo.findOne({
      where: { id: sesionId },
      relations: ['taller', 'registros', 'registros.alumno'],
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    if (sesion.estado !== 'ABIERTA') {
      throw new BadRequestException('La sesión ya está cerrada');
    }
    if (!sesion.listaGuardada) {
      throw new BadRequestException(
        'Debes guardar la lista de asistencia antes de cerrar la sesión',
      );
    }

    const registros = sesion.registros ?? [];
    if (registros.length === 0) {
      throw new BadRequestException('No hay alumnos registrados en esta sesión');
    }

    sesion.estado = 'CERRADA';
    sesion.observaciones = dto.observaciones ?? null;
    sesion.closedAt = new Date();
    await this.sesionRepo.save(sesion);

    await this.evaluarAusenciasRecurrentes(sesion.tallerId);

    await this.notificarApoderadosSesionCerrada(sesion);

    return await this.obtenerSesion(sesionId);
  }

  /** Envía correo a cada apoderado con el estado de asistencia de su hijo/a. */
  private async notificarApoderadosSesionCerrada(sesion: SesionAsistencia) {
    const tallerNombre = sesion.taller?.tipo ?? 'Taller';
    for (const reg of sesion.registros ?? []) {
      const alumno = reg.alumno;
      if (!alumno?.apoderadoEmail) continue;
      await this.mailService.asistenciaSesionApoderado(
        alumno.apoderadoEmail,
        alumno.nombre,
        tallerNombre,
        sesion.fecha,
        reg.estado,
        alumno.apoderadoNombre,
        reg.observacion,
      );
    }
  }

  /**
   * Revisa sesiones cerradas y genera alertas cuando un alumno supera el umbral de ausencias.
   * Notifica al alumno, profesores y coordinación; envía correo al apoderado.
   */
  private async evaluarAusenciasRecurrentes(tallerId: number) {
    const taller = await this.tallerRepo.findOne({ where: { id: tallerId } });
    if (!taller) return;

    const umbral = taller.umbralAusencias ?? 3;
    const sesionesCerradas = await this.sesionRepo.find({
      where: { tallerId, estado: 'CERRADA' },
      relations: ['registros'],
    });

    const ausenciasPorAlumno = new Map<number, number>();
    for (const sesion of sesionesCerradas) {
      for (const reg of sesion.registros ?? []) {
        if (reg.estado === 'AUSENTE') {
          ausenciasPorAlumno.set(reg.alumnoId, (ausenciasPorAlumno.get(reg.alumnoId) ?? 0) + 1);
        }
      }
    }

    const profesores = await this.profesorRepo.find({ where: { tallerId } });

    for (const [alumnoId, total] of ausenciasPorAlumno) {
      if (total < umbral) continue;

      const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
      const alertaExistente = await this.alertaRepo.findOne({
        where: {
          alumnoId,
          tallerId,
          estado: In(['PENDIENTE', 'APODERADO_CONTACTADO']),
        },
      });

      if (!alertaExistente) {
        await this.alertaRepo.save({
          alumnoId,
          tallerId,
          cantidadAusencias: total,
          estado: 'PENDIENTE',
        });

        await this.notificacionService.crear(
          alumnoId,
          'Alerta de ausencias',
          `Tienes ${total} ausencias en el taller "${taller.tipo}". Umbral: ${umbral}.`,
          'ausencia_recurrente',
        );

        const msgProfesor = `El alumno ${alumno?.nombre ?? alumnoId} acumuló ${total} ausencias en "${taller.tipo}".`;
        for (const prof of profesores) {
          await this.notificacionService.crearParaProfesor(
            prof.id,
            'Alerta de ausencias',
            msgProfesor,
            'ausencia_recurrente',
          );
        }

        await this.mailService.alertaApoderado(
          alumno?.apoderadoEmail,
          alumno?.nombre ?? `Alumno ${alumnoId}`,
          taller.tipo,
          total,
          umbral,
          alumno?.apoderadoNombre,
        );

        const msgCoordinacion = `Alerta de ausencias: ${alumno?.nombre ?? alumnoId} acumuló ${total} ausencias en "${taller.tipo}" (umbral: ${umbral}).`;
        await this.notificacionService.notificarCoordinadoresAusencia(
          'Alerta de ausencias recurrentes',
          msgCoordinacion,
          'ausencia_recurrente',
        );
      } else if (alertaExistente.cantidadAusencias < total) {
        alertaExistente.cantidadAusencias = total;
        await this.alertaRepo.save(alertaExistente);
      }
    }
  }

  /** Lista alertas pendientes o con apoderado contactado, opcionalmente filtradas por taller. */
  async getAlertasGestion(tallerId?: number) {
    const where = tallerId
      ? { tallerId, estado: In(['PENDIENTE', 'APODERADO_CONTACTADO'] as any) }
      : { estado: In(['PENDIENTE', 'APODERADO_CONTACTADO']) };

    const alertas = await this.alertaRepo.find({
      where,
      relations: ['alumno', 'taller'],
      order: { createdAt: 'DESC' },
    });

    return alertas.map((a) => ({
      id: a.id,
      alumnoId: a.alumnoId,
      nombre: a.alumno?.nombre,
      rut: a.alumno?.rut,
      tallerId: a.tallerId,
      taller: a.taller?.tipo,
      cantidadAusencias: a.cantidadAusencias,
      estado: a.estado,
      notas: a.notas,
      createdAt: a.createdAt,
      apoderado: {
        nombre: a.alumno?.apoderadoNombre,
        telefono: a.alumno?.apoderadoTelefono,
        email: a.alumno?.apoderadoEmail,
      },
    }));
  }

  /** Marca una alerta como APODERADO_CONTACTADO y envía correo al apoderado. */
  async contactarApoderado(id: number, dto: GestionarAlertaDto) {
    const alerta = await this.alertaRepo.findOne({
      where: { id },
      relations: ['alumno', 'taller'],
    });
    if (!alerta) throw new NotFoundException('Alerta no encontrada');
    if (alerta.estado === 'RESUELTO') {
      throw new BadRequestException('La alerta ya fue resuelta');
    }

    alerta.estado = 'APODERADO_CONTACTADO';
    alerta.contactadoAt = new Date();
    alerta.notas = dto.notas ?? alerta.notas;
    const guardada = await this.alertaRepo.save(alerta);

    await this.mailService.contactoApoderado(
      alerta.alumno?.apoderadoEmail,
      alerta.alumno?.nombre ?? 'Alumno',
      alerta.taller?.tipo ?? 'Taller',
      alerta.cantidadAusencias,
      dto.notas,
      alerta.alumno?.apoderadoNombre,
    );

    return guardada;
  }

  /** Marca una alerta de ausencias como RESUELTA. */
  async resolverAlerta(id: number, dto: GestionarAlertaDto) {
    const alerta = await this.alertaRepo.findOne({ where: { id } });
    if (!alerta) throw new NotFoundException('Alerta no encontrada');

    alerta.estado = 'RESUELTO';
    alerta.resueltoAt = new Date();
    if (dto.notas) alerta.notas = dto.notas;
    return await this.alertaRepo.save(alerta);
  }

  /** Actualiza el umbral de ausencias que dispara alertas para un taller. */
  async actualizarUmbral(tallerId: number, umbralAusencias: number) {
    if (umbralAusencias == null || umbralAusencias < 1) {
      throw new BadRequestException('Debe indicar un umbral de ausencias válido');
    }
    const taller = await this.tallerRepo.findOne({ where: { id: tallerId } });
    if (!taller) throw new NotFoundException('Taller no encontrado');
    taller.umbralAusencias = umbralAusencias;
    return await this.tallerRepo.save(taller);
  }

  /** Genera reporte consolidado de asistencia, estadísticas por alumno y alertas activas. */
  async getReporte(tallerId: number) {
    const taller = await this.tallerRepo.findOne({ where: { id: tallerId } });
    if (!taller) throw new NotFoundException('Taller no encontrado');

    const umbral = taller.umbralAusencias ?? 3;

    const sesiones = await this.sesionRepo.find({
      where: { tallerId, estado: 'CERRADA' },
      relations: ['registros', 'registros.alumno', 'profesor'],
      order: { fecha: 'DESC' },
    });

    const inscritos = await this.inscripcionRepo.find({
      where: { tallerId, estado: 'ACEPTADO' },
      relations: ['alumno'],
    });

    const estadisticasAlumnos = inscritos.map((insc) => {
      let presentes = 0;
      let ausentes = 0;
      let tardes = 0;

      for (const sesion of sesiones) {
        const reg = sesion.registros?.find((r) => r.alumnoId === insc.alumnoId);
        if (!reg) continue;
        if (reg.estado === 'PRESENTE') presentes++;
        else if (reg.estado === 'AUSENTE') ausentes++;
        else if (reg.estado === 'TARDE') tardes++;
      }

      const totalSesiones = sesiones.length;
      const porcentaje = totalSesiones > 0 ? Math.round((presentes / totalSesiones) * 100) : 0;

      return {
        alumnoId: insc.alumnoId,
        nombre: insc.alumno?.nombre,
        rut: insc.alumno?.rut,
        apoderadoNombre: insc.alumno?.apoderadoNombre,
        apoderadoTelefono: insc.alumno?.apoderadoTelefono,
        apoderadoEmail: insc.alumno?.apoderadoEmail,
        presentes,
        ausentes,
        tardes,
        totalSesiones,
        porcentajeAsistencia: porcentaje,
        alertaAusencia: ausentes >= umbral,
      };
    });

    const alertas = estadisticasAlumnos.filter((e) => e.alertaAusencia);
    const alertasGestion = await this.getAlertasGestion(tallerId);

    return {
      taller: {
        id: taller.id,
        tipo: taller.tipo,
        capacidad: taller.capacidad,
        umbralAusencias: umbral,
      },
      resumen: {
        totalSesiones: sesiones.length,
        totalAlumnos: inscritos.length,
        alertasAusencia: alertas.length,
        alertasPendientes: alertasGestion.length,
        umbralAusencias: umbral,
      },
      estadisticasAlumnos: estadisticasAlumnos.sort((a, b) => b.ausentes - a.ausentes),
      alertas,
      alertasGestion,
      sesiones: sesiones.map((s) => ({
        id: s.id,
        fecha: s.fecha,
        profesor: s.profesor?.nombre,
        presentes: s.registros?.filter((r) => r.estado === 'PRESENTE').length ?? 0,
        ausentes: s.registros?.filter((r) => r.estado === 'AUSENTE').length ?? 0,
        tardes: s.registros?.filter((r) => r.estado === 'TARDE').length ?? 0,
      })),
    };
  }

  /** Obtiene todas las alertas de gestión sin filtrar por taller. */
  async getAlertasGlobales() {
    return await this.getAlertasGestion();
  }
}
