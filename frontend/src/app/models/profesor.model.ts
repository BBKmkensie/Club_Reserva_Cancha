/**
 * Modelos de profesor y docente asignado a talleres.
 * Tipos para ficha docente y alta en el sistema.
 */

/** Profesor vinculado a un taller con datos de contacto opcionales. */
export interface Profesor {
  id: number;
  nombre: string;
  rut: string;
  email: string;
  telefono?: string;
  fotoPath?: string;
  tallerId: number;
  taller?: { id: number; tipo?: string };
}

/** Payload para crear o actualizar un profesor. */
export interface CreateProfesorDto {
  nombre: string;
  rut: string;
  email: string;
  telefono?: string;
  fotoPath?: string;
  tallerId: number;
  password?: string;
}
