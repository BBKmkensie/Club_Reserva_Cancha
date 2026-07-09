/**
 * Modelos de taller, actividad extracurricular y asignación docente.
 * Tipos para gestión de actividades, horarios y estados del ciclo de vida.
 */
import { Admin } from './admin.model';
import { Alumno } from './alumno.model';
import { Profesor } from './profesor.model';
import { TallerHorarioItem } from '../shared/utils/horario-taller.util';

/** Estados del flujo de publicación y cierre de una actividad. */
export type EstadoActividad =
  | 'BORRADOR'
  | 'ESPERA_DOCENTE'
  | 'ESPERA_HORARIO'
  | 'PUBLICADO'
  | 'CERRADO';

/** Taller o actividad con cupos, horarios, inscripciones y relaciones. */
export interface Taller {
  id: number;
  tipo: string;
  descripcion: string;
  capacidad: number;
  diaSemana?: number | null;
  horaInicio?: string | null;
  horaFin?: string | null;
  estado?: EstadoActividad;
  modoHorario?: 'POR_CURSO' | 'POR_SECCION';
  horarios?: TallerHorarioItem[];
  fechaAperturaInscripcion?: string | null;
  fechaCierreInscripcion?: string | null;
  publicadoAt?: string | null;
  cerradoAt?: string | null;
  fechaInicio?: Date | string;
  adminId?: number;
  admin?: Admin;
  imagenUrl?: string | null;
  alumnos?: Alumno[];
  profesores?: Profesor[];
}

/** Payload para crear un nuevo taller o actividad. */
export interface CreateTallerDto {
  tipo: string;
  descripcion: string;
  capacidad?: number;
  fechaInicio?: string;
  adminId?: number;
  imagenUrl?: string;
}

/** Propuesta o asignación de un docente a un taller con estado de respuesta. */
export interface AsignacionDocente {
  id: number;
  tallerId: number;
  profesorId: number;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  motivoRechazo?: string | null;
  taller?: Taller;
  profesor?: Profesor;
  createdAt?: string;
}
