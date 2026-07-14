/**
 * =============================================================================
 * app/models/reserva.model.ts — Tipos de reserva de cancha
 * =============================================================================
 * Interfaces para reservas del espacio deportivo (Cancha Principal).
 * Usadas en reservas.component y taller-detail (reservas del taller).
 * =============================================================================
 */
import { Taller } from './taller.model';
import { Admin } from './admin.model';

/** Reserva de espacio con franja horaria y relaciones a taller y admin. */
export interface Reserva {
  // Identificador único de la reserva.
  id: number;
  // Nombre del espacio (ej. "Cancha Principal").
  espacio: string;
  // Día de la reserva (Date del backend o string ISO).
  fecha: Date | string;
  // Hora de inicio (ej. "16:00").
  horaInicio?: string;
  // Hora de fin (ej. "17:00").
  horaFin?: string;
  // FK del taller que reserva la cancha.
  tallerId: number;
  // FK del admin que creó la reserva (opcional).
  adminId?: number;
  // Relación cargada: objeto Taller completo.
  taller?: Taller;
  // Relación cargada: objeto Admin.
  admin?: Admin;
}

/** Payload para solicitar una nueva reserva (POST /reserva). */
export interface CreateReservaDto {
  // Espacio a reservar.
  espacio: string;
  // Fecha en formato string (YYYY-MM-DD).
  fecha: string;
  // Inicio de la franja.
  horaInicio?: string;
  // Fin de la franja.
  horaFin?: string;
  // Taller que usará la cancha.
  tallerId: number;
  // Admin que registra (opcional).
  adminId?: number;
  // Profesor asociado (opcional; algunos flujos lo envían).
  profesorId?: number;
}
