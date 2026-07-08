export const EDAD_ALUMNO_MIN = 18;
export const EDAD_ALUMNO_MAX = 60;

export function edadAlumnoValida(edad: number | null | undefined): boolean {
  return edad != null && edad >= EDAD_ALUMNO_MIN && edad <= EDAD_ALUMNO_MAX;
}

/** Edad determinística en rango 18–60 según id del alumno. */
export function edadSugeridaParaAlumno(alumnoId: number): number {
  return (alumnoId % (EDAD_ALUMNO_MAX - EDAD_ALUMNO_MIN + 1)) + EDAD_ALUMNO_MIN;
}
