export const CANCHA_ESPACIO_DEFAULT = 'Cancha Principal';
export const CANCHA_HORA_INICIO = 9;
export const CANCHA_HORA_FIN = 21;
/** Franja 13:00–14:00 habilitada para todos los talleres, todos los días */
export const CANCHA_HORA_PARA_TODOS = 13;

export function formatHoraSlot(hora: number): string {
  return `${hora.toString().padStart(2, '0')}:00`;
}

export function normalizarHora(hora: string | null | undefined): string {
  if (!hora) return '';
  return hora.substring(0, 5);
}

export function horaAMinutos(hora: string): number {
  const [h, m] = normalizarHora(hora).split(':').map(Number);
  return h * 60 + (m || 0);
}

export function horariosSolapan(
  inicioA: string,
  finA: string,
  inicioB: string,
  finB: string,
): boolean {
  const a = horaAMinutos(inicioA);
  const b = horaAMinutos(finA);
  const c = horaAMinutos(inicioB);
  const d = horaAMinutos(finB);
  return a < d && c < b;
}

/** Fecha ISO (YYYY-MM-DD) → día semana 1=Lunes … 7=Domingo */
export function diaSemanaDesdeFecha(fecha: string): number {
  const d = new Date(`${fecha}T12:00:00`);
  const js = d.getDay();
  return js === 0 ? 7 : js;
}
