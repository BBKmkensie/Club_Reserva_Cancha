import { Taller } from './taller.model';
import { Admin } from './admin.model';
import { Profesor } from './profesor.model';

export interface Salida {
  id: number;
  destino: string;
  fecha: Date | string;
  hora?: string;
  descripcion?: string;
  tallerId: number;
  adminId?: number;
  profesorId?: number;
  taller?: Taller;
  admin?: Admin;
  profesor?: Profesor;
}

export interface CreateSalidaDto {
  destino: string;
  fecha: string;
  hora?: string;
  descripcion?: string;
  tallerId: number;
  adminId?: number;
  profesorId?: number;
}

