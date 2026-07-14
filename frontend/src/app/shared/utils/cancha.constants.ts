/**
 * =============================================================================
 * app/shared/utils/cancha.constants.ts — Constantes de la cancha deportiva
 * =============================================================================
 * Define el horario de operación, slots de 30 minutos, selectores de hora y
 * duraciones permitidas para franjas de reserva. Se usa en reservas, hora-picker
 * y cancha-semana-vista.
 *
 * Exporta: constantes numéricas, SLOTS_FRANJA_CANCHA, HORAS_SELECTOR,
 *          fmtSlotInicio(), fmtSlotFin(), esSlotParaTodos().
 * =============================================================================
 */

/** Hora de apertura de la cancha (09:00). */
export const CANCHA_HORA_INICIO = 9;

/** Hora de cierre de la cancha (20:00). */
export const CANCHA_HORA_FIN = 20;

/** Duración estándar de cada slot de reserva en minutos. */
export const CANCHA_DURACION_SLOT_MIN = 30;

/** Representa el inicio de una franja de reserva con hora, minuto y clave HH:mm. */
export interface SlotFranjaCancha {
  hora: number;
  minuto: number;
  key: string;
}

/**
 * Genera todos los inicios de franja cada 30 minutos entre apertura y cierre.
 * La última franja es 19:30–20:00.
 */
export const SLOTS_FRANJA_CANCHA: SlotFranjaCancha[] = (() => {
  const slots: SlotFranjaCancha[] = [];
  for (let h = CANCHA_HORA_INICIO; h < CANCHA_HORA_FIN; h++) {
    for (const minuto of [0, 30]) {
      slots.push({
        hora: h,
        minuto,
        key: `${String(h).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`,
      });
    }
  }
  return slots;
})();

/** @deprecated usar SLOTS_FRANJA_CANCHA */
export const HORAS_FRANJA_CANCHA = SLOTS_FRANJA_CANCHA.map((s) => s.hora);

/**
 * Opciones de hora para el selector desplegable (09:00 … 20:00).
 * Incluye la hora de cierre para rangos que terminan a las 20:00.
 */
export const HORAS_SELECTOR = Array.from(
  { length: CANCHA_HORA_FIN - CANCHA_HORA_INICIO + 1 },
  (_, i) => String(CANCHA_HORA_INICIO + i).padStart(2, '0'),
);

/** Duraciones permitidas de una franja de reserva, en minutos. */
export const DURACIONES_FRANJA_MIN = [30, 60, 90, 120, 150, 180] as const;

/**
 * Formatea el inicio de un slot como cadena HH:mm con ceros a la izquierda.
 */
export function fmtSlotInicio(hora: number, minuto: number): string {
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

/**
 * Calcula y formatea el fin de un slot sumando la duración estándar (30 min)
 * al inicio indicado.
 */
export function fmtSlotFin(hora: number, minuto: number): string {
  const total = hora * 60 + minuto + CANCHA_DURACION_SLOT_MIN;
  return fmtSlotInicio(Math.floor(total / 60), total % 60);
}

/**
 * Indica si el slot cae en el bloque 13:00–14:00 reservado para todos los cursos.
 * Ese intervalo tiene reglas especiales de disponibilidad.
 */
export function esSlotParaTodos(hora: number, minuto: number): boolean {
  const ini = hora * 60 + minuto;
  const bloqueIni = 13 * 60;
  return ini >= bloqueIni && ini < bloqueIni + 60;
}
