/**
 * Servicio de notificaciones por correo a apoderados.
 * Envía avisos de inscripción a taller y de asistencia en sesiones cerradas.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { RegistroAsistencia } from '../entities/registro-asistencia.entity';
import { MailService } from '../mail/mail.service';

/** Resultado del envío masivo de correos a apoderados. */
export interface NotifyApoderadosResult {
  inscripcionesEnviadas: number;
  asistenciasEnviadas: number;
  sinEmail: number;
  errores: number;
  detalle: Array<{ tipo: 'inscripcion' | 'asistencia'; alumno: string; email: string; taller: string }>;
}

/** Orquesta el envío de correos transaccionales hacia apoderados. */
@Injectable()
export class ApoderadoNotifyService {
  private readonly logger = new Logger(ApoderadoNotifyService.name);
  private readonly delayMs = 3500;

  constructor(
    @InjectRepository(InscripcionTaller)
    private inscripcionRepo: Repository<InscripcionTaller>,
    @InjectRepository(RegistroAsistencia)
    private registroRepo: Repository<RegistroAsistencia>,
    private mailService: MailService,
  ) {}

  /**
   * Notifica inscripciones aceptadas y la última asistencia por alumno
   * a apoderados con email registrado.
   */
  async notifyInscripcionesYAsistencia(): Promise<NotifyApoderadosResult> {
    const result: NotifyApoderadosResult = {
      inscripcionesEnviadas: 0,
      asistenciasEnviadas: 0,
      sinEmail: 0,
      errores: 0,
      detalle: [],
    };

    const inscripciones = await this.inscripcionRepo.find({
      where: { estado: 'ACEPTADO' },
      relations: ['alumno', 'taller'],
    });

    const enviadosInscripcion = new Set<string>();

    for (const insc of inscripciones) {
      const alumno = insc.alumno;
      const email = alumno?.apoderadoEmail?.trim();
      if (!email) {
        result.sinEmail++;
        continue;
      }
      const key = `${insc.alumnoId}-${insc.tallerId}`;
      if (enviadosInscripcion.has(key)) continue;
      enviadosInscripcion.add(key);

      const tallerNombre = insc.taller?.tipo ?? 'Taller';
      const ok = await this.mailService.inscripcionTallerApoderado(
        email,
        alumno!.nombre,
        tallerNombre,
        alumno!.apoderadoNombre,
        this.formatHorario(insc.taller),
      );
      await this.sleep(this.delayMs);
      if (ok) {
        result.inscripcionesEnviadas++;
        result.detalle.push({
          tipo: 'inscripcion',
          alumno: alumno!.nombre,
          email,
          taller: tallerNombre,
        });
      } else {
        result.errores++;
      }
    }

    const registros = await this.registroRepo.find({
      relations: ['alumno', 'sesion', 'sesion.taller'],
      order: { id: 'DESC' },
    });

    const ultimoPorAlumno = new Map<number, RegistroAsistencia>();
    for (const reg of registros) {
      if (reg.sesion?.estado !== 'CERRADA') continue;
      if (!ultimoPorAlumno.has(reg.alumnoId)) {
        ultimoPorAlumno.set(reg.alumnoId, reg);
      }
    }

    for (const reg of ultimoPorAlumno.values()) {
      const alumno = reg.alumno;
      const email = alumno?.apoderadoEmail?.trim();
      if (!email) {
        result.sinEmail++;
        continue;
      }

      const tallerNombre = reg.sesion?.taller?.tipo ?? 'Taller';
      const ok = await this.mailService.asistenciaSesionApoderado(
        email,
        alumno!.nombre,
        tallerNombre,
        reg.sesion!.fecha,
        reg.estado,
        alumno!.apoderadoNombre,
        reg.observacion,
      );
      await this.sleep(this.delayMs);
      if (ok) {
        result.asistenciasEnviadas++;
        result.detalle.push({
          tipo: 'asistencia',
          alumno: alumno!.nombre,
          email,
          taller: `${tallerNombre} (${reg.sesion!.fecha})`,
        });
      } else {
        result.errores++;
      }
    }

    this.logger.log(
      `Correos apoderados: ${result.inscripcionesEnviadas} inscripción, ${result.asistenciasEnviadas} asistencia`,
    );
    return result;
  }

  private formatHorario(taller?: {
    diaSemana?: number | null;
    horaInicio?: string | null;
    horaFin?: string | null;
  } | null): string | null {
    if (taller?.diaSemana == null || !taller.horaInicio || !taller.horaFin) return null;
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hi = taller.horaInicio.slice(0, 5);
    const hf = taller.horaFin.slice(0, 5);
    return `${dias[taller.diaSemana!]} ${hi} - ${hf}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
