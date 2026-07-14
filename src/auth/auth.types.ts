/**
 * =============================================================================
 * 4.5 auth.types.ts — TIPOS TypeScript DEL MÓDULO AUTH
 * =============================================================================
 * Este archivo NO tiene lógica: solo define FORMAS de datos (tipos/interfaces).
 * Sirve para que AuthService, AuthController y JwtStrategy hablen el mismo idioma.
 *
 * Conceptos clave:
 *   - AppRole  = permisos (qué puede hacer en la API)
 *   - UserTipo = perfil (quién es en la escuela)
 *   - JwtPayload = lo que VIAJA DENTRO del token JWT
 *   - AuthUserResponse = lo que ve el frontend en "user"
 *   - LoginResponse = lo que devuelve POST /auth/login
 * =============================================================================
 */

/**
 * AppRole = rol de autorización (permisos).
 * Lo usan guards/policies para decidir si puede crear talleres, ver reportes, etc.
 *
 *   super_admin → control total
 *   admin       → permisos administrativos (incluye profesores en este sistema)
 *   usuario     → alumno / apoderado (acceso limitado)
 */
export type AppRole = 'super_admin' | 'admin' | 'usuario';

/**
 * UserTipo = tipo de perfil (identidad en la app).
 * Distinto del role: un profesor puede tener role='admin' pero tipo='profesor'.
 *
 *   admin      → super administrador
 *   directiva  → directiva del colegio
 *   profesor   → docente de un taller
 *   alumno     → estudiante
 *   apoderado  → apoderado del alumno
 */
export type UserTipo =
  | 'admin'
  | 'directiva'
  | 'profesor'
  | 'alumno'
  | 'apoderado';

/**
 * JwtPayload = contenido que se FIRMA dentro del JWT (lo que "viaja" en el token).
 *
 * Campos:
 *   sub      → id del usuario (estándar JWT: "subject")
 *   role     → permiso
 *   tipo     → perfil
 *   tallerId → opcional; taller asociado (profesor/alumno)
 *   nombre   → para mostrar en la UI sin consultar BD otra vez
 *
 * Ejemplo decodificado (solo ilustrativo):
 *   { sub: 12, role: 'usuario', tipo: 'alumno', tallerId: 3, nombre: 'Ana' }
 */
export interface JwtPayload {
  sub: number; // id del usuario (subject del JWT)
  role: AppRole; // permiso efectivo en la API
  tipo: UserTipo; // perfil humano (quién es)
  tallerId?: number; // ? = opcional; taller ligado si aplica
  nombre: string; // nombre para mostrar en la UI
}

/**
 * AuthUserResponse = datos del usuario que el frontend guarda / muestra tras el login.
 * Es casi igual al payload, pero usa "id" en vez de "sub" (más amigable en UI).
 */
export interface AuthUserResponse {
  id: number; // mismo valor que payload.sub
  nombre: string;
  role: AppRole;
  tipo: UserTipo;
  tallerId?: number;
}

/**
 * LoginResponse = respuesta completa de POST /auth/login.
 *
 *   accessToken → string JWT (el frontend lo manda en Authorization: Bearer ...)
 *   user        → perfil para la interfaz
 *
 * Ejemplo:
 *   {
 *     accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     user: { id: 12, nombre: "Ana", role: "usuario", tipo: "alumno", tallerId: 3 }
 *   }
 */
export interface LoginResponse {
  accessToken: string; // JWT firmado
  user: AuthUserResponse; // datos públicos (sin password)
}
