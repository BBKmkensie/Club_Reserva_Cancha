import { Injectable, signal, computed } from '@angular/core';

export type AppRole = 'super_admin' | 'admin' | 'usuario';
export type UserTipo = 'admin' | 'directiva' | 'profesor' | 'alumno' | 'apoderado';

const STORAGE_KEY = 'reservas_cancha_role';
const STORAGE_USER_ID = 'reservas_cancha_user_id';
const STORAGE_TALLER_ID = 'reservas_cancha_taller_id';
const STORAGE_TOKEN = 'reservas_cancha_token';
const STORAGE_NOMBRE = 'reservas_cancha_nombre';
const STORAGE_USER_TIPO = 'reservas_cancha_user_tipo';

@Injectable({
  providedIn: 'root'
})
export class AuthRoleService {
  private roleSignal = signal<AppRole | null>(this.loadStoredRole());
  private userIdSignal = signal<number | null>(this.loadStoredUserId());
  private tallerIdSignal = signal<number | null>(this.loadStoredTallerId());
  private tokenSignal = signal<string | null>(this.loadStoredToken());
  private nombreSignal = signal<string | null>(this.loadStoredNombre());
  private userTipoSignal = signal<UserTipo | null>(this.loadStoredUserTipo());

  currentRole = computed(() => this.roleSignal());
  currentUserId = computed(() => this.userIdSignal());
  currentTallerId = computed(() => this.tallerIdSignal());
  currentNombre = computed(() => this.nombreSignal());
  currentUserTipo = computed(() => this.userTipoSignal());
  accessToken = computed(() => this.tokenSignal());

  isSuperAdmin = computed(() => this.roleSignal() === 'super_admin');
  isDirectiva = computed(() => this.userTipoSignal() === 'directiva');
  /** Super admin o directiva: coordinación con acceso amplio */
  isCoordinacion = computed(
    () => this.roleSignal() === 'super_admin' || this.userTipoSignal() === 'directiva',
  );
  isAdmin = computed(() => this.roleSignal() === 'admin');
  isUsuario = computed(() => this.roleSignal() === 'usuario');
  isApoderado = computed(() => this.userTipoSignal() === 'apoderado');
  isAlumno = computed(() => this.userTipoSignal() === 'alumno');
  isProfesor = computed(() => this.userTipoSignal() === 'profesor');
  isLoggedIn = computed(() => !!this.tokenSignal() && !!this.roleSignal());

  setSession(
    token: string,
    role: AppRole,
    userId?: number,
    tallerId?: number,
    nombre?: string,
    userTipo?: UserTipo,
  ): void {
    this.tokenSignal.set(token);
    this.roleSignal.set(role);
    this.userIdSignal.set(userId ?? null);
    this.tallerIdSignal.set(tallerId ?? null);
    this.nombreSignal.set(nombre ?? null);
    this.userTipoSignal.set(userTipo ?? null);
    try {
      localStorage.setItem(STORAGE_TOKEN, token);
      localStorage.setItem(STORAGE_KEY, role);
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

  getToken(): string | null {
    return this.tokenSignal();
  }

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

  private loadStoredRole(): AppRole | null {
    try {
      const r = localStorage.getItem(STORAGE_KEY);
      if (r === 'super_admin' || r === 'admin' || r === 'usuario') return r;
    } catch {}
    return null;
  }

  private loadStoredUserId(): number | null {
    try {
      const id = localStorage.getItem(STORAGE_USER_ID);
      if (id) return parseInt(id, 10);
    } catch {}
    return null;
  }

  private loadStoredTallerId(): number | null {
    try {
      const id = localStorage.getItem(STORAGE_TALLER_ID);
      if (id) return parseInt(id, 10);
    } catch {}
    return null;
  }

  private loadStoredToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_TOKEN);
    } catch {}
    return null;
  }

  private loadStoredNombre(): string | null {
    try {
      return localStorage.getItem(STORAGE_NOMBRE);
    } catch {}
    return null;
  }

  private loadStoredUserTipo(): UserTipo | null {
    try {
      const t = localStorage.getItem(STORAGE_USER_TIPO);
      if (t === 'admin' || t === 'directiva' || t === 'profesor' || t === 'alumno' || t === 'apoderado') return t;
    } catch {}
    return null;
  }

  canProponerActividad(): boolean {
    if (this.roleSignal() !== 'usuario') return false;
    const t = this.userTipoSignal();
    return t === 'apoderado' || t === 'alumno' || t == null;
  }

  canGestionarPropuestas(): boolean {
    return this.isCoordinacion();
  }

  canAccessTalleresCRUD(): boolean {
    return this.isCoordinacion();
  }

  /** Super admin: datos personales de alumnos enmascarados (nombre, RUT, correo) */
  debeEnmascararDatosAlumno(): boolean {
    return this.isSuperAdmin();
  }

  /** Profesor de su taller o directiva: editar descripción y foto del profesor */
  canEditarPresentacionTaller(tallerId: number): boolean {
    if (this.isCoordinacion()) return true;
    if (this.isProfesor()) {
      const miTallerId = this.currentTallerId();
      return miTallerId != null && miTallerId === tallerId;
    }
    return false;
  }

  canReservarCancha(): boolean {
    const r = this.roleSignal();
    return r === 'super_admin' || r === 'admin';
  }

  canGestionarFranjasCancha(): boolean {
    return this.isCoordinacion();
  }

  canGestionarSalidas(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  canInscribirseTalleres(): boolean {
    return this.roleSignal() === 'usuario';
  }

  canGestionarInscripcionesTaller(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  canGestionarAsistencia(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  canVerFichasAlumnos(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  canVerTodasFichasAlumnos(): boolean {
    return this.isCoordinacion();
  }

  canVerFichasAlumnosInscritosEnTaller(tallerId: number): boolean {
    if (this.isCoordinacion()) return true;
    return this.isProfesor() && this.currentTallerId() === tallerId;
  }

  canProponerInscripcionAlumno(): boolean {
    return this.isCoordinacion();
  }

  canVerReportesAsistencia(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  canVerComparacionSemestre(): boolean {
    return this.isCoordinacion() || this.isProfesor();
  }

  canInscribirseSalidas(): boolean {
    return this.roleSignal() === 'usuario';
  }

  canVerAdmins(): boolean {
    return this.isCoordinacion();
  }

  canVerAlumnos(): boolean {
    return this.isCoordinacion();
  }

  canVerProfesores(): boolean {
    return this.isCoordinacion();
  }

  /** Etiqueta visible en navbar */
  displayLabel(): string {
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
}
