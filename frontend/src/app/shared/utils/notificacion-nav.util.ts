/**
 * Utilidades de navegación a partir de notificaciones del usuario.
 * Mapea tipo/título de notificación a rutas de la aplicación.
 */
/** Notificación mínima para resolver la ruta de destino */
export interface NotificacionNav {
  id?: number;
  tipo?: string;
  titulo?: string;
  refId?: number | null;
}

/**
 * Devuelve la ruta de la app asociada a una notificación, o null si no aplica.
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

/** Infiere el tipo de notificación a partir del título cuando no viene explícito */
function inferirTipo(titulo?: string): string | undefined {
  if (!titulo) return undefined;
  const t = titulo.toLowerCase();
  if (t.includes('propuesta de actividad')) return 'propuesta_actividad';
  if (t.includes('rechazó asignación')) return 'asignacion_rechazada';
  if (t.includes('asignación')) return 'asignacion_actividad';
  if (t.includes('ausencia')) return 'ausencia_recurrente';
  return undefined;
}
