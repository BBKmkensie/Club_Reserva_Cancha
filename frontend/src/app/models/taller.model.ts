/**
 * =============================================================================
 * app/models/taller.model.ts — Tipos de taller / actividad extracurricular
 * =============================================================================
 * Interfaces y tipos para el ciclo de vida de actividades:
 * BORRADOR → ESPERA_DOCENTE → ESPERA_HORARIO → PUBLICADO → CERRADO
 * Incluye horarios, asignaciones docentes y relaciones con alumnos/profesores.
 * =============================================================================
 */
import { Admin } from './admin.model';
import { Alumno } from './alumno.model';
import { Profesor } from './profesor.model';
import { TallerHorarioItem } from '../shared/utils/horario-taller.util';

/**
 * Estados del flujo de publicación y cierre de una actividad.
 * BORRADOR → ESPERA_DOCENTE → ESPERA_HORARIO → PUBLICADO → CERRADO
 */
export type EstadoActividad =
  | 'BORRADOR'
  | 'ESPERA_DOCENTE'
  | 'ESPERA_HORARIO'
  | 'PUBLICADO'
  | 'CERRADO';

/** Taller o actividad con cupos, horarios, inscripciones y relaciones. */
export interface Taller {
  // Identificador único.
  id: number;
  // Nombre/tipo de la actividad (ej. "Fútbol", "Vela").
  tipo: string;
  // Descripción larga para la presentación.
  descripcion: string;
  // Cupo máximo de alumnos.
  capacidad: number;
  // Día de la semana (0=domingo … 6=sábado) si hay horario simple.
  diaSemana?: number | null;
  // Hora de inicio del horario simple (HH:mm).
  horaInicio?: string | null;
  // Hora de fin del horario simple (HH:mm).
  horaFin?: string | null;
  // Estado del ciclo de vida (ver EstadoActividad).
  estado?: EstadoActividad;
  // Cómo se definen los horarios: por curso o por sección.
  modoHorario?: 'POR_CURSO' | 'POR_SECCION';
  // Lista de franjas cuando hay horarios múltiples.
  horarios?: TallerHorarioItem[];
  // Desde cuándo se pueden inscribir alumnos (ISO).
  fechaAperturaInscripcion?: string | null;
  // Hasta cuándo se pueden inscribir (ISO).
  fechaCierreInscripcion?: string | null;
  // Momento en que se publicó (ISO).
  publicadoAt?: string | null;
  // Momento en que se cerró (ISO).
  cerradoAt?: string | null;
  // Fecha de inicio de la actividad (legado / display).
  fechaInicio?: Date | string;
  // FK del admin creador.
  adminId?: number;
  // Relación cargada: admin creador.
  admin?: Admin;
  // URL de imagen de portada.
  imagenUrl?: string | null;
  // Alumnos inscritos (si el endpoint los incluye).
  alumnos?: Alumno[];
  // Profesores asignados (si el endpoint los incluye).
  profesores?: Profesor[];
}

/** Payload para crear un nuevo taller (POST /taller). */
export interface CreateTallerDto {
  // Nombre/tipo (obligatorio).
  tipo: string;
  // Descripción (obligatoria).
  descripcion: string;
  // Capacidad; el backend puede poner un default.
  capacidad?: number;
  // Fecha de inicio (string).
  fechaInicio?: string;
  // Admin que crea la actividad.
  adminId?: number;
  // Imagen de portada (opcional).
  imagenUrl?: string;
}

/** Propuesta o asignación de un docente a un taller con estado de respuesta. */
export interface AsignacionDocente {
  // Identificador de la asignación.
  id: number;
  // Taller al que se asigna.
  tallerId: number;
  // Profesor propuesto.
  profesorId: number;
  // Estado de la respuesta del profesor.
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  // Motivo si rechazó.
  motivoRechazo?: string | null;
  // Relación cargada: taller.
  taller?: Taller;
  // Relación cargada: profesor.
  profesor?: Profesor;
  // Fecha de creación (ISO).
  createdAt?: string;
}
