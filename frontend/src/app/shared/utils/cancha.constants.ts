/** Horario de operación de la cancha: 09:00–20:00 */
export const CANCHA_HORA_INICIO = 9;
export const CANCHA_HORA_FIN = 20;

/** Horas de inicio de franja (última: 19:00–20:00) */
export const HORAS_FRANJA_CANCHA = Array.from(
  { length: CANCHA_HORA_FIN - CANCHA_HORA_INICIO },
  (_, i) => CANCHA_HORA_INICIO + i,
);

/** Horas para selector de hora (09:00 … 20:00) */
export const HORAS_SELECTOR = Array.from(
  { length: CANCHA_HORA_FIN - CANCHA_HORA_INICIO + 1 },
  (_, i) => String(CANCHA_HORA_INICIO + i).padStart(2, '0'),
);
