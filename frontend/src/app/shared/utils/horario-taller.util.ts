/**
 * =============================================================================
 * app/shared/utils/horario-taller.util.ts — Utilidades de horarios de talleres
 * =============================================================================
 * Funciones para cursos, secciones, etiquetas, ordenamiento y textos resumidos
 * de bloques horarios. Se usa en horarios-taller, gestión de actividades y
 * tarjetas de taller en el dashboard.
 *
 * Exporta: constantes DIAS_SEMANA, CURSOS_TALLER, interfaces, etiquetaCurso(),
 *          fmtHora(), horariosOrdenados(), textoHorarioTaller(), etc.
 * =============================================================================
 */

/** Nombres de los días de la semana (índice 1 = lunes, 7 = domingo). */
export const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Catálogo de cursos con código, etiqueta legible y orden de presentación. */
export const CURSOS_TALLER = [
  { code: '1B', label: '1° Básico', orden: 1 },
  { code: '2B', label: '2° Básico', orden: 2 },
  { code: '3B', label: '3° Básico', orden: 3 },
  { code: '4B', label: '4° Básico', orden: 4 },
  { code: '5B', label: '5° Básico', orden: 5 },
  { code: '6B', label: '6° Básico', orden: 6 },
  { code: '7B', label: '7° Básico', orden: 7 },
  { code: '8B', label: '8° Básico', orden: 8 },
  { code: '1M', label: '1° Medio', orden: 9 },
  { code: '2M', label: '2° Medio', orden: 10 },
  { code: '3M', label: '3° Medio', orden: 11 },
  { code: '4M', label: '4° Medio', orden: 12 },
] as const;

/** Secciones por defecto disponibles en talleres con horario por sección. */
export const SECCIONES_TALLER_DEFAULT = ['A', 'B', 'C', 'D'] as const;

/** Modo de agrupación de horarios: por curso o por sección. */
export type ModoHorarioTaller = 'POR_CURSO' | 'POR_SECCION';

