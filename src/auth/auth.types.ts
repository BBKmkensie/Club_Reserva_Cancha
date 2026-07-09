/**
 * Tipos compartidos del módulo de autenticación.
 * Define roles, payload JWT y respuestas de login.
 */

/** Rol de autorización usado en guards y políticas de acceso. */
export type AppRole = 'super_admin' | 'admin' | 'usuario';

/** Tipo de perfil del usuario autenticado (distinto del rol de permisos). */
export type UserTipo = 'admin' | 'directiva' | 'profesor' | 'alumno' | 'apoderado';

/** Contenido del token JWT emitido tras un login exitoso. */
export interface JwtPayload {
  sub: number;
  role: AppRole;
  tipo: UserTipo;
  tallerId?: number;
  nombre: string;
}

/** Datos del usuario expuestos al cliente tras autenticarse. */
export interface AuthUserResponse {
  id: number;
  nombre: string;
  role: AppRole;
  tipo: UserTipo;
  tallerId?: number;
}

/** Respuesta estándar del endpoint de login. */
export interface LoginResponse {
  accessToken: string;
  user: AuthUserResponse;
}
