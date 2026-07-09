/**
 * Portal del estudiante para ver e inscribirse en salidas publicadas.
 * Lista salidas disponibles de los talleres en los que está inscrito.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Salida, etiquetaFlujoSalida, etiquetaEstadoSalida } from '../../models/salida.model';

/**
 * Vista estudiante: inscripción y desinscripción en salidas de sus talleres.
 */
@Component({
  selector: 'app-mis-salidas',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="bg-surface rounded-lg shadow p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Mis salidas</h1>
        <p class="text-ink-muted">Salidas de los talleres en los que estás inscrito.</p>
      </div>

      @if (!alumnoId) {
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          Debes entrar como <strong>Estudiante</strong> para ver e inscribirte en salidas.
        </div>
      } @else if (!inscritoEnTaller) {
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          No estás inscrito en ningún taller. Inscríbete primero en
          <a routerLink="/inscripcion-talleres" class="text-primary-600 font-medium underline">Inscripción de Talleres</a>
          para ver salidas disponibles.
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
              <p class="text-ink-muted">No hay salidas publicadas disponibles.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class MisSalidasComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthRoleService);

  salidas: Salida[] = [];
  misInscripciones: any[] = [];
  alumnoId: number | null = null;
  inscritoEnTaller = false;

  /** Verifica inscripción en taller y carga salidas e inscripciones del alumno. */
  ngOnInit() {
    this.alumnoId = this.auth.currentUserId();
    if (!this.alumnoId) return;

    this.api.getInscripcionesTallerPorAlumno(this.alumnoId).subscribe({
      next: (inscs) => {
        const aceptadas = (inscs ?? []).filter((i: any) => i.estado === 'ACEPTADO');
        this.inscritoEnTaller = aceptadas.length > 0 || !!this.auth.currentTallerId();
        if (this.inscritoEnTaller) {
          this.cargarSalidas();
        }
      },
      error: () => {
        this.inscritoEnTaller = false;
      },
    });

    this.api.getInscripcionesPorAlumno(this.alumnoId).subscribe({
      next: (d) => (this.misInscripciones = d),
      error: () => (this.misInscripciones = []),
    });
  }

  /** Obtiene salidas publicadas disponibles para el alumno autenticado. */
  private cargarSalidas() {
    if (!this.alumnoId) return;
    this.api.getSalidasPublicadas(undefined, this.alumnoId).subscribe({
      next: (d) => (this.salidas = d),
      error: () => (this.salidas = []),
    });
  }

  etiqueta(s: Salida) { return etiquetaFlujoSalida(s); }
  estadoLabel(s: Salida) { return etiquetaEstadoSalida(s); }

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
      next: (d) => (this.misInscripciones = d),
    });
  }
}
