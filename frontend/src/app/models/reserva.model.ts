import { Taller } from './taller.model';
import { Admin } from './admin.model';

export interface Reserva {
  id: number;
  espacio: string;
  fecha: Date | string;
  horaInicio?: string;
  horaFin?: string;
  tallerId: number;
  adminId?: number;
  taller?: Taller;
  admin?: Admin;
}

export interface CreateReservaDto {
  espacio: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  tallerId: number;
  adminId?: number;
  profesorId?: number;
}

