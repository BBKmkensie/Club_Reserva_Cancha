/**
 * Constantes y utilidades de horarios y fechas de la cancha.
 * Define slots, franjas horarias y funciones de cálculo temporal.
 */
/** Nombre del espacio deportivo por defecto. */
export const CANCHA_ESPACIO_DEFAULT = 'Cancha Principal';
/** Hora de apertura de la cancha (formato 24 h). */
export const CANCHA_HORA_INICIO = 9;
/** Hora de cierre de la cancha (formato 24 h). */
export const CANCHA_HORA_FIN = 20;
/** Duración base de cada reserva (minutos) */
export const CANCHA_DURACION_SLOT_MIN = 30;
/** Franja 13:00–14:00 habilitada para todos los talleres, todos los días */
export const CANCHA_HORA_PARA_TODOS = 13;

/** Convierte minutos desde medianoche a cadena HH:MM. */
export function formatMinutosDesdeMedianoche(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Formatea hora y minutos opcionales como HH:MM. */
export function formatHoraSlot(hora: number, minutos = 0): string {
  return formatMinutosDesdeMedianoche(hora * 60 + minutos);
}

/** Suma minutos a una hora HH:MM y devuelve el resultado formateado. */
export function sumarMinutosAHora(hora: string, minutos: number): string {
  return formatMinutosDesdeMedianoche(horaAMinutos(hora) + minutos);
}

/** Genera los inicios de slot disponibles entre apertura y cierre de cancha. */
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

/** Indica si la hora cae en la franja 13:00–14:00 abierta para todos los talleres. */
export function esHorarioParaTodos(horaInicio: string): boolean {
  const ini = horaAMinutos(horaInicio);
  const bloqueIni = CANCHA_HORA_PARA_TODOS * 60;
  return ini >= bloqueIni && ini < bloqueIni + 60;
}

/** Normaliza una hora a HH:MM o cadena vacía si es nula. */
export function normalizarHora(hora: string | null | undefined): string {
  if (!hora) return '';
  return hora.substring(0, 5);
}

/** Convierte una hora HH:MM a minutos desde medianoche. */
export function horaAMinutos(hora: string): number {
  const [h, m] = normalizarHora(hora).split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Comprueba si dos intervalos horarios se solapan. */
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

/** Suma días a una fecha ISO y devuelve YYYY-MM-DD. */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return parseFechaIso(d);
}

/** Devuelve el día de la semana (1=lunes … 7=domingo) de una fecha ISO. */
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
