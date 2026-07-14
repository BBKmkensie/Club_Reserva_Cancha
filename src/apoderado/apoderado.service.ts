/**
 * =============================================================================
 * apoderado/apoderado.service.ts — RESUMEN DEL PANEL DEL APODERADO
 * =============================================================================
 * assertApoderado(user): seguridad de negocio — solo tipo 'apoderado'.
 * getResumen(alumnoId): hijo, todos los talleres inscritos y asistencia por taller.
 * getAsistenciaPorTaller: cuenta PRESENTE/AUSENTE en sesiones CERRADAS.
 * =============================================================================
 */
// ForbiddenException = 403 si el JWT no es de tipo apoderado
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
import { Taller } from '../entities/taller.entity';
import { JwtPayload } from '../auth/auth.types';
// textoHorarioTaller = arma string legible del horario del taller
import { textoHorarioTaller } from '../common/taller-horario.util';

/** Lógica de negocio accesible solo para usuarios autenticados como apoderado. */
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

  /**
   * Valida que el JWT corresponda a un apoderado y devuelve el id del alumno asociado.
   * En el login de apoderado, JwtPayload.sub = alumnoId del hijo.
   */
  assertApoderado(user: JwtPayload): number {
    if (user.tipo !== 'apoderado') {
      throw new ForbiddenException('Solo apoderados pueden acceder a este recurso');
    }
    return user.sub;
  }

  /**
   * Resumen del panel apoderado: datos del apoderado, hijo/a,
   * todos los talleres con inscripción ACEPTADA y asistencia de cada uno.
   */
  async getResumen(alumnoId: number) {
    const alumno = await this.alumnoRepo.findOne({
      where: { id: alumnoId },
      relations: ['taller', 'taller.horarios'],
    });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const inscripciones = await this.inscripcionRepo.find({
      where: { alumnoId, estado: 'ACEPTADO' },
      relations: ['taller', 'taller.horarios'],
      order: { id: 'DESC' },
    });

    const talleresPorId = new Map<number, Taller>();
    for (const insc of inscripciones) {
      if (insc.taller) talleresPorId.set(insc.taller.id, insc.taller);
    }
    // Fallback legado: taller principal del alumno si no hay inscripción ACEPTADA
    if (alumno.taller && !talleresPorId.has(alumno.taller.id)) {
      talleresPorId.set(alumno.taller.id, alumno.taller);
    }

    const talleres = [...talleresPorId.values()];
    const talleresInscritos = talleres.map((t) => ({
      id: t.id,
      nombre: t.tipo ?? 'Taller',
      horario: textoHorarioTaller(t),
    }));

    const asistencias = await Promise.all(
      talleres.map((t) => this.getAsistenciaPorTaller(alumnoId, t.id, t.tipo)),
    );

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
      talleresInscritos,
      /** @deprecated Usar talleresInscritos — se mantiene por compatibilidad. */
      tallerInscrito: talleresInscritos[0] ?? null,
      inscripciones: inscripciones.map((i) => ({
        tallerId: i.tallerId,
        taller: i.taller?.tipo,
        estado: i.estado,
      })),
      asistencias,
      /** @deprecated Usar asistencias — se mantiene por compatibilidad. */
      asistencia: asistencias[0] ?? null,
    };
  }

  /** Detalle de asistencia del alumno en sesiones cerradas de un taller específico. */
  async getAsistenciaPorTaller(
    alumnoId: number,
    tallerId: number,
    tallerNombre?: string | null,
  ) {
    const sesiones = await this.sesionRepo.find({
      where: { tallerId, estado: 'CERRADA' },
      relations: ['registros', 'taller'],
      order: { fecha: 'DESC' },
    });

    let presentes = 0;
    let ausentes = 0;
    let tardes = 0;
    const nombreTaller = tallerNombre ?? sesiones[0]?.taller?.tipo ?? 'Taller';

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
        taller: sesion.taller?.tipo ?? nombreTaller,
      };
    });

    const total = sesiones.length;
    // PRESENTE y TARDE cuentan como asistencia efectiva
    const asistio = presentes + tardes;
    const porcentaje = total > 0 ? Math.round((asistio / total) * 100) : 0;

    return {
      tallerId,
      tallerNombre: nombreTaller,
      resumen: { presentes, ausentes, tardes, totalSesiones: total, porcentaje },
      registros,
    };
  }
}
