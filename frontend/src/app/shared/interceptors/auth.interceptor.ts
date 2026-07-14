/**
 * =============================================================================
 * app/shared/interceptors/auth.interceptor.ts — Interceptor HTTP de JWT
 * =============================================================================
 * Se ejecuta en TODAS las peticiones HTTP del frontend:
 * 1. Clona la request y agrega header Authorization: Bearer <token>
 * 2. Si la API responde 401 (excepto /auth/login), cierra sesión y va a /login
 *
 * Registrado en main.ts vía provideHttpClient(withInterceptors([authInterceptor])).
 * =============================================================================
 */

// HttpInterceptorFn = tipo de función interceptor (estilo moderno de Angular).
// HttpErrorResponse = objeto de error cuando el servidor falla (401, 404, 500...).
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';

// inject() permite pedir servicios (AuthRoleService, Router) dentro de una función,
// sin usar constructor de una clase.
import { inject } from '@angular/core';

// Router = navegar entre pantallas (ej. ir a /login).
import { Router } from '@angular/router';

// catchError = atrapa errores del Observable HTTP.
// throwError = vuelve a lanzar el error para que el .subscribe({ error }) de la página lo vea.
import { catchError, throwError } from 'rxjs';

// AuthRoleService guarda el JWT, el rol y permite clear() al cerrar sesión.
import { AuthRoleService } from '../services/auth-role.service';

/**
 * authInterceptor:
 *   - req  = la petición HTTP que está por salir (GET/POST/PATCH/DELETE...)
 *   - next = función que continúa la cadena (envía la petición al servidor)
 *
 * Angular llama a esta función ANTES de cada llamada a ApiService.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Pedimos el servicio de sesión (token, rol, clear...)
  const auth = inject(AuthRoleService);

  // Pedimos el router para poder redirigir a /login si el token falla
  const router = inject(Router);

  // Leemos el JWT guardado en memoria / localStorage (null si no hay sesión)
  const token = auth.getToken();

  /**
   * Si hay token:
   *   clonamos la request y le agregamos el header:
   *     Authorization: Bearer eyJhbGciOi...
   * Si NO hay token:
   *   dejamos la request igual (ej. login, o rutas públicas).
   *
   * ¿Por qué clone()? Las requests de Angular son inmutables:
   * no se pueden modificar; hay que crear una copia con cambios.
   */
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  /**
   * next(authReq) = envía la petición (con o sin token) al backend.
   * .pipe(...) = encadena operadores RxJS sobre la respuesta.
   * catchError = se ejecuta SOLO si la API falla (error HTTP).
   */
  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      /**
       * err.status === 401 → "No autorizado" (token inválido, expirado o ausente).
       *
       * !req.url.includes('/auth/login') → NO cerramos sesión si el error
       * viene del propio login (usuario/clave malos). En ese caso solo
       * mostramos el mensaje de error en la pantalla de login.
       */
      if (err.status === 401 && !req.url.includes('/auth/login')) {
        // Borra token, rol, nombre, etc. de memoria y localStorage
        auth.clear();
        // Manda al usuario a la pantalla de login
        router.navigate(['/login']);
      }

      // Re-lanza el error para que la página que hizo el subscribe
      // pueda mostrar su propio mensaje (ej. "No se pudo cargar...").
      return throwError(() => err);
    }),
  );
};
