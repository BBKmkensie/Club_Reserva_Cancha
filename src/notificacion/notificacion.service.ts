import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notificacion } from '../entities/notificacion.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { Admin } from '../entities/admin.entity';
import { MailService } from '../mail/mail.service';
import { NotificacionStreamService } from './notificacion-stream.service';

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

  async crear(
    alumnoId: number,
    titulo: string,
    mensaje: string,
    tipo = 'inscripcion_taller',
  ): Promise<Notificacion> {
    const notificacion = this.repo.create({ alumnoId, titulo, mensaje, tipo });
    const guardada = await this.repo.save(notificacion);

    const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
    await this.mailService.notificarAlumno(alumno?.email, titulo, mensaje);
    this.streamService.emitAlumno(alumnoId, guardada);

    return guardada;
  }

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

  async crearParaAdmin(
    adminId: number,
    titulo: string,
    mensaje: string,
    tipo = 'ausencia_recurrente',
  ): Promise<Notificacion> {
    const notificacion = this.repo.create({
      adminId,
      alumnoId: null,
      profesorId: null,
      titulo,
      mensaje,
      tipo,
    });
    const guardada = await this.repo.save(notificacion);

    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (admin?.email) {
      await this.mailService.notificarAdmin(admin.email, titulo, mensaje);
    }
    this.streamService.emitAdmin(adminId, guardada);

    return guardada;
  }

  async notificarCoordinadoresAusencia(
    titulo: string,
    mensaje: string,
    tipo = 'ausencia_recurrente',
  ): Promise<void> {
    await this.notificarCoordinadores(titulo, mensaje, tipo);
  }

  async notificarCoordinadores(
    titulo: string,
    mensaje: string,
    tipo = 'sistema',
  ): Promise<void> {
    const coordinadores = await this.adminRepo.find({
      where: { rol: In(['super_admin', 'directiva']) },
    });
    for (const admin of coordinadores) {
      await this.crearParaAdmin(admin.id, titulo, mensaje, tipo);
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
}
