import { HORARIOS_OFICIALES_TALLERES } from './horarios-oficiales.pool';

/** Talleres deportivos que usan la cancha en horario fijo todo el semestre */
export const TALLERES_RESERVA_CANCHA_SEMESTRE = ['Futbol', 'Voley'] as const;

export type TallerReservaCanchaSemestre = (typeof TALLERES_RESERVA_CANCHA_SEMESTRE)[number];

export function horariosCanchaDeportesSemestre() {
  return HORARIOS_OFICIALES_TALLERES.filter((item) =>
    TALLERES_RESERVA_CANCHA_SEMESTRE.includes(item.tipo as TallerReservaCanchaSemestre),
  );
}
