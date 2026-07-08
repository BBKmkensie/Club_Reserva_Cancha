/** Horario de operación de la cancha: 09:00–20:00 */
export const CANCHA_HORA_INICIO = 9;
export const CANCHA_HORA_FIN = 20;
export const CANCHA_DURACION_SLOT_MIN = 30;

export interface SlotFranjaCancha {
  hora: number;
  minuto: number;
  key: string;
}

/** Inicios de franja cada 30 min (última: 19:30–20:00) */
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

/** Horas para selector de hora (09:00 … 20:00) */
export const HORAS_SELECTOR = Array.from(
  { length: CANCHA_HORA_FIN - CANCHA_HORA_INICIO + 1 },
  (_, i) => String(CANCHA_HORA_INICIO + i).padStart(2, '0'),
);

export const DURACIONES_FRANJA_MIN = [30, 60, 90, 120, 150, 180] as const;

export function fmtSlotInicio(hora: number, minuto: number): string {
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

export function fmtSlotFin(hora: number, minuto: number): string {
  const total = hora * 60 + minuto + CANCHA_DURACION_SLOT_MIN;
  return fmtSlotInicio(Math.floor(total / 60), total % 60);
}

export function esSlotParaTodos(hora: number, minuto: number): boolean {
  const ini = hora * 60 + minuto;
  const bloqueIni = 13 * 60;
  return ini >= bloqueIni && ini < bloqueIni + 60;
}
