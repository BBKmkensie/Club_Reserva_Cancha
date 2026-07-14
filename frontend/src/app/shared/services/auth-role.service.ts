/**
 * =============================================================================
 * app/shared/services/auth-role.service.ts — Sesión, rol y permisos
 * =============================================================================
 * Servicio central de autenticación del frontend (providedIn: 'root' = un solo
 * ejemplar en toda la app).
 *
 * Persiste en localStorage:
 *   token JWT, rol, userId, tallerId, nombre, tipo de usuario
 *
 * Expone:
 *   - signals privados + computed públicos (reactivos para la UI)
 *   - setSession / clear / getToken (ciclo de vida de la sesión)
 *   - can*() = reglas de autorización usadas en templates y menús
 *
 * Roles (AppRole): super_admin | admin | usuario
 * Tipos (UserTipo): admin | directiva | profesor | alumno | apoderado
 * =============================================================================
 */

// Injectable = marca la clase como servicio inyectable.
// signal = estado reactivo mutable (Angular Signals).
// computed = valor derivado que se recalcula cuando cambian las signals.
import { Injectable, signal, computed } from '@angular/core';

/** Rol de autorización de alto nivel (permisos de menú / can*). */
export type AppRole = 'super_admin' | 'admin' | 'usuario';

/** Tipo concreto de cuenta (quién inició sesión). */
export type UserTipo = 'admin' | 'directiva' | 'profesor' | 'alumno' | 'apoderado';

// Claves de localStorage (prefijo reservas_cancha_ para no chocar con otras apps).
const STORAGE_KEY = 'reservas_cancha_role';
const STORAGE_USER_ID = 'reservas_cancha_user_id';
const STORAGE_TALLER_ID = 'reservas_cancha_taller_id';
const STORAGE_TOKEN = 'reservas_cancha_token';
const STORAGE_NOMBRE = 'reservas_cancha_nombre';
const STORAGE_USER_TIPO = 'reservas_cancha_user_tipo';

@Injectable({
  // Un solo AuthRoleService para toda la aplicación.
  providedIn: 'root',
})
export class AuthRoleService {
  // --- Signals privadas (estado mutable interno) ---
  // Se inicializan leyendo localStorage para sobrevivir un F5.

  // Rol actual (super_admin / admin / usuario) o null si no hay sesión.
  private roleSignal = signal<AppRole | null>(this.loadStoredRole());

  // ID numérico del usuario logueado (alumnoId, profesorId, adminId…).
  private userIdSignal = signal<number | null>(this.loadStoredUserId());

  // Taller asignado al profesor (null para otros roles).
  private tallerIdSignal = signal<number | null>(this.loadStoredTallerId());

  // JWT que el interceptor pone en Authorization: Bearer …
  private tokenSignal = signal<string | null>(this.loadStoredToken());

  // Nombre para mostrar en la navbar.
  private nombreSignal = signal<string | null>(this.loadStoredNombre());

  // Tipo fino de cuenta (alumno, apoderado, directiva…).
  private userTipoSignal = signal<UserTipo | null>(this.loadStoredUserTipo());

  // --- Computed públicos (solo lectura; la UI se suscribe a estos) ---

  /** Rol actual expuesto a templates y otros servicios. */
  currentRole = computed(() => this.roleSignal());

  /** ID del usuario logueado. */
  currentUserId = computed(() => this.userIdSignal());

  /** Taller del profesor (si aplica). */
  currentTallerId = computed(() => this.tallerIdSignal());

  /** Nombre visible. */
  currentNombre = computed(() => this.nombreSignal());

  /** Tipo de cuenta (alumno, profesor…). */
  currentUserTipo = computed(() => this.userTipoSignal());

  /** JWT (alias de getToken vía signal). */
  accessToken = computed(() => this.tokenSignal());

  // --- Flags de rol/tipo (atajos booleanos para *ngIf / @if) ---

  /** ¿Es super administrador? */
  isSuperAdmin = computed(() => this.roleSignal() === 'super_admin');

  /** ¿Es cuenta de tipo directiva? */
  isDirectiva = computed(() => this.userTipoSignal() === 'directiva');

  /** Coordinación = super admin O directiva (pueden gestionar el sistema). */
  isCoordinacion = computed(
    () => this.roleSignal() === 'super_admin' || this.userTipoSignal() === 'directiva',
  );

  /** ¿Rol admin (sin ser necesariamente directiva)? */
  isAdmin = computed(() => this.roleSignal() === 'admin');

  /** ¿Rol genérico "usuario" (alumno / apoderado / etc.)? */
  isUsuario = computed(() => this.roleSignal() === 'usuario');

  /** ¿Apoderado? */
  isApoderado = computed(() => this.userTipoSignal() === 'apoderado');

  /** ¿Alumno / estudiante? */
  isAlumno = computed(() => this.userTipoSignal() === 'alumno');

