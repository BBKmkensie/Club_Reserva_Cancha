/**
 * =============================================================================
 * salida/salida.types.ts — TIPOS Y ESTADOS DEL CICLO DE VIDA
 * =============================================================================
 * Define los "vocabulario" de estados que usa SalidaService y el frontend.
 *
 * Flujo típico A (directiva asigna):
 *   ASIGNACION_DIRECTIVA → PENDIENTE_PROFESOR → PUBLICADA → EN_CURSO → CERRADA
 *                                        ↘ RECHAZADA
 *
 * Flujo típico B (profesor propone):
 *   PROPUESTA_PROFESOR → PENDIENTE_DIRECTIVA → PUBLICADA → EN_CURSO → CERRADA
 *                                         ↘ RECHAZADA
 *
 * Al cerrar se guarda ResultadoSalida: EXITO | FRACASO.
 * =============================================================================
 */

/** Origen de la salida: asignación directa de directiva o propuesta de profesor. */
export type OrigenSalida = 'ASIGNACION_DIRECTIVA' | 'PROPUESTA_PROFESOR';

/** Estado del flujo de aprobación y ejecución de una salida deportiva. */
export type EstadoSalida =
  | 'PENDIENTE_PROFESOR'   // directiva asignó; espera que el profe acepte
  | 'PENDIENTE_DIRECTIVA'  // profe propuso; espera que directiva acepte
  | 'PUBLICADA'            // aprobada; visible para alumnos
  | 'EN_CURSO'             // el profe la abrió el día del evento
  | 'CERRADA'              // finalizada con resultado
  | 'RECHAZADA';           // alguien rechazó la propuesta/asignación

/** Resultado final de una salida deportiva ya cerrada. */
export type ResultadoSalida = 'EXITO' | 'FRACASO';

/**
 * Estados que el portal del estudiante puede ver / inscribirse.
 * Pendientes y rechazadas NO se listan para alumnos.
 */
export const ESTADOS_SALIDA_VISIBLES_ESTUDIANTE: EstadoSalida[] = [
  'PUBLICADA',
  'EN_CURSO',
  'CERRADA',
];
