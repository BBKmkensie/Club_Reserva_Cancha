/** Utilidades de fechas para calendario de cancha (semana Lunes–Domingo) */

/** Convierte Date o ISO a cadena YYYY-MM-DD */
export function parseFechaIso(fecha: string | Date): string {
  if (fecha instanceof Date) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return fecha.split('T')[0];
}

/** Fecha del lunes de la semana que contiene la fecha dada (o la semana actual) */
export function lunesDeSemana(fecha?: string | Date): string {
  const base = fecha
    ? new Date(`${parseFechaIso(fecha)}T12:00:00`)
    : new Date(new Date().toDateString() + 'T12:00:00');
  const js = base.getDay();
  const diff = js === 0 ? -6 : 1 - js;
  base.setDate(base.getDate() + diff);
  return parseFechaIso(base);
}

/** Suma días a una fecha ISO y devuelve YYYY-MM-DD */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return parseFechaIso(d);
}

/** Indica si la fecha coincide con el día de hoy */
export function esHoy(fecha: string): boolean {
  return fecha === parseFechaIso(new Date());
}

export const DIAS_CORTO = ['', 'L', 'M', 'M', 'J', 'V', 'S', 'D'];
export const DIAS_LARGO = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Día de la semana 1–7 (lunes=1, domingo=7) a partir de una fecha */
export function diaSemanaDesdeFecha(fecha: string): number {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

/** Etiqueta corta del día para el calendario (ej. "L, Ene. 15. 2026") */
export function etiquetaDiaCorto(fecha: string): string {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  const dia = DIAS_CORTO[diaSemanaDesdeFecha(fecha)];
  const mes = MESES[d.getMonth()].slice(0, 3);
  return `${dia}, ${mes}. ${d.getDate()}. ${d.getFullYear()}`;
}

/** Celda de la grilla mensual del calendario */
export interface CeldaMes {
  fecha: string;
  num: number;
  mesActual: boolean;
}

/** Grilla de 6 semanas para un mes (empieza en lunes) */
export function celdasDelMes(anio: number, mes: number): CeldaMes[] {
  const primerDia = new Date(anio, mes, 1);
  const inicio = new Date(primerDia);
  const js = inicio.getDay();
  inicio.setDate(inicio.getDate() + (js === 0 ? -6 : 1 - js));

  const celdas: CeldaMes[] = [];
  const cursor = new Date(inicio);
  for (let i = 0; i < 42; i++) {
    celdas.push({
      fecha: parseFechaIso(cursor),
      num: cursor.getDate(),
      mesActual: cursor.getMonth() === mes,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return celdas;
}
