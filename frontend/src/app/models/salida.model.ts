import { Taller } from './taller.model';
import { Admin } from './admin.model';
import { Profesor } from './profesor.model';

export type OrigenSalida = 'ASIGNACION_DIRECTIVA' | 'PROPUESTA_PROFESOR';
export type EstadoSalida =
  | 'PENDIENTE_PROFESOR'
  | 'PENDIENTE_DIRECTIVA'
  | 'PUBLICADA'
  | 'EN_CURSO'
  | 'CERRADA'
  | 'RECHAZADA';
export type ResultadoSalida = 'EXITO' | 'FRACASO';

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

export interface CreateSalidaDto {
  destino: string;
  fecha: string;
  hora?: string;
  descripcion?: string;
  tallerId: number;
  adminId?: number;
  profesorId?: number;
}

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
