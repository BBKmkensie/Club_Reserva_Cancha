/**
 * Constantes y validaciones de edad para alumnos.
 * Define el rango permitido y funciones auxiliares de comprobación.
 */
/** Edad mínima permitida para un alumno. */
export const EDAD_ALUMNO_MIN = 18;
/** Edad máxima permitida para un alumno. */
export const EDAD_ALUMNO_MAX = 60;

/** Indica si la edad está dentro del rango válido (18–60). */
export function edadAlumnoValida(edad: number | null | undefined): boolean {
  return edad != null && edad >= EDAD_ALUMNO_MIN && edad <= EDAD_ALUMNO_MAX;
}

/** Edad determinística en rango 18–60 según id del alumno. */
export function edadSugeridaParaAlumno(alumnoId: number): number {
  return (alumnoId % (EDAD_ALUMNO_MAX - EDAD_ALUMNO_MIN + 1)) + EDAD_ALUMNO_MIN;
}
