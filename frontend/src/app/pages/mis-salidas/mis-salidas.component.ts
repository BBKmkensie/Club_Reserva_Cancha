/**
 * =============================================================================
 * app/pages/mis-salidas/mis-salidas.component.ts — Inscripción en salidas (alumno)
 * =============================================================================
 * Portal del estudiante para ver e inscribirse en salidas publicadas de sus talleres.
 * Solo muestra salidas de talleres con inscripción ACEPTADA.
 * Rol: alumno (usuario, no apoderado) — canInscribirseSalidas().
 * Endpoints ApiService: getInscripcionesTallerPorAlumno, getInscripcionesPorAlumno,
 * getSalidasPublicadas, inscribirSalida, desinscribirSalida
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Salida, etiquetaFlujoSalida, etiquetaEstadoSalida } from '../../models/salida.model';

@Component({
  selector: 'app-mis-salidas',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="bg-surface rounded-lg shadow p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Mis salidas</h1>
        <p class="text-ink-muted">Solo ves salidas de los talleres en los que estás inscrito (aceptado).</p>
      </div>

      @if (!alumnoId) {
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          Debes entrar como <strong>Estudiante</strong> para ver e inscribirte en salidas.
        </div>
      } @else if (!inscritoEnTaller) {
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          No estás inscrito en ningún taller. Inscríbete primero en
          <a routerLink="/inscripcion-talleres" class="text-primary-600 font-medium underline">Inscripción de Talleres</a>
          y espera la aceptación para ver salidas disponibles.
        </div>
      } @else {
        @if (misInscripciones.length) {
          <div class="bg-surface rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Mis inscripciones</h2>
            <ul class="space-y-3">
              @for (insc of misInscripciones; track insc.id) {
                <li class="border rounded-lg p-4 bg-page">
                  <p class="font-semibold">{{ insc.salida?.destino }}</p>
                  <p class="text-sm text-ink-muted">{{ insc.salida?.fecha | date:'fullDate' }}</p>
                  @if (insc.salida?.taller) {
                    <p class="text-sm text-ink-muted">Taller: {{ insc.salida.taller.tipo }}</p>
                  }
                  @if (insc.salida) {
                    <p class="text-xs text-primary-700 mt-1">{{ etiqueta(insc.salida) }}</p>
                    @if (insc.salida.estado === 'CERRADA') {
                      <p class="text-sm mt-2" [class.text-green-700]="insc.salida.resultado === 'EXITO'" [class.text-red-700]="insc.salida.resultado === 'FRACASO'">
                        Resultado: {{ insc.salida.resultado === 'EXITO' ? 'Éxito ✓' : 'Fracaso ✗' }}
                      </p>
                      @if (insc.salida.comentarioCierre) {
                        <p class="text-sm text-ink-muted mt-1 italic">"{{ insc.salida.comentarioCierre }}"</p>
                      }
                    }
                  }
                  <button (click)="desinscribir(insc.salidaId)" class="text-red-600 text-sm mt-2 hover:underline">Desinscribirme</button>
                </li>
              }
            </ul>
          </div>
        }

        <div class="bg-surface rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Salidas disponibles</h2>
          <div class="space-y-4">
            @for (salida of salidas; track salida.id) {
              <div class="border rounded-lg p-4 flex justify-between gap-4">
                <div>
                  <h3 class="font-semibold text-ink">{{ salida.destino }}</h3>
                  <p class="text-sm text-ink-muted">{{ salida.descripcion || 'Sin descripción' }}</p>
                  <p class="text-sm text-ink-muted mt-1">{{ salida.fecha | date:'fullDate' }} @if (salida.hora) { · {{ salida.hora }} }</p>
                  <p class="text-sm text-ink-muted">Profesor: <strong>{{ salida.profesor?.nombre || '—' }}</strong></p>
                  @if (salida.taller) {
                    <p class="text-sm text-ink-muted">Taller: {{ salida.taller.tipo }}</p>
                  }
                  <p class="text-xs text-primary-700 mt-1">{{ etiqueta(salida) }}</p>
                  <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    {{ estadoLabel(salida) }}
                  </span>
                  @if (salida.estado === 'CERRADA' && salida.comentarioCierre) {
                    <p class="text-sm text-ink-muted mt-2 bg-page p-2 rounded">
                      Comentario: {{ salida.comentarioCierre }}
                      · {{ salida.resultado === 'EXITO' ? 'Éxito' : 'Fracaso' }}
                    </p>
                  }
                </div>
                @if (salida.estado === 'PUBLICADA' || salida.estado === 'EN_CURSO') {
                  @if (yaInscrito(salida.id)) {
                    <span class="text-green-600 text-sm font-medium shrink-0">Inscrito</span>
                  } @else {
                    <button (click)="inscribir(salida.id)"
                            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm shrink-0 h-fit">
                      Inscribirme
                    </button>
                  }
                }
              </div>
            }
            @if (salidas.length === 0) {
              <p class="text-ink-muted">No hay salidas publicadas de tus talleres por ahora.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class MisSalidasComponent implements OnInit {
  /** Cliente HTTP: salidas publicadas e inscripciones a salida. */
  private api = inject(ApiService);
  /** Id del alumno logueado. */
  private auth = inject(AuthRoleService);

  /** Salidas de talleres donde el alumno está ACEPTADO. */
  salidas: Salida[] = [];
  /** Inscripciones del alumno a salidas concretas. */
  misInscripciones: any[] = [];
  /** Id del alumno en sesión. */
  alumnoId: number | null = null;
  /** true si tiene al menos un taller aceptado (puede ver salidas). */
  inscritoEnTaller = false;
  /** Conjunto de tallerId con inscripción ACEPTADO (filtro de salidas). */
  private tallerIdsInscritos = new Set<number>();

  /** Verifica inscripción aceptada en taller y carga solo salidas de esos talleres. */
  ngOnInit() {
    this.alumnoId = this.auth.currentUserId();
    if (!this.alumnoId) return;

    this.api.getInscripcionesTallerPorAlumno(this.alumnoId).subscribe({
      next: (inscs) => {
        const aceptadas = (inscs ?? []).filter(
          (i: any) => String(i.estado ?? '').toUpperCase() === 'ACEPTADO',
        );
        this.tallerIdsInscritos = new Set(
          aceptadas
            .map((i: any) => Number(i.tallerId ?? i.taller?.id))
            .filter((id: number) => !Number.isNaN(id)),
        );
        this.inscritoEnTaller = this.tallerIdsInscritos.size > 0;
        this.cargarInscripcionesSalida();
        if (this.inscritoEnTaller) {
          this.cargarSalidas();
        }
      },
      error: () => {
        this.inscritoEnTaller = false;
        this.tallerIdsInscritos = new Set();
      },
    });
  }

  /** Carga las inscripciones del alumno a salidas (estado de cupo). */
  private cargarInscripcionesSalida() {
    if (!this.alumnoId) return;
    this.api.getInscripcionesPorAlumno(this.alumnoId).subscribe({
      next: (d) => (this.misInscripciones = this.filtrarInscripcionesPropias(d ?? [])),
      error: () => (this.misInscripciones = []),
    });
  }

  /** Obtiene salidas publicadas y las limita a talleres con inscripción ACEPTADA. */
  private cargarSalidas() {
    if (!this.alumnoId) return;
    this.api.getSalidasPublicadas(undefined, this.alumnoId).subscribe({
      next: (d) => {
        this.salidas = (d ?? []).filter((s) =>
          this.tallerIdsInscritos.has(Number(s.tallerId ?? s.taller?.id)),
        );
      },
      error: () => (this.salidas = []),
    });
  }

  /** Deja solo inscripciones cuya salida pertenece a talleres aceptados del alumno. */
  private filtrarInscripcionesPropias(list: any[]): any[] {
    if (!this.tallerIdsInscritos.size) return list;
    return list.filter((i) => {
      const tid = Number(i.salida?.tallerId ?? i.salida?.taller?.id);
      return Number.isNaN(tid) || this.tallerIdsInscritos.has(tid);
    });
  }

  /** Texto del flujo pedagógico de la salida. */
  etiqueta(s: Salida) { return etiquetaFlujoSalida(s); }
  /** Etiqueta corta del estado de la salida. */
  estadoLabel(s: Salida) { return etiquetaEstadoSalida(s); }

  /** true si el alumno ya tiene inscripción a esa salida. */
  yaInscrito(salidaId: number): boolean {
    return this.misInscripciones.some((i) => i.salidaId === salidaId || i.salida?.id === salidaId);
  }

  /** Inscribe al alumno en una salida publicada o en curso. */
  inscribir(salidaId: number) {
    if (!this.alumnoId) return;
    this.api.inscribirSalida(this.alumnoId, salidaId).subscribe({
      next: () => this.refrescarInscripciones(),
      error: (e) => alert(e?.error?.message || 'Error al inscribirse'),
    });
  }

  /** Cancela la inscripción del alumno en una salida. */
  desinscribir(salidaId: number) {
    if (!this.alumnoId || !confirm('¿Desinscribirse?')) return;
    this.api.desinscribirSalida(this.alumnoId, salidaId).subscribe({
      next: () => this.refrescarInscripciones(),
      error: () => alert('Error'),
    });
  }

  /** Recarga el listado de inscripciones del alumno tras un cambio. */
  private refrescarInscripciones() {
    if (!this.alumnoId) return;
    this.api.getInscripcionesPorAlumno(this.alumnoId).subscribe({
      next: (d) => (this.misInscripciones = this.filtrarInscripcionesPropias(d ?? [])),
    });
  }
}
