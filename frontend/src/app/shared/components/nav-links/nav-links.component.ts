/**
 * Enlaces de navegación según el rol del usuario autenticado.
 * Se adapta al modo navbar (horizontal) o sidebar (vertical).
 */
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthRoleService } from '../../services/auth-role.service';
import { ApiService } from '../../../services/api.service';

export interface NavLinkItem {
  path: string;
  label: string;
}

/**
 * NavLinks: construye y muestra rutas permitidas según permisos y contexto del alumno.
 */
@Component({
  selector: 'app-nav-links',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    @if (mode === 'navbar') {
      <div class="hidden lg:flex flex-1 items-center gap-1 overflow-x-auto nav-scroll min-w-0 px-2">
        @for (link of links; track link.path) {
          <a [routerLink]="link.path" routerLinkActive="nav-active" class="nav-link">{{ link.label }}</a>
        }
      </div>
    } @else {
      <div class="space-y-1">
        @for (link of links; track link.path) {
          <a [routerLink]="link.path"
             routerLinkActive="sidebar-active"
             [routerLinkActiveOptions]="{ exact: link.path === '/dashboard' }"
             (click)="navigate()"
             class="sidebar-link">
            {{ link.label }}
          </a>
        }
      </div>
    }
  `,
  styles: [`
    .nav-link {
      @apply text-ink-secondary hover:text-primary-500 px-2.5 py-2 rounded-md transition whitespace-nowrap text-sm;
    }
    .nav-active {
      @apply text-primary-500 font-semibold;
    }
    .nav-scroll {
      scrollbar-width: thin;
    }
    .sidebar-link {
      @apply block px-4 py-2.5 rounded-lg text-sm font-medium text-ink-secondary hover:bg-muted transition-colors;
    }
    .sidebar-active {
      @apply bg-primary-500/15 text-primary-500 font-semibold;
    }
  `],
})
/**
 * Genera dinámicamente el menú de navegación principal según el rol y las inscripciones.
 */
export class NavLinksComponent implements OnInit {
  @Input() mode: 'navbar' | 'sidebar' = 'navbar';
  @Output() navigated = new EventEmitter<void>();

  private auth = inject(AuthRoleService);
  private api = inject(ApiService);
  links: NavLinkItem[] = [];
  private puedeVerMisSalidas = false;

  /** Arma los enlaces iniciales y consulta si el alumno puede ver «Mis salidas». */
  ngOnInit(): void {
    this.buildLinks();
    this.actualizarMisSalidas();
  }

  /** Notifica al padre que el usuario eligió una ruta (útil para cerrar el sidebar móvil). */
  navigate(): void {
    this.navigated.emit();
  }

  private actualizarMisSalidas(): void {
    if (!this.auth.canInscribirseTalleres()) {
      this.buildLinks();
      return;
    }
    const alumnoId = this.auth.currentUserId();
    if (!alumnoId) {
      this.puedeVerMisSalidas = !!this.auth.currentTallerId();
      this.buildLinks();
      return;
    }
    this.api.getInscripcionesTallerPorAlumno(alumnoId).subscribe({
      next: (inscs) => {
        const aceptadas = (inscs ?? []).some((i: { estado: string }) => i.estado === 'ACEPTADO');
        this.puedeVerMisSalidas = aceptadas || !!this.auth.currentTallerId();
        this.buildLinks();
      },
      error: () => {
        this.puedeVerMisSalidas = !!this.auth.currentTallerId();
        this.buildLinks();
      },
    });
  }

  private buildLinks(): void {
    const items: NavLinkItem[] = [];

    if (this.auth.isApoderado()) {
      items.push({ path: '/portal-apoderado', label: 'Mi hijo/a' });
      this.links = items;
      return;
    }

    items.push(
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/talleres', label: 'Talleres' },
    );

    if (this.auth.canAccessTalleresCRUD()) {
      items.push({ path: '/gestion-actividades', label: 'Gestión actividades' });
    }
    if (this.auth.canGestionarPropuestas()) {
      items.push({ path: '/propuestas-actividad', label: 'Propuestas' });
    }
    if (this.auth.canGestionarInscripcionesTaller()) {
      items.push({ path: '/gestion-inscripciones', label: 'Gestión inscripciones' });
    }
    if (this.auth.canGestionarAsistencia()) {
      items.push({ path: '/control-asistencia', label: 'Control de asistencia' });
    }
    if (this.auth.canVerFichasAlumnos()) {
      items.push({ path: '/fichas-alumnos', label: 'Fichas alumnos' });
    }
    if (this.auth.canVerAlumnos()) {
      items.push({ path: '/alumnos', label: 'Alumnos' });
    }
    if (this.auth.canVerProfesores()) {
      items.push({ path: '/profesores', label: 'Profesores' });
    }
    if (this.auth.canReservarCancha()) {
      items.push({ path: '/reservas', label: 'Reservas' });
    }
    if (this.auth.canGestionarSalidas()) {
      items.push({ path: '/inscripcion-salidas', label: 'Abrir salidas' });
      items.push({ path: '/salidas', label: 'Salidas' });
    }
    if (this.auth.canVerReportesAsistencia()) {
      items.push({ path: '/reportes-asistencia', label: 'Reportes asistencia' });
    }
    if (this.auth.canVerComparacionSemestre()) {
      items.push({ path: '/comparacion-semestre', label: 'Comparación semestre' });
    }
    if (this.auth.canVerAdmins()) {
      items.push({ path: '/admins', label: 'Administradores' });
    }
    if (this.auth.canInscribirseTalleres()) {
      items.push({ path: '/inscripcion-talleres', label: 'Inscribirme a taller' });
      if (this.puedeVerMisSalidas) {
        items.push({ path: '/mis-salidas', label: 'Mis salidas' });
      }
    }

    this.links = items;
  }
}