  /** ¿Profesor? */
  isProfesor = computed(() => this.userTipoSignal() === 'profesor');

  /** Hay sesión válida solo si existen token Y rol a la vez. */
  isLoggedIn = computed(() => !!this.tokenSignal() && !!this.roleSignal());

  /**
   * setSession — se llama tras un login exitoso.
   * Guarda todo en signals (memoria) Y en localStorage (persistencia).
   * Parámetros opcionales: userId, tallerId, nombre, userTipo.
   */
  setSession(
    token: string,
    role: AppRole,
    userId?: number,
    tallerId?: number,
    nombre?: string,
    userTipo?: UserTipo,
  ): void {
    // Actualiza el estado en memoria (la UI reacciona al instante).
    this.tokenSignal.set(token);
    this.roleSignal.set(role);
    this.userIdSignal.set(userId ?? null);
    this.tallerIdSignal.set(tallerId ?? null);
    this.nombreSignal.set(nombre ?? null);
    this.userTipoSignal.set(userTipo ?? null);

    // Persiste en localStorage (try/catch por si el navegador bloquea storage).
    try {
      localStorage.setItem(STORAGE_TOKEN, token);
      localStorage.setItem(STORAGE_KEY, role);

      // Si viene userId lo guardamos; si no, borramos la clave vieja.
      if (userId != null) localStorage.setItem(STORAGE_USER_ID, String(userId));
      else localStorage.removeItem(STORAGE_USER_ID);

      if (tallerId != null) localStorage.setItem(STORAGE_TALLER_ID, String(tallerId));
      else localStorage.removeItem(STORAGE_TALLER_ID);

      if (nombre) localStorage.setItem(STORAGE_NOMBRE, nombre);
      else localStorage.removeItem(STORAGE_NOMBRE);

      if (userTipo) localStorage.setItem(STORAGE_USER_TIPO, userTipo);
      else localStorage.removeItem(STORAGE_USER_TIPO);
    } catch {}
  }

  /**
   * setRole — actualiza solo rol e IDs sin tocar el token.
   * Uso interno / cambios parciales de contexto.
   */
  setRole(role: AppRole, userId?: number, tallerId?: number): void {
    this.roleSignal.set(role);
    this.userIdSignal.set(userId ?? null);
    this.tallerIdSignal.set(tallerId ?? null);
    try {
      localStorage.setItem(STORAGE_KEY, role);
      if (userId != null) localStorage.setItem(STORAGE_USER_ID, String(userId));
      else localStorage.removeItem(STORAGE_USER_ID);
      if (tallerId != null) localStorage.setItem(STORAGE_TALLER_ID, String(tallerId));
      else localStorage.removeItem(STORAGE_TALLER_ID);
    } catch {}
  }