/** Bloque horario individual de un taller (día, rango y grupo opcional). */
export interface TallerHorarioItem {
  id?: number;
  curso?: string | null;
  seccion?: string | null;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

/** Taller con horario legacy (campos únicos) o lista de bloques por curso/sección. */
export interface TallerConHorarios {
  diaSemana?: number | null;
  horaInicio?: string | null;
  horaFin?: string | null;
  modoHorario?: ModoHorarioTaller;
  horarios?: TallerHorarioItem[];
}

/**
 * Convierte un código de curso (p. ej. «3B») a su etiqueta legible («3° Básico»).
 * Si no encuentra el código, devuelve el valor original o «—».
 */
export function etiquetaCurso(code: string | null | undefined): string {
  if (!code) return '—';
  return CURSOS_TALLER.find((c) => c.code === code)?.label ?? code;
}

/**
 * Formatea una hora con segundos (HH:mm:ss) a formato corto HH:mm.
 */
export function fmtHora(hora: string | null | undefined): string {
  if (!hora) return '—';
  return hora.slice(0, 5);
}

/**
 * Genera el texto descriptivo de una fila de horario: día y rango horario.
 * Ejemplo: «Martes 16:00 - 18:00».
 */
export function textoFilaHorario(h: TallerHorarioItem): string {
  const dia = DIAS_SEMANA[h.diaSemana] ?? `Día ${h.diaSemana}`;
  return `${dia} ${fmtHora(h.horaInicio)} - ${fmtHora(h.horaFin)}`;
}

/**
 * Devuelve la lista de horarios del taller ordenada según su modo:
 * semanal (por día/hora), por curso (orden escolar) o por sección (alfabético).
 */
export function horariosOrdenados(taller: TallerConHorarios): TallerHorarioItem[] {
  const lista = taller.horarios ?? [];
  if (!lista.length) return [];

  const sinGrupo = lista.every(esBloqueHorarioSemanal);
  if (sinGrupo) {
    return [...lista].sort((a, b) => {
      if (a.diaSemana !== b.diaSemana) return a.diaSemana - b.diaSemana;
      return fmtHora(a.horaInicio).localeCompare(fmtHora(b.horaInicio));
    });
  }

  const modo = taller.modoHorario ?? 'POR_CURSO';
  return [...lista].sort((a, b) => {
    if (modo === 'POR_SECCION') {
      return (a.seccion ?? '').localeCompare(b.seccion ?? '');
    }
    const oa = CURSOS_TALLER.find((c) => c.code === a.curso)?.orden ?? 99;
    const ob = CURSOS_TALLER.find((c) => c.code === b.curso)?.orden ?? 99;
    return oa - ob;
  });
}

/** Determina si un bloque es de horario semanal (sin curso ni sección real). */
function esBloqueHorarioSemanal(h: TallerHorarioItem): boolean {
  if (h.curso) return false;
  if (!h.seccion) return true;
  return h.seccion === 'General' || /^\d+\|\d{1,2}:\d{2}$/.test(h.seccion);
}

/**
 * Indica si el taller usa bloques semanales sin agrupación por curso o sección.
 * En ese caso la tabla no muestra columna de grupo.
 */
export function horariosSinGrupo(taller: TallerConHorarios): boolean {
  const lista = taller.horarios ?? [];
  return lista.length > 0 && lista.every(esBloqueHorarioSemanal);
}

/**
 * Genera la etiqueta del grupo (curso o sección) para un bloque horario.
 * Ejemplo: «3° Básico» o «Sección A».
 */
export function etiquetaGrupoHorario(h: TallerHorarioItem, modo: ModoHorarioTaller): string {
  if (modo === 'POR_SECCION') return `Sección ${h.seccion ?? '—'}`;
  return etiquetaCurso(h.curso);
}

/**
 * Genera un texto resumido del horario del taller para tarjetas o listados.
 * Concatena todos los bloques con « · » o devuelve un mensaje si no hay horario.
 */
export function textoHorarioTaller(
  taller: TallerConHorarios,
  mensajeSinHorario = 'El horario de este taller aún no se ha agregado.',
): string {
  const ordenados = horariosOrdenados(taller);
  if (ordenados.length) {
    if (horariosSinGrupo(taller)) {
      return ordenados.map((h) => textoFilaHorario(h)).join(' · ');
    }
    const modo = taller.modoHorario ?? 'POR_CURSO';
    return ordenados
      .map((h) => `${etiquetaGrupoHorario(h, modo)}: ${textoFilaHorario(h)}`)
      .join(' · ');
  }
  if (!taller.diaSemana || !taller.horaInicio || !taller.horaFin) {
    return mensajeSinHorario;
  }
  const dia = DIAS_SEMANA[taller.diaSemana] ?? `Día ${taller.diaSemana}`;
  return `${dia} ${fmtHora(taller.horaInicio)} - ${fmtHora(taller.horaFin)}`;
}

/**
 * Devuelve el título apropiado para la tabla de horarios según el modo del taller.
 */
export function tituloTablaHorarios(taller: TallerConHorarios): string {
  if (horariosSinGrupo(taller)) return 'Horario semanal';
  const modo = taller.modoHorario ?? 'POR_CURSO';
  return modo === 'POR_SECCION' ? 'Horarios por sección' : 'Horarios por curso';
}

/**
 * Crea un borrador inicial de horarios por curso con valores por defecto
 * (martes 16:00–18:00) para cada código de CURSOS_TALLER.
 */
export function crearBorradorHorariosPorCurso(): Record<string, { diaSemana: number; horaInicio: string; horaFin: string }> {
  const draft: Record<string, { diaSemana: number; horaInicio: string; horaFin: string }> = {};
  for (const c of CURSOS_TALLER) {
    draft[c.code] = { diaSemana: 2, horaInicio: '16:00', horaFin: '18:00' };
  }
  return draft;
}

/**
 * Crea un borrador inicial de horarios por sección con valores por defecto
 * (martes 16:00–18:00) para cada sección indicada.
 */
export function crearBorradorHorariosPorSeccion(
  secciones: readonly string[] = SECCIONES_TALLER_DEFAULT,
): Record<string, { diaSemana: number; horaInicio: string; horaFin: string }> {
  const draft: Record<string, { diaSemana: number; horaInicio: string; horaFin: string }> = {};
  for (const s of secciones) {
    draft[s] = { diaSemana: 2, horaInicio: '16:00', horaFin: '18:00' };
  }
  return draft;
}
