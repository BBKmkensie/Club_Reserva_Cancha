/**
 * Servicio de notificaciones del sistema.
 * Persiste avisos para alumnos, profesores y administradores; envía correo y emite eventos SSE.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notificacion } from '../entities/notificacion.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { Admin } from '../entities/admin.entity';
import { MailService } from '../mail/mail.service';
import { NotificacionStreamService } from './notificacion-stream.service';

/** Creación, consulta y gestión de notificaciones por rol de usuario. */
@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private repo: Repository<Notificacion>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private mailService: MailService,
    private streamService: NotificacionStreamService,
  ) {}

  /**
   * Crea una notificación para un alumno, envía correo si tiene email
   * y emite el evento en tiempo real vía SSE.
   */
  async crear(
    alumnoId: number,
    titulo: string,
    mensaje: string,
    tipo = 'inscripcion_taller',
  ): Promise<Notificacion> {
    const notificacion = this.repo.create({ alumnoId, titulo, mensaje, tipo });
    const guardada = await this.repo.save(notificacion);

    const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
    if (alumno?.email) {
      await this.mailService.notificarAlumno(alumno.email, titulo, mensaje);
    }
    this.streamService.emitAlumno(alumnoId, guardada);

    return guardada;
  }

  /** Crea notificación para un profesor con correo y emisión SSE. */
  async crearParaProfesor(
    profesorId: number,
    titulo: string,
    mensaje: string,
    tipo = 'ausencia_recurrente',
  ): Promise<Notificacion> {
    const notificacion = this.repo.create({ profesorId, titulo, mensaje, tipo });
    const guardada = await this.repo.save(notificacion);

    const profesor = await this.profesorRepo.findOne({ where: { id: profesorId } });
    if (profesor?.email) {
      await this.mailService.notificarProfesor(profesor.email, titulo, mensaje);
    }
    this.streamService.emitProfesor(profesorId, guardada);

    return guardada;
  }

  /** Crea notificación para un administrador con correo y emisión SSE. */
  async crearParaAdmin(
    adminId: number,
    titulo: string,
    mensaje: string,
    tipo = 'ausencia_recurrente',
    refId?: number,
    enviarCorreo = true,
  ): Promise<Notificacion> {
    const notificacion = this.repo.create({
      adminId,
      alumnoId: null,
      profesorId: null,
      titulo,
      mensaje,
      tipo,
      refId: refId ?? null,
    });
    const guardada = await this.repo.save(notificacion);

    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (enviarCorreo && admin?.email) {
      await this.mailService.notificarAdmin(admin.email, titulo, mensaje);
    }
    this.streamService.emitAdmin(adminId, guardada);

    return guardada;
  }

  /** Notifica a coordinadores sobre propuesta de apoderado con correo detallado. */
  async notificarCoordinadoresPropuestaApoderado(params: {
    propuestaId: number;
    apoderadoNombre: string;
    alumnoNombre: string;
    alumnoRut?: string | null;
    tallerNombre: string;
    horarioPropuesto?: string | null;
    mensajeApoderado?: string | null;
  }): Promise<void> {
    const titulo = 'Nueva propuesta de actividad';
    const horarioTxt = params.horarioPropuesto ? ` Horario: ${params.horarioPropuesto}.` : '';
    const mensaje =
      `${params.apoderadoNombre} propuso "${params.tallerNombre}" para ${params.alumnoNombre}.${horarioTxt} Revisa la bandeja de propuestas.`;

    const coordinadores = await this.adminRepo.find({
      where: { rol: In(['super_admin', 'directiva']) },
    });

    for (const admin of coordinadores) {
      await this.crearParaAdmin(
        admin.id,
        titulo,
        mensaje,
        'propuesta_actividad',
        params.propuestaId,
        false,
      );
      if (admin.email) {
        await this.mailService.nuevaPropuestaDirectiva(admin.email, admin.nombre, {
          apoderadoNombre: params.apoderadoNombre,
          alumnoNombre: params.alumnoNombre,
          alumnoRut: params.alumnoRut,
          tallerNombre: params.tallerNombre,
          horarioPropuesto: params.horarioPropuesto,
          mensajeApoderado: params.mensajeApoderado,
          propuestaId: params.propuestaId,
        });
      }
    }
  }

  /** Notifica a super_admin y directiva sobre alertas de ausencias recurrentes. */
  async notificarCoordinadoresAusencia(
    titulo: string,
    mensaje: string,
    tipo = 'ausencia_recurrente',
  ): Promise<void> {
    await this.notificarCoordinadores(titulo, mensaje, tipo);
  }

  /** Envía la misma notificación a todos los coordinadores (super_admin y directiva). */
  async notificarCoordinadores(
    titulo: string,
    mensaje: string,
    tipo = 'sistema',
    refId?: number,
  ): Promise<void> {
    const coordinadores = await this.adminRepo.find({
      where: { rol: In(['super_admin', 'directiva']) },
    });
    for (const admin of coordinadores) {
      await this.crearParaAdmin(admin.id, titulo, mensaje, tipo, refId);
    }
  }

  async findByAlumno(alumnoId: number): Promise<Notificacion[]> {
    return await this.repo.find({
      where: { alumnoId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByProfesor(profesorId: number): Promise<Notificacion[]> {
    return await this.repo.find({
      where: { profesorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAdmin(adminId: number): Promise<Notificacion[]> {
    return await this.repo.find({
      where: { adminId },
      order: { createdAt: 'DESC' },
    });
  }

  async contarNoLeidas(alumnoId: number): Promise<number> {
    return await this.repo.count({ where: { alumnoId, leida: false } });
  }

  async contarNoLeidasProfesor(profesorId: number): Promise<number> {
    return await this.repo.count({ where: { profesorId, leida: false } });
  }

  async contarNoLeidasAdmin(adminId: number): Promise<number> {
    return await this.repo.count({ where: { adminId, leida: false } });
  }

  /** Marca una notificación como leída verificando que pertenezca al alumno. */
  async marcarLeida(id: number, alumnoId: number): Promise<Notificacion> {
    const notificacion = await this.repo.findOne({ where: { id, alumnoId } });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }
    notificacion.leida = true;
    return await this.repo.save(notificacion);
  }

  async marcarTodasLeidas(alumnoId: number): Promise<void> {
    await this.repo.update({ alumnoId, leida: false }, { leida: true });
  }

  async marcarLeidaAdmin(id: number, adminId: number): Promise<Notificacion> {
    const notificacion = await this.repo.findOne({ where: { id, adminId } });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }
    notificacion.leida = true;
    return await this.repo.save(notificacion);
  }

  async marcarTodasLeidasAdmin(adminId: number): Promise<void> {
    await this.repo.update({ adminId, leida: false }, { leida: true });
  }

  async marcarLeidaProfesor(id: number, profesorId: number): Promise<Notificacion> {
    const notificacion = await this.repo.findOne({ where: { id, profesorId } });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }
    notificacion.leida = true;
    return await this.repo.save(notificacion);
  }

  async marcarTodasLeidasProfesor(profesorId: number): Promise<void> {
    await this.repo.update({ profesorId, leida: false }, { leida: true });
  }

  async eliminarAlumno(id: number, alumnoId: number): Promise<void> {
    const notificacion = await this.repo.findOne({ where: { id, alumnoId } });
    if (!notificacion) throw new NotFoundException('Notificación no encontrada');
    await this.repo.remove(notificacion);
  }

  async eliminarProfesor(id: number, profesorId: number): Promise<void> {
    const notificacion = await this.repo.findOne({ where: { id, profesorId } });
    if (!notificacion) throw new NotFoundException('Notificación no encontrada');
    await this.repo.remove(notificacion);
  }

  async eliminarAdmin(id: number, adminId: number): Promise<void> {
    const notificacion = await this.repo.findOne({ where: { id, adminId } });
    if (!notificacion) throw new NotFoundException('Notificación no encontrada');
    await this.repo.remove(notificacion);
  }
}
