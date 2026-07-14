/**
 * =============================================================================
 * app/shared/guards/auth.guard.ts — Guard de autenticación
 * =============================================================================
 * CanActivateFn = función que Angular ejecuta ANTES de entrar a una ruta.
 * Si retorna true → deja pasar; si retorna false → bloquea la navegación.
 *
 * Aquí: consulta AuthRoleService.isLoggedIn() (¿hay token JWT + rol?).
 * Sin sesión → redirige a /login.
 *
 * Se usa en app.routes.ts: canActivate: [authGuard]
 * =============================================================================
 */

// inject() = obtener un servicio dentro de una función (sin clase/constructor).
import { inject } from '@angular/core';

// CanActivateFn = tipo de guard moderno (functional guard).
// Router = para navegar a /login si no hay sesión.
import { CanActivateFn, Router } from '@angular/router';

// Fuente de verdad de la sesión (token + rol en signals / localStorage).
import { AuthRoleService } from '../services/auth-role.service';

/**
 * authGuard se ejecuta al intentar abrir una ruta protegida.
 * No recibe parámetros aquí: solo mira si hay sesión activa.
 */
export const authGuard: CanActivateFn = () => {
  // Pedimos el servicio de sesión
  const auth = inject(AuthRoleService);

  // Pedimos el router para poder redirigir
  const router = inject(Router);

  // isLoggedIn() = true si hay token Y rol (computed signal)
  if (auth.isLoggedIn()) {
    // Hay sesión → permitir entrar a la ruta
    return true;
  }

  // No hay sesión → mandar al login
  router.navigate(['/login']);

  // false = bloquear la navegación original (no se muestra la página protegida)
  return false;
};
