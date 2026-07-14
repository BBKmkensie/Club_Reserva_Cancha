/**
 * =============================================================================
 * app/shared/utils/fecha-semana.util.ts — Utilidades de fechas y calendario
 * =============================================================================
 * Funciones para manejar fechas ISO, semanas (lunes–domingo), grillas mensuales
 * y etiquetas legibles. Se usa en fecha-picker, cancha-semana-vista y filtros
 * de fechas en toda la app.
 *
 * Exporta: parseFechaIso(), lunesDeSemana(), sumarDias(), esHoy(),
 *          diaSemanaDesdeFecha(), etiquetaDiaCorto(), celdasDelMes(),
 *          constantes DIAS_CORTO, DIAS_LARGO, MESES.
 * =============================================================================
 */

/**
 * Convierte un objeto Date o una cadena ISO a formato YYYY-MM-DD.
 * Ignora la parte horaria si la cadena incluye «T».
 */
export function parseFechaIso(fecha: string | Date): string {
  if (fecha instanceof Date) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return fecha.split('T')[0];
}

/**
 * Devuelve la fecha del lunes de la semana que contiene la fecha dada.
 * Si no se pasa fecha, usa la semana actual.
 */
export function lunesDeSemana(fecha?: string | Date): string {
  const base = fecha
    ? new Date(`${parseFechaIso(fecha)}T12:00:00`)
    : new Date(new Date().toDateString() + 'T12:00:00');
  const js = base.getDay();
  const diff = js === 0 ? -6 : 1 - js;
  base.setDate(base.getDate() + diff);
  return parseFechaIso(base);
}

/**
 * Suma (o resta) días a una fecha ISO y devuelve el resultado en YYYY-MM-DD.
 */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return parseFechaIso(d);
}

/**
 * Indica si la fecha dada coincide con el día de hoy.
 */
export function esHoy(fecha: string): boolean {
  return fecha === parseFechaIso(new Date());
}

/** Letras abreviadas de los días (índice 1 = lunes, 7 = domingo). */
export const DIAS_CORTO = ['', 'L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Nombres completos de los días de la semana (índice 1 = lunes). */
export const DIAS_LARGO = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Nombres de los meses en español (índice 0 = enero). */
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Calcula el día de la semana como número 1–7 (lunes = 1, domingo = 7)
 * a partir de una fecha ISO.
 */
export function diaSemanaDesdeFecha(fecha: string): number {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

/**
 * Genera una etiqueta corta legible para el calendario.
 * Formato: «L, Ene. 15. 2026».
 */
export function etiquetaDiaCorto(fecha: string): string {
  const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
  const dia = DIAS_CORTO[diaSemanaDesdeFecha(fecha)];
  const mes = MESES[d.getMonth()].slice(0, 3);
  return `${dia}, ${mes}. ${d.getDate()}. ${d.getFullYear()}`;
}

/** Representa una celda de la grilla mensual del calendario. */
export interface CeldaMes {
  fecha: string;
  num: number;
  mesActual: boolean;
}

/**
 * Genera la grilla de 6 semanas (42 celdas) para un mes dado.
 * La semana empieza en lunes; incluye días del mes anterior y siguiente.
 */
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
