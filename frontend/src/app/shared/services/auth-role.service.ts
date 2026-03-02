import { Injectable, signal, computed } from '@angular/core';

/** Roles del sistema:
 * - super_admin: agrega talleres (fotos, descripción), horarios cancha, todo
 * - admin: profesores, reservan cancha, abren salidas para inscripción
 * - usuario: alumnos, se inscriben a talleres y a salidas
 */
export type AppRole = 'super_admin' | 'admin' | 'usuario';

const STORAGE_KEY = 'reservas_cancha_role';
const STORAGE_USER_ID = 'reservas_cancha_user_id';
const STORAGE_TALLER_ID = 'reservas_cancha_taller_id';

@Injectable({
  providedIn: 'root'
})
export class AuthRoleService {
  private roleSignal = signal<AppRole | null>(this.loadStoredRole());
  private userIdSignal = signal<number | null>(this.loadStoredUserId());
  private tallerIdSignal = signal<number | null>(this.loadStoredTallerId());

  currentRole = computed(() => this.roleSignal());
  currentUserId = computed(() => this.userIdSignal());
  currentTallerId = computed(() => this.tallerIdSignal());

  isSuperAdmin = computed(() => this.roleSignal() === 'super_admin');
  isAdmin = computed(() => this.roleSignal() === 'admin');
  isUsuario = computed(() => this.roleSignal() === 'usuario');

  setRole(role: AppRole, userId?: number, tallerId?: number): void {
    this.roleSignal.set(role);
    this.userIdSignal.set(userId ?? null);
    this.tallerIdSignal.set(tallerId ?? null);
    try {
      localStorage.setItem(STORAGE_KEY, role);
      if (userId != null) {
        localStorage.setItem(STORAGE_USER_ID, String(userId));
      } else {
        localStorage.removeItem(STORAGE_USER_ID);
      }
      if (tallerId != null) {
        localStorage.setItem(STORAGE_TALLER_ID, String(tallerId));
      } else {
        localStorage.removeItem(STORAGE_TALLER_ID);
      }
    } catch {}
  }

  clear(): void {
    this.roleSignal.set(null);
    this.userIdSignal.set(null);
    this.tallerIdSignal.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_USER_ID);
      localStorage.removeItem(STORAGE_TALLER_ID);
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

  canAccessTalleresCRUD(): boolean {
    return this.roleSignal() === 'super_admin';
  }

  canReservarCancha(): boolean {
    const r = this.roleSignal();
    return r === 'super_admin' || r === 'admin';
  }

  canGestionarSalidas(): boolean {
    return this.roleSignal() === 'super_admin' || this.roleSignal() === 'admin';
  }

  canInscribirseTalleres(): boolean {
    return this.roleSignal() === 'usuario';
  }

  canInscribirseSalidas(): boolean {
    return this.roleSignal() === 'usuario';
  }

  canVerAdmins(): boolean {
    return this.roleSignal() === 'super_admin';
  }

  canVerAlumnos(): boolean {
    return this.roleSignal() === 'super_admin' || this.roleSignal() === 'admin';
  }

  canVerProfesores(): boolean {
    return this.roleSignal() === 'super_admin' || this.roleSignal() === 'admin';
  }
}
