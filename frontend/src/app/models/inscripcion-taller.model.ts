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
