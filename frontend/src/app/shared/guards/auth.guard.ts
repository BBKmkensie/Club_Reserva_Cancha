/**
 * Guard de rutas basado en sesión.
 * Impide el acceso a rutas protegidas si el usuario no está autenticado.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRoleService } from '../services/auth-role.service';

/** Verifica sesión activa; redirige a /login si no hay token válido. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthRoleService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
