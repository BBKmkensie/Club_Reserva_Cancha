/**
 * =============================================================================
 * app/models/alumno.model.ts — Tipos de alumno / estudiante
 * =============================================================================
 * Interfaces para el registro estudiantil.
 * Usadas en alumnos.component, fichas-alumnos y flujos de inscripción.
 * =============================================================================
 */

/** Alumno con datos personales y taller asignado opcional. */
export interface Alumno {
  // Identificador único en la base de datos.
  id: number;
  // Nombre completo del estudiante.
  nombre: string;
  // RUT chileno (formato con o sin puntos/guión según backend).
  rut: string;
  // Correo de contacto (opcional).
  email?: string;
  // Teléfono de contacto (opcional).
  telefono?: string;
  // Edad en años (opcional; a veces se calcula en backend).
  edad?: number;
  // FK al taller asignado; null si aún no tiene taller.
  tallerId?: number | null;
  // Relación cargada: objeto taller { id, tipo } si el endpoint la incluye.
  taller?: { id: number; tipo?: string } | null;
}

/** Payload para registrar un nuevo alumno (POST /alumno). */
export interface CreateAlumnoDto {
  // Nombre completo (obligatorio).
  nombre: string;
  // RUT (obligatorio; único en el sistema).
  rut: string;
  // Correo (opcional).
  email?: string;
  // Teléfono (opcional).
  telefono?: string;
  // Edad (opcional).
  edad?: number;
  // Taller inicial (opcional).
  tallerId?: number | null;
  // Contraseña en texto plano; el backend la hashea.
  password?: string;
}
