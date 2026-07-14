/**
 * =============================================================================
 * app/models/inscripcion-taller.model.ts — Validación de inscripción
 * =============================================================================
 * Resultado de las reglas de negocio al intentar inscribirse en un taller:
 * cupos, conflictos de horario, elegibilidad y advertencias.
 * Usado en inscripcion-talleres y taller-detail antes de solicitarInscripcionTaller.
 * =============================================================================
 */

/** Resultado de validar si un alumno puede inscribirse en un taller. */
export interface ValidacionInscripcionTaller {
  // true = puede continuar con la solicitud de inscripción.
  puedeInscribirse: boolean;
  // Cuántos cupos ya están ocupados.
  cuposOcupados: number;
  // Cupos que quedan libres.
  cuposDisponibles: number;
  // Capacidad máxima del taller.
  capacidad: number;
  // true = el horario choca con otra inscripción del alumno.
  conflictoHorario: boolean;
  // true = no hay cupos (atajo de UI).
  sinCupo?: boolean;
  // Nombre del taller con el que hay conflicto de horario.
  tallerConflicto?: string;
  // Motivo textual si no puede inscribirse.
  motivo?: string;
  // Avisos no bloqueantes (ej. "ya tienes N inscripciones").
  advertencias?: string[];
  // Si el taller ya tiene profesor asignado.
  tieneProfesor?: boolean;
  // Cuántas otras inscripciones activas tiene el alumno.
  cantidadOtrasInscripciones?: number;
}
