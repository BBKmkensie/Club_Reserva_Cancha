import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { NotificacionPollService } from '../../shared/services/notificacion-poll.service';
import { Subscription } from 'rxjs';
import { estiloTarjetaTaller, EstiloTarjetaTaller } from '../../shared/utils/taller-tarjeta.util';

interface CardTaller extends EstiloTarjetaTaller {}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6 sm:space-y-8 min-w-0 max-w-full">
      @if (auth.isLoggedIn()) {
        @if (auth.isProfesor() && asignacionesPendientes.length > 0) {
          <div class="bg-surface rounded-xl shadow-lg p-6 border-2 border-indigo-200">
            <h2 class="text-xl font-bold text-ink mb-2">Asignaciones de actividades</h2>
            <p class="text-ink-muted text-sm mb-4">El coordinador te asignó nuevas actividades. Confirma tu disponibilidad.</p>
            <ul class="space-y-3">
              @for (a of asignacionesPendientes; track a.id) {
                <li class="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div>
                    <p class="font-semibold text-ink">{{ a.taller?.tipo ?? 'Actividad' }}</p>
                    <p class="text-sm text-ink-muted">{{ a.taller?.descripcion }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="responderAsignacion(a.id, true)"
                            class="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                      Aceptar
                    </button>
                    <button (click)="responderAsignacion(a.id, false)"
                            class="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">
                      Rechazar
                    </button>
                  </div>
                </li>
              }
            </ul>
          </div>
        }

        @if (auth.canGestionarInscripcionesTaller() && auth.isProfesor() && tallerIdProfesor) {
          <div class="bg-surface rounded-xl shadow-lg p-6 border-2 border-amber-200">
            <h2 class="text-xl font-bold text-ink mb-2">Panel del profesor — Inscripciones</h2>
            <p class="text-ink-muted text-sm mb-4">Revisa solicitudes pendientes, aprueba o rechaza alumnos y monitorea la capacidad.</p>
            <div class="flex flex-wrap items-center gap-4">
              @if (resumenProfesor) {
                <div class="flex gap-3 text-sm">
                  <span class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
                    {{ resumenProfesor.resumen.pendientes }} pendientes
                  </span>
                  <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                    {{ resumenProfesor.resumen.aceptados }} aceptados
                  </span>
                  <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                    {{ resumenProfesor.resumen.cuposDisponibles }} cupos libres
                  </span>
                </div>
              }
              <a routerLink="/gestion-inscripciones"
                 class="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700">
                Gestionar inscripciones →
              </a>
            </div>
          </div>
        }
      }

        @if (auth.canInscribirseTalleres() && alumnoId) {
          @if (notificaciones.length > 0) {
            <div class="bg-surface rounded-xl shadow-lg p-6 border-2 border-line">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-xl font-bold text-ink">
                  Notificaciones
                  @if (notificacionesNoLeidas > 0) {
                    <span class="ml-2 bg-palette-magenta text-white text-xs px-2 py-0.5 rounded-full">{{ notificacionesNoLeidas }} nueva(s)</span>
                  }
                </h2>
                @if (notificacionesNoLeidas > 0) {
                  <button (click)="marcarTodasLeidas()" class="text-sm text-primary-500 hover:underline">Marcar todas como leídas</button>
                }
              </div>
              <ul class="space-y-2 max-h-48 overflow-y-auto">
                @for (n of notificaciones; track n.id) {
                  <li class="p-3 rounded-lg border text-sm cursor-pointer dash-notif"
                      [class.dash-notif--leida]="n.leida"
                      (click)="marcarLeida(n)">
                    <p class="font-semibold text-ink">{{ n.titulo }}</p>
                    <p class="text-ink-muted">{{ n.mensaje }}</p>
                    <p class="text-xs text-ink-muted mt-1">{{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </li>
                }
              </ul>
              <p class="text-xs text-ink-muted mt-3">También recibirás estas alertas en tu correo si tienes email registrado.</p>
            </div>
          }
        }

      <div class="text-center mb-6 sm:mb-8 px-1">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink mb-2">Sistema de Gestión de Talleres</h1>
        <p class="text-ink-muted">
          @if (auth.isLoggedIn()) {
            @if (auth.isProfesor()) {
              Gestiona tu taller
            } @else if (auth.canInscribirseTalleres() && tieneInscripcionesActivas()) {
              Tus talleres inscritos
            } @else {
              Selecciona una actividad para gestionar
            }
          } @else {
            Explora las actividades del club. Inicia sesión para inscribirte o gestionar.
          }
        </p>
      </div>

      @if (auth.canInscribirseTalleres() && alumnoId && tieneInscripcionesActivas()) {
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-primary-50 border border-primary-200 rounded-xl p-4">
          <p class="text-sm text-ink-secondary">
            Estás inscrito en <strong>{{ misInscripciones.length }}</strong>
            {{ misInscripciones.length === 1 ? 'taller' : 'talleres' }}.
            @if (!mostrarOtrosTalleres) {
              <span class="block sm:inline sm:ml-1">Usa el botón para ver más actividades e inscribirte en otras.</span>
            }
          </p>
          <button type="button" (click)="toggleOtrosTalleres()"
                  class="shrink-0 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
            {{ mostrarOtrosTalleres ? 'Ocultar otros talleres' : 'Ver otros talleres' }}
          </button>
        </div>
      }

      @if (mostrarSeccionMisTalleres()) {
        <h2 class="text-lg sm:text-xl font-bold text-ink">Mis talleres</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 min-w-0">
          @for (act of talleresInscritosVisibles; track act.id) {
            <ng-container *ngTemplateOutlet="tarjetaActividad; context: { $implicit: act }"></ng-container>
          }
        </div>
      }

      @if (mostrarSeccionOtrosTalleres()) {
        <h2 class="text-lg sm:text-xl font-bold text-ink mt-2">Otros talleres disponibles</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 min-w-0">
          @for (act of otrosTalleresVisibles; track act.id) {
            <ng-container *ngTemplateOutlet="tarjetaActividad; context: { $implicit: act }"></ng-container>
          }
        </div>
      }

      @if (mostrarSeccionCatalogoCompleto()) {
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 min-w-0">
        @for (act of actividadesPublicadas; track act.id) {
          <ng-container *ngTemplateOutlet="tarjetaActividad; context: { $implicit: act }"></ng-container>
        }

        @if (actividadesPublicadas.length === 0 && !auth.isProfesor()) {
          <div class="col-span-full text-center text-ink-muted py-12 bg-page rounded-xl border border-dashed border-line">
            No hay actividades publicadas en el catálogo.
          </div>
        }

        @if (auth.isProfesor() && actividadesPublicadas.length === 0) {
          <div class="col-span-full text-center text-ink-muted py-12 bg-page rounded-xl border border-dashed border-line">
            No tienes un taller asignado o publicado aún.
          </div>
        }

        @if (!auth.isProfesor()) {
        <a [routerLink]="auth.isLoggedIn() ? '/salidas' : '/login'"
           class="group rounded-xl shadow-lg p-5 sm:p-8 text-white bg-gradient-to-br from-purple-500 to-purple-700 hover:shadow-2xl transition-all duration-300 text-center min-w-0 w-full">
          <div class="text-4xl sm:text-6xl mb-3 sm:mb-4">🚌</div>
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Salidas</h2>
          <p class="text-purple-100 text-sm mb-4">Gestiona las salidas programadas</p>
          @if (auth.isLoggedIn()) {
            <div class="text-purple-200">
              <div class="text-2xl font-bold">{{ stats.salidas }}</div>
              <div class="text-sm">Salidas programadas</div>
            </div>
          }
        </a>
        }
      </div>
      }

      @if (mostrarSeccionMisTalleres() || mostrarSeccionOtrosTalleres()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 min-w-0">
          @if (!auth.isProfesor()) {
          <a [routerLink]="auth.isLoggedIn() ? '/salidas' : '/login'"
             class="group rounded-xl shadow-lg p-5 sm:p-8 text-white bg-gradient-to-br from-purple-500 to-purple-700 hover:shadow-2xl transition-all duration-300 text-center min-w-0 w-full">
            <div class="text-4xl sm:text-6xl mb-3 sm:mb-4">🚌</div>
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Salidas</h2>
            <p class="text-purple-100 text-sm mb-4">Gestiona las salidas programadas</p>
            @if (auth.isLoggedIn()) {
              <div class="text-purple-200">
                <div class="text-2xl font-bold">{{ stats.salidas }}</div>
                <div class="text-sm">Salidas programadas</div>
              </div>
            }
          </a>
          }
        </div>
      }

      <ng-template #tarjetaActividad let-act>
          <button type="button" (click)="navegarATallerPorId(act.id)"
                  class="group rounded-xl shadow-lg p-5 sm:p-8 text-white hover:shadow-2xl transition-all duration-300 text-center min-w-0 w-full relative"
                  [class]="estiloTarjeta(act.tipo).classes">
            @if (estadoInscripcionTaller(act.id)) {
              <span class="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-white/25 backdrop-blur-sm">
                {{ estadoInscripcionTaller(act.id) === 'ACEPTADO' ? 'Inscrito' : 'Pendiente' }}
              </span>
            }
            <div class="text-4xl sm:text-6xl mb-3 sm:mb-4">{{ estiloTarjeta(act.tipo).icon }}</div>
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{{ act.tipo }}</h2>
            <p class="text-sm opacity-90 mb-4 line-clamp-2">
              {{ estiloTarjeta(act.tipo).descripcion }}
            </p>
            <div class="opacity-90">
              <div class="text-2xl font-bold">{{ conteoTarjeta(act) }}</div>
              <div class="text-sm">{{ etiquetaConteo() }}</div>
            </div>
          </button>
      </ng-template>

      @if (auth.canAccessTalleresCRUD()) {
        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <p class="text-indigo-900 text-sm">Crea actividades (Cocina, Zumba, deportes…) y publica el catálogo.</p>
          <a routerLink="/gestion-actividades"
             class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 whitespace-nowrap">
            Ir a Gestión de Actividades →
          </a>
        </div>
      }

      @if (mostrarEstadisticas()) {
        <div class="bg-surface rounded-lg shadow p-4 sm:p-6 min-w-0">
          <h2 class="text-xl sm:text-2xl font-bold text-ink mb-4">Estadísticas Generales</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div class="bg-blue-50 rounded-lg p-3 sm:p-4 text-center min-w-0">
              <div class="text-2xl sm:text-3xl font-bold text-blue-600">{{ stats.talleres }}</div>
              <div class="text-xs sm:text-sm text-ink-muted mt-1">Total Talleres</div>
            </div>
            <div class="bg-green-50 rounded-lg p-3 sm:p-4 text-center min-w-0">
              <div class="text-2xl sm:text-3xl font-bold text-green-600">{{ stats.alumnos }}</div>
              <div class="text-xs sm:text-sm text-ink-muted mt-1">Total Alumnos</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-3 sm:p-4 text-center min-w-0">
              <div class="text-2xl sm:text-3xl font-bold text-purple-600">{{ stats.profesores }}</div>
              <div class="text-xs sm:text-sm text-ink-muted mt-1">Total Profesores</div>
            </div>
            <div class="bg-orange-50 rounded-lg p-3 sm:p-4 text-center min-w-0">
              <div class="text-2xl sm:text-3xl font-bold text-orange-600">{{ stats.reservas }}</div>
              <div class="text-xs sm:text-sm text-ink-muted mt-1">Total Reservas</div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dash-notif:not(.dash-notif--leida) {
      background: rgb(var(--color-accent-soft));
      border-color: rgb(var(--color-accent));
    }
    .dash-notif--leida {
      background: rgb(var(--color-muted));
      border-color: rgb(var(--color-border));
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notificacionPoll = inject(NotificacionPollService);
  auth = inject(AuthRoleService);
  private pollSub?: Subscription;

  stats = { talleres: 0, alumnos: 0, profesores: 0, reservas: 0, salidas: 0 };

  talleres: any[] = [];
  alumnos: any[] = [];
  inscripcionesPorTaller = new Map<number, number>();
  alumnoId: number | null = null;
  tallerIdProfesor: number | null = null;
  resumenProfesor: any = null;
  notificaciones: any[] = [];
  notificacionesNoLeidas = 0;
  actividadesPublicadas: any[] = [];
  catalogoCompleto: any[] = [];
  misInscripciones: any[] = [];
  mostrarOtrosTalleres = false;
  asignacionesPendientes: any[] = [];

  estiloTarjeta(tipo: string): CardTaller {
    return estiloTarjetaTaller(tipo);
  }

  ngOnInit() {
    this.alumnoId = this.auth.currentUserId();
    this.tallerIdProfesor = this.auth.currentTallerId();
    this.loadData();

    if (!this.auth.isLoggedIn()) return;

    if (this.auth.canGestionarInscripcionesTaller() && this.tallerIdProfesor) {
      this.apiService.getResumenInscripcionesTaller(this.tallerIdProfesor).subscribe({
        next: (data) => (this.resumenProfesor = data),
        error: () => (this.resumenProfesor = null),
      });
    }
    if (this.auth.isProfesor() && this.auth.currentUserId()) {
      this.apiService.getAsignacionesPendientes(this.auth.currentUserId()!).subscribe({
        next: (data) => (this.asignacionesPendientes = data ?? []),
        error: () => (this.asignacionesPendientes = []),
      });
    }
    if (this.auth.canInscribirseTalleres() && this.alumnoId) {
      this.pollSub = this.notificacionPoll.cambios$.subscribe(({ notificaciones, noLeidas }) => {
        this.notificaciones = notificaciones;
        this.notificacionesNoLeidas = noLeidas;
      });
    }
  }

  marcarLeida(n: any): void {
    if (!this.alumnoId || n.leida) return;
    this.notificacionPoll.marcarLeida(n.id);
  }

  marcarTodasLeidas(): void {
    if (!this.alumnoId) return;
    this.notificacionPoll.marcarTodasLeidas();
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  mostrarEstadisticas(): boolean {
    return this.auth.isLoggedIn() && !this.auth.canInscribirseTalleres();
  }

  etiquetaConteo(): string {
    return this.auth.isLoggedIn() ? 'Alumnos inscritos' : 'Cupos máximos';
  }

  conteoTarjeta(act: any): number {
    if (!this.auth.isLoggedIn()) {
      return act.capacidad ?? 20;
    }
    return this.inscripcionesPorTaller.get(act.id) ?? this.contarAlumnosPorTaller(act.id);
  }

  tieneInscripcionesActivas(): boolean {
    return this.misInscripciones.length > 0;
  }

  get talleresInscritosVisibles(): any[] {
    const ids = this.tallerIdsInscritos();
    return this.catalogoCompleto.filter((a) => ids.has(Number(a.id)));
  }

  get otrosTalleresVisibles(): any[] {
    const ids = this.tallerIdsInscritos();
    return this.catalogoCompleto.filter((a) => !ids.has(Number(a.id)));
  }

  mostrarSeccionMisTalleres(): boolean {
    return (
      this.auth.canInscribirseTalleres() &&
      !!this.alumnoId &&
      this.tieneInscripcionesActivas()
    );
  }

  mostrarSeccionOtrosTalleres(): boolean {
    return this.mostrarSeccionMisTalleres() && this.mostrarOtrosTalleres;
  }

  mostrarSeccionCatalogoCompleto(): boolean {
    if (this.mostrarSeccionMisTalleres()) return false;
    return true;
  }

  toggleOtrosTalleres(): void {
    this.mostrarOtrosTalleres = !this.mostrarOtrosTalleres;
    this.cargarInscripcionesPorTaller(this.actividadesParaConteo());
  }

  estadoInscripcionTaller(tallerId: number): 'PENDIENTE' | 'ACEPTADO' | null {
    const ins = this.misInscripciones.find(
      (i) => Number(i.tallerId ?? i.taller?.id) === Number(tallerId),
    );
    const estado = String(ins?.estado ?? '').toUpperCase();
    if (estado === 'PENDIENTE' || estado === 'ACEPTADO') return estado;
    return null;
  }

  private tallerIdsInscritos(): Set<number> {
    return new Set(
      this.misInscripciones
        .map((i) => Number(i.tallerId ?? i.taller?.id))
        .filter((id) => !Number.isNaN(id)),
    );
  }

  private actividadesParaConteo(): any[] {
    if (this.mostrarSeccionMisTalleres()) {
      const acts = [...this.talleresInscritosVisibles];
      if (this.mostrarOtrosTalleres) acts.push(...this.otrosTalleresVisibles);
      return acts;
    }
    return this.actividadesPublicadas;
  }

  private contarAlumnosPorTaller(tallerId: number): number {
    return this.alumnos.filter((a) => Number(a?.tallerId) === tallerId).length;
  }

  loadData() {
    const asList = (data: unknown): any[] => (Array.isArray(data) ? data : []);

    this.apiService.getCatalogoTalleres().subscribe({
      next: (data) => {
        this.catalogoCompleto = asList(data);
        if (this.auth.canInscribirseTalleres() && this.alumnoId) {
          this.cargarInscripcionesAlumno();
        } else {
          this.actividadesPublicadas = this.filtrarActividadesParaUsuario(this.catalogoCompleto);
          if (this.auth.isLoggedIn()) {
            this.cargarInscripcionesPorTaller(this.actividadesPublicadas);
          }
        }
      },
      error: () => {
        this.catalogoCompleto = [];
        this.actividadesPublicadas = [];
      },
    });

    if (!this.auth.isLoggedIn()) return;

    if (this.auth.isProfesor()) return;

    this.apiService.getTalleres().subscribe({
      next: (data) => {
        this.talleres = asList(data);
        this.stats.talleres = this.talleres.length;
      },
    });
    this.apiService.getAlumnos().subscribe({
      next: (data) => {
        this.alumnos = asList(data);
        this.stats.alumnos = this.alumnos.length;
      },
    });
    this.apiService.getProfesores().subscribe({
      next: (data) => (this.stats.profesores = asList(data).length),
    });
    this.apiService.getReservas().subscribe({
      next: (data) => (this.stats.reservas = asList(data).length),
    });
    this.apiService.getSalidas().subscribe({
      next: (data) => (this.stats.salidas = asList(data).length),
    });
  }

  private filtrarActividadesParaUsuario(actividades: any[]): any[] {
    if (this.auth.isProfesor()) {
      const tallerId = this.auth.currentTallerId();
      if (!tallerId) return [];
      return actividades.filter((a) => Number(a.id) === tallerId);
    }
    return actividades;
  }

  private cargarInscripcionesAlumno(): void {
    if (!this.alumnoId) return;
    this.apiService.getInscripcionesTallerPorAlumno(this.alumnoId).subscribe({
      next: (data) => {
        this.misInscripciones = (Array.isArray(data) ? data : []).filter((i) => {
          const estado = String(i.estado ?? '').toUpperCase();
          return estado === 'PENDIENTE' || estado === 'ACEPTADO';
        });
        this.actividadesPublicadas = this.filtrarActividadesParaUsuario(this.catalogoCompleto);
        this.cargarInscripcionesPorTaller(this.actividadesParaConteo());
      },
      error: () => {
        this.misInscripciones = [];
        this.actividadesPublicadas = this.filtrarActividadesParaUsuario(this.catalogoCompleto);
        this.cargarInscripcionesPorTaller(this.actividadesPublicadas);
      },
    });
  }

  private cargarInscripcionesPorTaller(actividades: any[]) {
    const ids = actividades.map((a) => a.id).filter((id) => id != null);
    if (!ids.length) return;

    forkJoin(
      ids.map((id) => this.apiService.getInscripcionesTallerPorTaller(id)),
    ).subscribe({
      next: (listas) => {
        ids.forEach((id, i) => {
          const aceptados = asList(listas[i]).filter((ins) => ins.estado === 'ACEPTADO').length;
          this.inscripcionesPorTaller.set(id, aceptados);
        });
      },
    });

    function asList(data: unknown): any[] {
      return Array.isArray(data) ? data : [];
    }
  }

  navegarATallerPorId(id: number) {
    this.router.navigate(['/taller', id]);
  }

  responderAsignacion(asignacionId: number, acepta: boolean) {
    const profesorId = this.auth.currentUserId();
    if (!profesorId) return;
    const motivo = !acepta ? prompt('Motivo del rechazo (opcional)') ?? undefined : undefined;
    this.apiService.responderAsignacion(asignacionId, profesorId, acepta, motivo).subscribe({
      next: (res) => {
        this.asignacionesPendientes = this.asignacionesPendientes.filter((a) => a.id !== asignacionId);
        if (acepta) {
          const tallerId = res?.tallerId ?? res?.taller?.id;
          const token = this.auth.getToken();
          if (token && tallerId) {
            this.auth.setSession(token, 'admin', profesorId, tallerId, this.auth.currentNombre() ?? undefined, 'profesor');
            this.tallerIdProfesor = tallerId;
            this.loadData();
          }
          alert('Asignación aceptada.');
        }
      },
      error: (e) => alert(e?.error?.message || 'No se pudo responder'),
    });
  }
}
