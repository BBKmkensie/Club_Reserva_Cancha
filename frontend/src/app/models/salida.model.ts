/**
 * =============================================================================
 * app/models/salida.model.ts — Tipos de salida pedagógica
 * =============================================================================
 * Interfaces, estados y utilidades de etiquetado para salidas fuera del colegio.
 * Flujo: directiva asigna o profesor propone → aprobación → publicación → cierre.
 * Funciones etiquetaFlujoSalida y etiquetaEstadoSalida formatean textos para la UI.
 * =============================================================================
 */
import { Taller } from './taller.model';
import { Admin } from './admin.model';
import { Profesor } from './profesor.model';

/** Origen de la salida: asignación directiva o propuesta del profesor. */
export type OrigenSalida = 'ASIGNACION_DIRECTIVA' | 'PROPUESTA_PROFESOR';

/**
 * Estado del ciclo de aprobación, ejecución y cierre.
 * PENDIENTE_* → PUBLICADA → EN_CURSO → CERRADA (o RECHAZADA).
 */
export type EstadoSalida =
  | 'PENDIENTE_PROFESOR'
  | 'PENDIENTE_DIRECTIVA'
  | 'PUBLICADA'
  | 'EN_CURSO'
  | 'CERRADA'
  | 'RECHAZADA';

/** Resultado final al cerrar una salida ya realizada. */
export type ResultadoSalida = 'EXITO' | 'FRACASO';

/** Salidas donde ya se puede ver o registrar asistencia. */
export function salidaPermiteAsistencia(s: Salida): boolean {
  const estado = String(s.estado ?? 'PUBLICADA').toUpperCase();
  return estado === 'PUBLICADA' || estado === 'EN_CURSO' || estado === 'CERRADA';
}

/** Salida con destino, fechas, responsables y relaciones cargadas. */
export interface Salida {
  // Identificador único.
  id: number;
  // Lugar de destino (ej. "Museo Nacional").
  destino: string;
  // Día de la salida.
  fecha: Date | string;
  // Hora de salida (opcional, HH:mm).
  hora?: string;
  // Descripción / notas de la actividad.
  descripcion?: string;
  // FK del taller asociado.
  tallerId: number;
  // FK del admin (directiva) que intervino.
  adminId?: number | null;
  // FK del profesor responsable.
  profesorId?: number | null;
  // Quién originó la salida (asignación vs propuesta).
  origen?: OrigenSalida;
  // Estado actual en el flujo.
  estado?: EstadoSalida;
  // Resultado al cerrar (solo si estado = CERRADA).
  resultado?: ResultadoSalida | null;
  // Comentario del profesor al cerrar.
  comentarioCierre?: string | null;
  // Comentario al abrir la salida el día de.
  comentarioApertura?: string | null;
  // Motivo si fue rechazada.
  motivoRechazo?: string | null;
  // Timestamp de apertura (ISO).
  fechaApertura?: string | null;
  // Timestamp de cierre (ISO).
  fechaCierre?: string | null;
  // Timestamp de la respuesta aceptar/rechazar (ISO).
  fechaRespuesta?: string | null;
  // Relación cargada: taller.
  taller?: Taller;
  // Relación cargada: admin.
  admin?: Admin;
  // Relación cargada: profesor.
  profesor?: Profesor;
}

/** Payload para crear o proponer una nueva salida. */
export interface CreateSalidaDto {
  // Destino (obligatorio).
  destino: string;
  // Fecha en string (YYYY-MM-DD).
  fecha: string;
  // Hora opcional.
  hora?: string;
  // Descripción opcional.
  descripcion?: string;
  // Taller al que pertenece.
  tallerId: number;
  // Admin que asigna (flujo directiva).
  adminId?: number;
  // Profesor responsable.
  profesorId?: number;
}

/**
 * Texto descriptivo del flujo de aprobación según origen y estado.
 * Ej.: "Directiva asignó · esperando profesor"
 */
export function etiquetaFlujoSalida(s: Salida): string {
  // Rechazada: mensaje corto.
  if (s.estado === 'RECHAZADA') return 'Rechazada';
  // Esperando que el profesor acepte la asignación de directiva.
  if (s.estado === 'PENDIENTE_PROFESOR') {
    return 'Directiva asignó · esperando profesor';
  }
  // Esperando que la directiva apruebe la propuesta del profesor.
  if (s.estado === 'PENDIENTE_DIRECTIVA') {
    return `Propuesta de ${s.profesor?.nombre ?? 'profesor'} · esperando directiva`;
  }
  // Ya aceptada: distingue origen para el texto.
  if (s.origen === 'ASIGNACION_DIRECTIVA') {
    return `Directiva asignó · aceptada por ${s.profesor?.nombre ?? 'profesor'}`;
  }
  return `Propuesta de ${s.profesor?.nombre ?? 'profesor'} · aceptada por directiva`;
}

/**
 * Etiqueta legible del estado operativo para listados y detalle.
 * Si está CERRADA, incorpora el resultado (Éxito / Fracaso).
 */
export function etiquetaEstadoSalida(s: Salida): string {
  switch (s.estado) {
    case 'PENDIENTE_PROFESOR': return 'Pendiente profesor';
    case 'PENDIENTE_DIRECTIVA': return 'Pendiente directiva';
    case 'PUBLICADA': return 'Publicada';
    case 'EN_CURSO': return 'En curso';
    case 'CERRADA': return s.resultado === 'EXITO' ? 'Cerrada · Éxito' : 'Cerrada · Fracaso';
    case 'RECHAZADA': return 'Rechazada';
    // Sin estado → se asume publicada (compatibilidad con datos viejos).
    default: return 'Publicada';
  }
}
