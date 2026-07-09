/**
 * Modelos de reserva de cancha o espacio deportivo.
 * Tipos para consulta y creación de reservas por taller.
 */
import { Taller } from './taller.model';
import { Admin } from './admin.model';

/** Reserva de espacio con franja horaria y relaciones a taller y admin. */
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

/** Payload para solicitar una nueva reserva de cancha. */
export interface CreateReservaDto {
  espacio: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  tallerId: number;
  adminId?: number;
  profesorId?: number;
}
