/**
 * Interceptor HTTP de autenticación.
 * Adjunta el token JWT a las peticiones y cierra sesión ante respuestas 401.
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthRoleService } from '../services/auth-role.service';

/** Inyecta Authorization Bearer y redirige al login si la API responde no autorizado. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthRoleService);
  const router = inject(Router);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/auth/login')) {
        auth.clear();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
