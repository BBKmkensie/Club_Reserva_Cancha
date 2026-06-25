import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { NotificacionPollService } from '../../shared/services/notificacion-poll.service';
import { Subscription } from 'rxjs';

interface CardTaller {
  classes: string;
  icon: string;
  descripcion: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-8">
      @if (auth.isLoggedIn()) {
        @if (auth.isProfesor() && asignacionesPendientes.length > 0) {
          <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
            <h2 class="text-xl font-bold text-gray-800 mb-2">Asignaciones de actividades</h2>
            <p class="text-gray-600 text-sm mb-4">El coordinador te asignó nuevas actividades. Confirma tu disponibilidad.</p>
            <ul class="space-y-3">
              @for (a of asignacionesPendientes; track a.id) {
                <li class="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div>
                    <p class="font-semibold text-gray-800">{{ a.taller?.tipo ?? 'Actividad' }}</p>
                    <p class="text-sm text-gray-600">{{ a.taller?.descripcion }}</p>
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
          <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
            <h2 class="text-xl font-bold text-gray-800 mb-2">Panel del profesor — Inscripciones</h2>
            <p class="text-gray-600 text-sm mb-4">Revisa solicitudes pendientes, aprueba o rechaza alumnos y monitorea la capacidad.</p>
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

      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">Sistema de Gestión de Talleres</h1>
        <p class="text-gray-600">
          @if (auth.isLoggedIn()) {
            @if (auth.isProfesor()) {
              Gestiona tu taller
            } @else {
              Selecciona una actividad para gestionar
            }
          } @else {
            Explora las actividades del club. Inicia sesión para inscribirte o gestionar.
          }
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        @for (act of actividadesPublicadas; track act.id) {
          <button type="button" (click)="navegarATallerPorId(act.id)"
                  class="group rounded-xl shadow-lg p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center"
                  [class]="estiloTarjeta(act.tipo).classes">
            <div class="text-6xl mb-4">{{ estiloTarjeta(act.tipo).icon }}</div>
            <h2 class="text-3xl font-bold mb-2">{{ act.tipo }}</h2>
            <p class="text-sm opacity-90 mb-4 line-clamp-2">
              {{ estiloTarjeta(act.tipo).descripcion }}
            </p>
            <div class="opacity-90">
              <div class="text-2xl font-bold">{{ conteoTarjeta(act) }}</div>
              <div class="text-sm">{{ etiquetaConteo() }}</div>
            </div>
          </button>
        }

        @if (actividadesPublicadas.length === 0) {
          <div class="col-span-full text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            @if (auth.isProfesor()) {
              No tienes un taller asignado o publicado aún.
            } @else {
              No hay actividades publicadas en el catálogo.
            }
          </div>
        }

        @if (!auth.isProfesor()) {
        <a [routerLink]="auth.isLoggedIn() ? '/salidas' : '/login'"
           class="group rounded-xl shadow-lg p-8 text-white bg-gradient-to-br from-purple-500 to-purple-700 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center">
          <div class="text-6xl mb-4">🚌</div>
          <h2 class="text-3xl font-bold mb-2">Salidas</h2>
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
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Estadísticas Generales</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-blue-600">{{ stats.talleres }}</div>
              <div class="text-sm text-gray-600 mt-1">Total Talleres</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-green-600">{{ stats.alumnos }}</div>
              <div class="text-sm text-gray-600 mt-1">Total Alumnos</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-purple-600">{{ stats.profesores }}</div>
              <div class="text-sm text-gray-600 mt-1">Total Profesores</div>
            </div>
            <div class="bg-orange-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-orange-600">{{ stats.reservas }}</div>
              <div class="text-sm text-gray-600 mt-1">Total Reservas</div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
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
  actividadesPublicadas: any[] = [];
  asignacionesPendientes: any[] = [];

  private descripciones: Record<string, string> = {
    atletismo: 'Gestiona el taller de atletismo',
    basquet: 'Gestiona el taller de básquet',
    futbol: 'Gestiona el taller de fútbol',
    voley: 'Gestiona el taller de voley',
  };

  ngOnInit() {
    this.loadData();
    if (!this.auth.isLoggedIn()) return;

    this.alumnoId = this.auth.currentUserId();
    this.tallerIdProfesor = this.auth.currentTallerId();

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
      this.pollSub = this.notificacionPoll.cambios$.subscribe(({ notificaciones }) => {
        this.notificaciones = notificaciones;
      });
      this.notificacionPoll.refrescar();
    }
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

  estiloTarjeta(tipo: string): CardTaller {
    const t = this.normalizar(tipo);
    const descripcion =
      this.descripciones[t] ??
      (tipo ? `Gestiona el taller de ${tipo.toLowerCase()}` : 'Actividad deportiva del club');
    if (t.includes('atletismo')) return { classes: 'bg-gradient-to-br from-orange-500 to-orange-700', icon: '🏃', descripcion };
    if (t.includes('basquet') || t.includes('basket')) return { classes: 'bg-gradient-to-br from-red-500 to-red-700', icon: '🏀', descripcion };
    if (t.includes('futbol')) return { classes: 'bg-gradient-to-br from-green-500 to-green-700', icon: '⚽', descripcion };
    if (t.includes('voley') || t.includes('volei')) return { classes: 'bg-gradient-to-br from-blue-500 to-blue-700', icon: '🏐', descripcion };
    if (t.includes('zumba')) return { classes: 'bg-gradient-to-br from-pink-500 to-fuchsia-600', icon: '💃', descripcion };
    if (t.includes('cocina')) return { classes: 'bg-gradient-to-br from-amber-500 to-orange-600', icon: '👨‍🍳', descripcion };
    return { classes: 'bg-gradient-to-br from-indigo-500 to-indigo-700', icon: '🎯', descripcion };
  }

  private normalizar(s: string): string {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private contarAlumnosPorTaller(tallerId: number): number {
    return this.alumnos.filter((a) => Number(a?.tallerId) === tallerId).length;
  }

  loadData() {
    const asList = (data: unknown): any[] => (Array.isArray(data) ? data : []);

    this.apiService.getCatalogoTalleres().subscribe({
      next: (data) => {
        this.actividadesPublicadas = this.filtrarActividadesParaUsuario(asList(data));
        if (this.auth.isLoggedIn()) {
          this.cargarInscripcionesPorTaller(this.actividadesPublicadas);
        }
      },
      error: () => (this.actividadesPublicadas = []),
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
