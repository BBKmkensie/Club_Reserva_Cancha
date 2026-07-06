export interface NotificacionNav {
  id?: number;
  tipo?: string;
  titulo?: string;
  refId?: number | null;
}

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

function inferirTipo(titulo?: string): string | undefined {
  if (!titulo) return undefined;
  const t = titulo.toLowerCase();
  if (t.includes('propuesta de actividad')) return 'propuesta_actividad';
  if (t.includes('rechazó asignación')) return 'asignacion_rechazada';
  if (t.includes('asignación')) return 'asignacion_actividad';
  if (t.includes('ausencia')) return 'ausencia_recurrente';
  return undefined;
}
