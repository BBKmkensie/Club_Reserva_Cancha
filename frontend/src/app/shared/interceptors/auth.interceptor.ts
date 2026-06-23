import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthRoleService } from '../services/auth-role.service';

const RUTAS_PUBLICAS_API = [
  '/auth/login',
  '/taller/catalogo',
  '/profesor/login',
];

function esRutaPublica(url: string): boolean {
  return RUTAS_PUBLICAS_API.some((ruta) => url.includes(ruta));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthRoleService);
  const router = inject(Router);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !esRutaPublica(req.url)) {
        auth.clear();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
