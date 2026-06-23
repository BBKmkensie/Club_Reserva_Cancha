export type AppRole = 'super_admin' | 'admin' | 'usuario';
export type UserTipo = 'admin' | 'directiva' | 'profesor' | 'alumno';

export interface JwtPayload {
  sub: number;
  role: AppRole;
  tipo: UserTipo;
  tallerId?: number;
  nombre: string;
}

export interface AuthUserResponse {
  id: number;
  nombre: string;
  role: AppRole;
  tipo: UserTipo;
  tallerId?: number;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUserResponse;
}
