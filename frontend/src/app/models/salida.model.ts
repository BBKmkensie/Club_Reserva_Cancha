/**
 * Modelos de salida pedagógica o actividad fuera del establecimiento.
 * Tipos, estados del flujo directiva–profesor y utilidades de etiquetado en UI.
 */
import { Taller } from './taller.model';
import { Admin } from './admin.model';
import { Profesor } from './profesor.model';

/** Origen de la salida: asignación directiva o propuesta del profesor. */
export type OrigenSalida = 'ASIGNACION_DIRECTIVA' | 'PROPUESTA_PROFESOR';

/** Estado del ciclo de aprobación, ejecución y cierre de una salida. */
export type EstadoSalida =
  | 'PENDIENTE_PROFESOR'
  | 'PENDIENTE_DIRECTIVA'
  | 'PUBLICADA'
  | 'EN_CURSO'
  | 'CERRADA'
  | 'RECHAZADA';

/** Resultado final al cerrar una salida ya realizada. */
export type ResultadoSalida = 'EXITO' | 'FRACASO';

/** Salida con destino, fechas, responsables y relaciones cargadas. */
export interface Salida {
  id: number;
  destino: string;
  fecha: Date | string;
  hora?: string;
  descripcion?: string;
  tallerId: number;
  adminId?: number | null;
  profesorId?: number | null;
  origen?: OrigenSalida;
  estado?: EstadoSalida;
  resultado?: ResultadoSalida | null;
  comentarioCierre?: string | null;
  comentarioApertura?: string | null;
  motivoRechazo?: string | null;
  fechaApertura?: string | null;
  fechaCierre?: string | null;
  fechaRespuesta?: string | null;
  taller?: Taller;
  admin?: Admin;
  profesor?: Profesor;
}

/** Payload para crear o proponer una nueva salida. */
export interface CreateSalidaDto {
  destino: string;
  fecha: string;
  hora?: string;
  descripcion?: string;
  tallerId: number;
  adminId?: number;
  profesorId?: number;
}

/** Texto descriptivo del flujo de aprobación según origen y estado actual. */
export function etiquetaFlujoSalida(s: Salida): string {
  if (s.estado === 'RECHAZADA') return 'Rechazada';
  if (s.estado === 'PENDIENTE_PROFESOR') {
    return 'Directiva asignó · esperando profesor';
  }
  if (s.estado === 'PENDIENTE_DIRECTIVA') {
    return `Propuesta de ${s.profesor?.nombre ?? 'profesor'} · esperando directiva`;
  }
  if (s.origen === 'ASIGNACION_DIRECTIVA') {
    return `Directiva asignó · aceptada por ${s.profesor?.nombre ?? 'profesor'}`;
  }
  return `Propuesta de ${s.profesor?.nombre ?? 'profesor'} · aceptada por directiva`;
}

/** Etiqueta legible del estado operativo de la salida para listados y detalle. */
export function etiquetaEstadoSalida(s: Salida): string {
  switch (s.estado) {
    case 'PENDIENTE_PROFESOR': return 'Pendiente profesor';
    case 'PENDIENTE_DIRECTIVA': return 'Pendiente directiva';
    case 'PUBLICADA': return 'Publicada';
    case 'EN_CURSO': return 'En curso';
    case 'CERRADA': return s.resultado === 'EXITO' ? 'Cerrada · Éxito' : 'Cerrada · Fracaso';
    case 'RECHAZADA': return 'Rechazada';
    default: return 'Publicada';
  }
}
