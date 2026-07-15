/**
 * =============================================================================
 * app/shared/components/nav-links/nav-links.component.ts — Enlaces de navegación
 * =============================================================================
 * Genera y muestra los enlaces del menú principal según el rol y permisos del
 * usuario autenticado. Se usa dentro del navbar (horizontal) y del sidebar
 * (vertical).
 *
 * Inputs: mode ('navbar' | 'sidebar').
 * Outputs: navigated (emite al elegir un enlace en modo sidebar).
 * Métodos clave: ngOnInit(), navigate().
 * =============================================================================
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
export class NavLinksComponent implements OnInit {
  /** Disposición: horizontal (navbar) o lista vertical (sidebar). */
  @Input() mode: 'navbar' | 'sidebar' = 'navbar';
  /** Emite al hacer clic en un enlace (el sidebar móvil cierra el panel). */
  @Output() navigated = new EventEmitter<void>();

  /** Permisos del usuario → qué rutas aparecen en el menú. */
  private auth = inject(AuthRoleService);
  /** Verifica inscripciones aceptadas para añadir «Mis salidas». */
  private api = inject(ApiService);
  /** Enlaces visibles ya filtrados por rol (se reconstruyen en buildLinks). */
  links: NavLinkItem[] = [];
  /** Flag interno: alumno con inscripción aceptada. */
  private puedeVerMisSalidas = false;

  /**
   * Construye la lista inicial de enlaces según permisos y consulta al backend
   * si el alumno tiene inscripciones aceptadas (para mostrar «Mis salidas»).
   */
  ngOnInit(): void {
    this.buildLinks();
    this.actualizarMisSalidas();
  }

  /**
   * Notifica al componente padre que el usuario eligió una ruta.
   * En modo sidebar, el padre cierra el panel móvil al recibir este evento.
   */
  navigate(): void {
    this.navigated.emit();
  }

  /**
   * Pregunta al API si el alumno tiene talleres aceptados y, según eso,
   * incluye o no el enlace «Mis salidas» al reconstruir el menú.
   */
  private actualizarMisSalidas(): void {
    if (!this.auth.canInscribirseTalleres()) {
      this.buildLinks();
      return;
    }
    const alumnoId = this.auth.currentUserId();
    if (!alumnoId) {
      this.puedeVerMisSalidas = false;
      this.buildLinks();
      return;
    }
    this.api.getInscripcionesTallerPorAlumno(alumnoId).subscribe({
      next: (inscs) => {
        this.puedeVerMisSalidas = (inscs ?? []).some(
          (i: { estado: string }) => String(i.estado).toUpperCase() === 'ACEPTADO',
        );
        this.buildLinks();
      },
      error: () => {
        this.puedeVerMisSalidas = false;
        this.buildLinks();
      },
    });
  }

  /** Arma el arreglo de enlaces visibles según el rol y los permisos del usuario. */
  private buildLinks(): void {
    const items: NavLinkItem[] = [];

    if (this.auth.isApoderado()) {
      items.push({ path: '/portal-apoderado', label: 'Mi hijo/a' });
      this.links = items;
      return;
    }

    items.push({ path: '/dashboard', label: 'Dashboard' });
    if (!this.auth.isProfesor()) {
      items.push({ path: '/talleres', label: 'Talleres' });
    }

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
