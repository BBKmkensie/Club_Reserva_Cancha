/**
 * =============================================================================
 * app/shared/utils/notificacion-nav.util.ts — Navegación desde notificaciones
 * =============================================================================
 * Mapea el tipo o título de una notificación a la ruta interna de la app.
 * Se usa en notificaciones-panel para navegar al hacer clic en un aviso.
 *
 * Exporta: NotificacionNav, rutaDesdeNotificacion().
 * =============================================================================
 */

/** Estructura mínima de una notificación para resolver su ruta de destino. */
export interface NotificacionNav {
  id?: number;
  tipo?: string;
  titulo?: string;
  refId?: number | null;
}

/**
 * Devuelve la ruta de la aplicación asociada a una notificación.
 * Si el tipo no tiene destino conocido, devuelve null (la notificación no es clicable).
 */
export function rutaDesdeNotificacion(n: NotificacionNav): string | null {
  const tipo = n.tipo ?? inferirTipo(n.titulo);
  const refId = n.refId ?? undefined;

  switch (tipo) {
    case 'propuesta_actividad':
      return refId != null ? `/propuestas-actividad?id=${refId}` : '/propuestas-actividad';
    case 'propuesta_salida':
    case 'salida_pendiente_directiva':
      return '/inscripcion-salidas';
    case 'asignacion_rechazada':
    case 'asignacion_actividad':
      return '/gestion-actividades';
    case 'ausencia_recurrente':
      return '/reportes-asistencia';
    case 'inscripcion_conflicto':
    case 'inscripcion_sin_cupo':
    case 'propuesta_aceptada':
    case 'propuesta_rechazada':
      return '/inscripcion-talleres';
    default:
      return null;
  }
}

/**
 * Infiere el tipo de notificación a partir del título cuando el backend
 * no envía el campo tipo explícitamente.
 */
function inferirTipo(titulo?: string): string | undefined {
  if (!titulo) return undefined;
  const t = titulo.toLowerCase();
  if (t.includes('propuesta de actividad')) return 'propuesta_actividad';
  if (t.includes('rechazó asignación')) return 'asignacion_rechazada';
  if (t.includes('asignación')) return 'asignacion_actividad';
  if (t.includes('ausencia')) return 'ausencia_recurrente';
  return undefined;
}
