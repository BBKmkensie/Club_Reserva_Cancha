/**
 * Tipos compartidos del módulo de salidas deportivas.
 * Define origen, estados del ciclo de vida y resultados del evento.
 */

/** Origen de la salida: asignación directa de directiva o propuesta de profesor. */
export type OrigenSalida = 'ASIGNACION_DIRECTIVA' | 'PROPUESTA_PROFESOR';

/** Estado del flujo de aprobación y ejecución de una salida deportiva. */
export type EstadoSalida =
  | 'PENDIENTE_PROFESOR'
  | 'PENDIENTE_DIRECTIVA'
  | 'PUBLICADA'
  | 'EN_CURSO'
  | 'CERRADA'
  | 'RECHAZADA';

/** Resultado final de una salida deportiva ya cerrada. */
export type ResultadoSalida = 'EXITO' | 'FRACASO';

/** Estados de salida visibles para estudiantes en el portal. */
export const ESTADOS_SALIDA_VISIBLES_ESTUDIANTE: EstadoSalida[] = [
  'PUBLICADA',
  'EN_CURSO',
  'CERRADA',
];
