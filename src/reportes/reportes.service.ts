/**
 * Servicio de reportes consolidados.
 * Cruza datos de alumnos, inscripciones, apoderados, profesores y administración.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { Admin } from '../entities/admin.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Profesor } from '../entities/profesor.entity';

/** Estructura del reporte de personas e inscripciones activas. */
export interface ReportePersonasInscripciones {
  alumnosSinTaller: Array<{ id: number; nombre: string; rut: string; edad: number | null }>;
  alumnosInscritos: Array<{
    id: number;
    nombre: string;
    rut: string;
    taller: string;
    tallerId: number;
    estado: string;
  }>;
  apoderados: Array<{
    nombre: string;
    rut: string | null;
    email: string | null;
    telefono: string | null;
    alumno: string;
    alumnoRut: string;
  }>;
  directiva: Array<{ id: number; nombre: string; rut: string; email: string }>;
  admins: Array<{ id: number; nombre: string; rut: string; email: string; rol: string }>;
  profesores: Array<{
    id: number;
    nombre: string;
    rut: string;
    email: string;
    telefono: string | null;
    taller: string;
    tallerId: number;
  }>;
}

/** Lógica de negocio para armar reportes administrativos. */
@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(InscripcionTaller)
    private inscripcionRepo: Repository<InscripcionTaller>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
  ) {}

  /**
   * Arma el reporte de personas: alumnos sin taller, inscritos, apoderados,
   * directiva, super admins y profesores con su taller asignado.
   */
  async getPersonasInscripciones(): Promise<ReportePersonasInscripciones> {
    const alumnos = await this.alumnoRepo.find({ order: { nombre: 'ASC' } });
    const inscripciones = await this.inscripcionRepo.find({
      where: { estado: In(['PENDIENTE', 'ACEPTADO']) },
      relations: ['alumno', 'taller'],
      order: { id: 'ASC' },
    });
    const admins = await this.adminRepo.find({ order: { nombre: 'ASC' } });
    const profesores = await this.profesorRepo.find({
      relations: ['taller'],
      order: { nombre: 'ASC' },
    });

    const idsConInscripcionActiva = new Set(inscripciones.map((i) => i.alumnoId));

    const alumnosSinTaller = alumnos
      .filter((a) => !idsConInscripcionActiva.has(a.id))
      .map((a) => ({
        id: a.id,
        nombre: a.nombre,
        rut: a.rut,
        edad: a.edad ?? null,
      }));

    const alumnosInscritos = inscripciones.map((i) => ({
      id: i.alumnoId,
      nombre: i.alumno?.nombre ?? `Alumno #${i.alumnoId}`,
      rut: i.alumno?.rut ?? '',
      taller: i.taller?.tipo ?? `Taller #${i.tallerId}`,
      tallerId: i.tallerId,
      estado: i.estado,
    }));

    const apoderados = alumnos
      .filter((a) => a.apoderadoNombre?.trim())
      .map((a) => ({
        nombre: a.apoderadoNombre!.trim(),
        rut: a.apoderadoRut,
        email: a.apoderadoEmail,
        telefono: a.apoderadoTelefono,
        alumno: a.nombre,
        alumnoRut: a.rut,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

    const directiva = admins
      .filter((a) => a.rol === 'directiva')
      .map((a) => ({ id: a.id, nombre: a.nombre, rut: a.rut, email: a.email }));

    const superAdmins = admins
      .filter((a) => a.rol === 'super_admin')
      .map((a) => ({ id: a.id, nombre: a.nombre, rut: a.rut, email: a.email, rol: a.rol }));

    const listaProfesores = profesores.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      rut: p.rut,
      email: p.email,
      telefono: p.telefono ?? null,
      taller: p.taller?.tipo ?? `Taller #${p.tallerId}`,
      tallerId: p.tallerId,
    }));

    return {
      alumnosSinTaller,
      alumnosInscritos,
      apoderados,
      directiva,
      admins: superAdmins,
      profesores: listaProfesores,
    };
  }
}
