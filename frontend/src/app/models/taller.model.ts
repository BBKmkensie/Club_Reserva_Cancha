import { Admin } from './admin.model';
import { Alumno } from './alumno.model';
import { Profesor } from './profesor.model';

export interface Taller {
  id: number;
  tipo: string;
  descripcion: string;
  capacidad: number;
  fechaInicio?: Date | string;
  adminId?: number;
  admin?: Admin;
  imagenUrl?: string | null;
  alumnos?: Alumno[];
  profesores?: Profesor[];
}

export interface CreateTallerDto {
  tipo: string;
  descripcion: string;
  capacidad?: number;
  fechaInicio?: string;
  adminId?: number;
  imagenUrl?: string;
}

