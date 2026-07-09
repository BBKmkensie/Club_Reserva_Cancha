/**
 * Modelos de validación de inscripción a talleres.
 * Resultado de reglas de cupo, horario y elegibilidad del alumno.
 */

/** Resultado de validar si un alumno puede inscribirse en un taller. */
export interface ValidacionInscripcionTaller {
  puedeInscribirse: boolean;
  cuposOcupados: number;
  cuposDisponibles: number;
  capacidad: number;
  conflictoHorario: boolean;
  sinCupo?: boolean;
  tallerConflicto?: string;
  motivo?: string;
  advertencias?: string[];
  tieneProfesor?: boolean;
  cantidadOtrasInscripciones?: number;
}
