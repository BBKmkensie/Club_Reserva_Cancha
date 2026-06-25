export type OrigenSalida = 'ASIGNACION_DIRECTIVA' | 'PROPUESTA_PROFESOR';

export type EstadoSalida =
  | 'PENDIENTE_PROFESOR'
  | 'PENDIENTE_DIRECTIVA'
  | 'PUBLICADA'
  | 'EN_CURSO'
  | 'CERRADA'
  | 'RECHAZADA';

export type ResultadoSalida = 'EXITO' | 'FRACASO';

export const ESTADOS_SALIDA_VISIBLES_ESTUDIANTE: EstadoSalida[] = [
  'PUBLICADA',
  'EN_CURSO',
  'CERRADA',
];
