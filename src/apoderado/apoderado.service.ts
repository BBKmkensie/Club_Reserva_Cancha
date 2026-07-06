import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { JwtPayload } from '../auth/auth.types';

@Injectable()
export class ApoderadoService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    @InjectRepository(InscripcionTaller)
    private inscripcionRepo: Repository<InscripcionTaller>,
    @InjectRepository(SesionAsistencia)
    private sesionRepo: Repository<SesionAsistencia>,
  ) {}

  assertApoderado(user: JwtPayload): number {
    if (user.tipo !== 'apoderado') {
      throw new ForbiddenException('Solo apoderados pueden acceder a este recurso');
    }
    return user.sub;
  }

  async getResumen(alumnoId: number) {
    const alumno = await this.alumnoRepo.findOne({
      where: { id: alumnoId },
      relations: ['taller'],
    });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const inscripciones = await this.inscripcionRepo.find({
      where: { alumnoId, estado: 'ACEPTADO' },
      relations: ['taller'],
      order: { id: 'DESC' },
    });

    const tallerActivo =
      inscripciones[0]?.taller ??
      (alumno.taller ? { id: alumno.taller.id, tipo: alumno.taller.tipo } : null);

    const tallerId = tallerActivo?.id ?? alumno.tallerId;
    let asistencia: Awaited<ReturnType<ApoderadoService['getAsistenciaPorTaller']>> | null = null;
    if (tallerId) {
      asistencia = await this.getAsistenciaPorTaller(alumnoId, tallerId);
    }

    return {
      apoderado: {
        nombre: alumno.apoderadoNombre,
        rut: alumno.apoderadoRut,
        email: alumno.apoderadoEmail,
        telefono: alumno.apoderadoTelefono,
      },
      hijo: {
        id: alumno.id,
        nombre: alumno.nombre,
        rut: alumno.rut,
      },
      tallerInscrito: tallerActivo
        ? {
            id: tallerActivo.id,
            nombre: (tallerActivo as { tipo?: string }).tipo ?? 'Taller',
            horario: this.formatHorarioTaller(tallerActivo as any),
          }
        : null,
      inscripciones: inscripciones.map((i) => ({
        tallerId: i.tallerId,
        taller: i.taller?.tipo,
        estado: i.estado,
      })),
      asistencia,
    };
  }

  async getAsistenciaPorTaller(alumnoId: number, tallerId: number) {
    const sesiones = await this.sesionRepo.find({
      where: { tallerId, estado: 'CERRADA' },
      relations: ['registros', 'taller'],
      order: { fecha: 'DESC' },
    });

    let presentes = 0;
    let ausentes = 0;
    let tardes = 0;

    const registros = sesiones.map((sesion) => {
      const reg = sesion.registros?.find((r) => r.alumnoId === alumnoId);
      const estado = reg?.estado ?? 'SIN_REGISTRO';
      if (estado === 'PRESENTE') presentes++;
      else if (estado === 'AUSENTE') ausentes++;
      else if (estado === 'TARDE') tardes++;

      return {
        fecha: sesion.fecha,
        estado,
        observacion: reg?.observacion ?? null,
        taller: sesion.taller?.tipo ?? null,
      };
    });

    const total = sesiones.length;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;

    return {
      tallerId,
      resumen: { presentes, ausentes, tardes, totalSesiones: total, porcentaje },
      registros,
    };
  }

  private formatHorarioTaller(taller: {
    diaSemana?: number | null;
    horaInicio?: string | null;
    horaFin?: string | null;
  }): string | null {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    if (taller.diaSemana == null || !taller.horaInicio || !taller.horaFin) return null;
    const hi = taller.horaInicio.length >= 5 ? taller.horaInicio.slice(0, 5) : taller.horaInicio;
    const hf = taller.horaFin.length >= 5 ? taller.horaFin.slice(0, 5) : taller.horaFin;
    return `${dias[taller.diaSemana]} ${hi} - ${hf}`;
  }
}
