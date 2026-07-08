export const CANCHA_ESPACIO_DEFAULT = 'Cancha Principal';
export const CANCHA_HORA_INICIO = 9;
export const CANCHA_HORA_FIN = 20;
/** Duración base de cada reserva (minutos) */
export const CANCHA_DURACION_SLOT_MIN = 30;
/** Franja 13:00–14:00 habilitada para todos los talleres, todos los días */
export const CANCHA_HORA_PARA_TODOS = 13;

export function formatMinutosDesdeMedianoche(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatHoraSlot(hora: number, minutos = 0): string {
  return formatMinutosDesdeMedianoche(hora * 60 + minutos);
}

export function sumarMinutosAHora(hora: string, minutos: number): string {
  return formatMinutosDesdeMedianoche(horaAMinutos(hora) + minutos);
}

export function iterarIniciosSlotCancha(): string[] {
  const slots: string[] = [];
  for (
    let m = CANCHA_HORA_INICIO * 60;
    m < CANCHA_HORA_FIN * 60;
    m += CANCHA_DURACION_SLOT_MIN
  ) {
    slots.push(formatMinutosDesdeMedianoche(m));
  }
  return slots;
}

export function esHorarioParaTodos(horaInicio: string): boolean {
  const ini = horaAMinutos(horaInicio);
  const bloqueIni = CANCHA_HORA_PARA_TODOS * 60;
  return ini >= bloqueIni && ini < bloqueIni + 60;
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

/** Lunes de la semana que contiene `fecha` (o hoy) */
export function lunesDeSemana(fecha?: string | Date): string {
  const base = fecha
    ? new Date(`${parseFechaIso(fecha)}T12:00:00`)
    : new Date(new Date().toDateString() + 'T12:00:00');
  const js = base.getDay();
  const diff = js === 0 ? -6 : 1 - js;
  base.setDate(base.getDate() + diff);
  return parseFechaIso(base);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return parseFechaIso(d);
}

export function diaSemanaDesdeFecha(fecha: string): number {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

/** Normaliza a YYYY-MM-DD sin desfase UTC */
export function parseFechaIso(fecha: string | Date): string {
  if (!fecha) return '';
  if (fecha instanceof Date) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return fecha.split('T')[0];
}

/** Date local al mediodía para columnas `date` en PostgreSQL */
export function fechaLocal(fecha: string | Date): Date {
  return new Date(`${parseFechaIso(fecha)}T12:00:00`);
}
