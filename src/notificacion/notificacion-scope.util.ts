import { ForbiddenException } from '@nestjs/common';
import { JwtPayload } from '../auth/auth.types';

export type NotificacionScope = 'alumno' | 'profesor' | 'admin';

/** Determina qué bandeja de notificaciones corresponde al usuario autenticado. */
export function resolveNotificacionScope(user: JwtPayload): NotificacionScope {
  switch (user.tipo) {
    case 'alumno':
      return 'alumno';
    case 'profesor':
      return 'profesor';
    case 'admin':
    case 'directiva':
      return 'admin';
    default:
      throw new ForbiddenException('Este perfil no tiene notificaciones in-app');
  }
}

/** Valida que el id de la URL coincida con el usuario del JWT y el scope esperado. */
export function assertNotificacionOwner(
  user: JwtPayload,
  scope: NotificacionScope,
  ownerId: number,
): void {
  const expected = resolveNotificacionScope(user);
  if (expected !== scope) {
    throw new ForbiddenException('No puedes acceder a notificaciones de otro perfil');
  }
  if (user.sub !== ownerId) {
    throw new ForbiddenException('No puedes acceder a notificaciones de otro usuario');
  }
}
