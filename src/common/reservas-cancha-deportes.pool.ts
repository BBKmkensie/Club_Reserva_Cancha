/**
 * Reservas semestrales de cancha para talleres deportivos.
 * Filtra los horarios oficiales de fútbol y vóley para el seed de reservas.
 */
import { HORARIOS_OFICIALES_TALLERES } from './horarios-oficiales.pool';

/** Talleres deportivos que usan la cancha en horario fijo todo el semestre. */
export const TALLERES_RESERVA_CANCHA_SEMESTRE = ['Futbol', 'Voley'] as const;

/** Tipo union de los talleres con reserva semestral de cancha. */
export type TallerReservaCanchaSemestre = (typeof TALLERES_RESERVA_CANCHA_SEMESTRE)[number];

/** Devuelve los horarios oficiales de los talleres deportivos con reserva de cancha. */
export function horariosCanchaDeportesSemestre() {
  return HORARIOS_OFICIALES_TALLERES.filter((item) =>
    TALLERES_RESERVA_CANCHA_SEMESTRE.includes(item.tipo as TallerReservaCanchaSemestre),
  );
}