  /** Devuelve el JWT actual (lo usa authInterceptor en cada petición). */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * clear — cierra sesión.
   * Pone todas las signals en null y borra las claves de localStorage.
   * Lo llama el interceptor ante 401 y el botón "Cerrar sesión".
   */
  clear(): void {
    this.roleSignal.set(null);
    this.userIdSignal.set(null);
    this.tallerIdSignal.set(null);
    this.tokenSignal.set(null);
    this.nombreSignal.set(null);
    this.userTipoSignal.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_USER_ID);
      localStorage.removeItem(STORAGE_TALLER_ID);
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_NOMBRE);
      localStorage.removeItem(STORAGE_USER_TIPO);
    } catch {}
  }

  // --- Lectores privados de localStorage (arranque / F5) ---

  /** Lee y valida el rol guardado; ignora valores desconocidos. */
  private loadStoredRole(): AppRole | null {
    try {
      const r = localStorage.getItem(STORAGE_KEY);
      if (r === 'super_admin' || r === 'admin' || r === 'usuario') return r;
    } catch {}
    return null;
  }

  /** Lee el userId como número entero. */
  private loadStoredUserId(): number | null {
    try {
      const id = localStorage.getItem(STORAGE_USER_ID);
      if (id) return parseInt(id, 10);
    } catch {}
    return null;
  }

  /** Lee el tallerId del profesor. */
  private loadStoredTallerId(): number | null {
    try {
      const id = localStorage.getItem(STORAGE_TALLER_ID);
      if (id) return parseInt(id, 10);
    } catch {}
    return null;
  }

  /** Lee el JWT crudo. */
  private loadStoredToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_TOKEN);
    } catch {}
    return null;
  }

  /** Lee el nombre mostrado. */
  private loadStoredNombre(): string | null {
    try {
      return localStorage.getItem(STORAGE_NOMBRE);
    } catch {}
    return null;
  }

  /** Lee y valida el tipo de usuario. */
  private loadStoredUserTipo(): UserTipo | null {
    try {
      const t = localStorage.getItem(STORAGE_USER_TIPO);
      if (t === 'admin' || t === 'directiva' || t === 'profesor' || t === 'alumno' || t === 'apoderado') return t;
    } catch {}
    return null;
  }

  // ===========================================================================
  // Métodos can*() — reglas de autorización para menús, botones y páginas
  // ===========================================================================

  /**
   * ¿Puede proponer una actividad libre?
   * Solo rol "usuario" que sea apoderado, alumno, o sin tipo definido.
   */
  canProponerActividad(): boolean {
    if (this.roleSignal() !== 'usuario') return false;
    const t = this.userTipoSignal();
    return t === 'apoderado' || t === 'alumno' || t == null;
  }

  /** ¿Puede gestionar propuestas de actividad? → coordinación. */
  canGestionarPropuestas(): boolean {
    return this.isCoordinacion();
  }

  /** ¿Puede crear/editar/borrar talleres? → coordinación. */
  canAccessTalleresCRUD(): boolean {
    return this.isCoordinacion();
  }

  /**
   * Super admin ve datos personales de alumnos enmascarados
   * (nombre, RUT, correo) vía AlumnoPrivacidadService.
   */
  debeEnmascararDatosAlumno(): boolean {
    return this.isSuperAdmin();
  }

  /**
   * ¿Puede editar descripción/foto/profesor de la presentación del taller?
   * Coordinación: cualquier taller. Profesor: solo el suyo.
   */
  canEditarPresentacionTaller(tallerId: number): boolean {
    if (this.isCoordinacion()) return true;
    if (this.isProfesor()) {
      const miTallerId = this.currentTallerId();
      return miTallerId != null && miTallerId === tallerId;
    }
    return false;
  }

  /** ¿Puede reservar cancha? → super_admin o admin. */
  canReservarCancha(): boolean {
    const r = this.roleSignal();
    return r === 'super_admin' || r === 'admin';
  }

  /** ¿Puede configurar franjas horarias de la cancha? → coordinación. */
  canGestionarFranjasCancha(): boolean {
    return this.isCoordinacion();
  }

  /** ¿Puede gestionar salidas? → coordinación o profesor. */
  canGestionarSalidas(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  /**
   * ¿Puede inscribirse en talleres?
   * Rol usuario, pero NO apoderado (el apoderado propone por otro flujo).
   */
  canInscribirseTalleres(): boolean {
    if (this.isApoderado()) return false;
    return this.roleSignal() === 'usuario';
  }

  /** Portal del apoderado solo para tipo apoderado. */
  canVerPortalApoderado(): boolean {
    return this.isApoderado();
  }

  /** Aceptar/rechazar inscripciones a taller. */
  canGestionarInscripcionesTaller(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  /** Abrir sesiones y marcar asistencia. */
  canGestionarAsistencia(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  /** Ver fichas físicas de alumnos. */
  canVerFichasAlumnos(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  /** Ver TODAS las fichas (no solo las de su taller). */
  canVerTodasFichasAlumnos(): boolean {
    return this.isCoordinacion();
  }

  /**
   * ¿Puede ver fichas de inscritos en este taller?
   * Coordinación: sí. Profesor: solo si es su taller.
   */
  canVerFichasAlumnosInscritosEnTaller(tallerId: number): boolean {
    if (this.isCoordinacion()) return true;
    return this.isProfesor() && this.currentTallerId() === tallerId;
  }

  /** Proponer inscripción de un alumno (directiva). */
  canProponerInscripcionAlumno(): boolean {
    return this.isCoordinacion();
  }

  /** Ver reportes de asistencia. */
  canVerReportesAsistencia(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  /** Ver comparación / estadísticas de semestre. */
  canVerComparacionSemestre(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  /** Inscribirse a salidas (usuario no apoderado). */
  canInscribirseSalidas(): boolean {
    if (this.isApoderado()) return false;
    return this.roleSignal() === 'usuario';
  }

  /** Ver listado de admins. */
  canVerAdmins(): boolean {
    return this.isCoordinacion();
  }

  /** Ver listado de alumnos. */
  canVerAlumnos(): boolean {
    return this.isCoordinacion();
  }

  /** Ver listado de profesores. */
  canVerProfesores(): boolean {
    return this.isCoordinacion();
  }

  /**
   * Etiqueta legible del rol para la UI.
   * Prioriza userTipo (Directiva, Profesor…) sobre AppRole.
   */
  roleLabel(): string {
    const tipo = this.userTipoSignal();
    if (tipo === 'directiva') return 'Directiva';
    if (tipo === 'profesor') return 'Profesor';
    if (tipo === 'alumno') return 'Estudiante';
    if (tipo === 'apoderado') return 'Apoderado';
    const role = this.roleSignal();
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'usuario') return 'Estudiante';
    return 'Usuario';
  }

  /**
   * Texto de la navbar: "Rol · Nombre" o solo el rol si no hay nombre.
   */
  displayLabel(): string {
    const nombre = this.nombreSignal()?.trim();
    const rol = this.roleLabel();
    return nombre ? `${rol} · ${nombre}` : rol;
  }
}
