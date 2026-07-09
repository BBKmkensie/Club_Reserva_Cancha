/**
 * Modelos de alumno del establecimiento.
 * Tipos para ficha estudiantil e inscripción en talleres.
 */

/** Alumno con datos personales y taller asignado opcional. */
export interface Alumno {
  id: number;
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  edad?: number;
  tallerId?: number | null;
  taller?: { id: number; tipo?: string } | null;
}

/** Payload para registrar un nuevo alumno. */
export interface CreateAlumnoDto {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  edad?: number;
  tallerId?: number | null;
  password?: string;
}
