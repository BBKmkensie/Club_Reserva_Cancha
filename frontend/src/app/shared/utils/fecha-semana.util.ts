/** Utilidades de fechas para calendario de cancha (semana Lunes–Domingo) */
export function parseFechaIso(fecha: string | Date): string {
  if (fecha instanceof Date) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return fecha.split('T')[0];
}

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

export function esHoy(fecha: string): boolean {
  return fecha === parseFechaIso(new Date());
}

export const DIAS_CORTO = ['', 'L', 'M', 'M', 'J', 'V', 'S', 'D'];
export const DIAS_LARGO = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function diaSemanaDesdeFecha(fecha: string): number {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

export function etiquetaDiaCorto(fecha: string): string {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  const dia = DIAS_CORTO[diaSemanaDesdeFecha(fecha)];
  const mes = MESES[d.getMonth()].slice(0, 3);
  return `${dia}, ${mes}. ${d.getDate()}. ${d.getFullYear()}`;
}
