/**
 * =============================================================================
 * app/models/profesor.model.ts — Tipos de profesor / docente
 * =============================================================================
 * Interfaces para docentes vinculados a talleres.
 * Usadas en profesores.component, gestión de actividades y asignaciones.
 * =============================================================================
 */

/** Profesor vinculado a un taller con datos de contacto opcionales. */
export interface Profesor {
  // Identificador único.
  id: number;
  // Nombre completo.
  nombre: string;
  // RUT (también usado como usuario de login).
  rut: string;
  // Correo de contacto.
  email: string;
  // Teléfono (opcional).
  telefono?: string;
  // Ruta/URL de la foto del profesor en la presentación del taller.
  fotoPath?: string;
  // FK del taller al que está asignado.
  tallerId: number;
  // Relación cargada: { id, tipo } del taller.
  taller?: { id: number; tipo?: string };
}

/** Payload para crear o actualizar un profesor (POST/PATCH /profesor). */
export interface CreateProfesorDto {
  // Nombre completo (obligatorio).
  nombre: string;
  // RUT (obligatorio).
  rut: string;
  // Correo (obligatorio).
  email: string;
  // Teléfono (opcional).
  telefono?: string;
  // Foto (opcional).
  fotoPath?: string;
  // Taller al que se vincula (obligatorio al crear).
  tallerId: number;
  // Contraseña en texto plano; el backend la hashea.
  password?: string;
}
