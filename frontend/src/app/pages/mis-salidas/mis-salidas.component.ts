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
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Mis salidas</h1>
        <p class="text-gray-600">Salidas de los talleres en los que estás inscrito.</p>
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
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Mis inscripciones</h2>
            <ul class="space-y-3">
              @for (insc of misInscripciones; track insc.id) {
                <li class="border rounded-lg p-4 bg-gray-50">
                  <p class="font-semibold">{{ insc.salida?.destino }}</p>
                  <p class="text-sm text-gray-600">{{ insc.salida?.fecha | date:'fullDate' }}</p>
                  @if (insc.salida) {
                    <p class="text-xs text-primary-700 mt-1">{{ etiqueta(insc.salida) }}</p>
                    @if (insc.salida.estado === 'CERRADA') {
                      <p class="text-sm mt-2" [class.text-green-700]="insc.salida.resultado === 'EXITO'" [class.text-red-700]="insc.salida.resultado === 'FRACASO'">
                        Resultado: {{ insc.salida.resultado === 'EXITO' ? 'Éxito ✓' : 'Fracaso ✗' }}
                      </p>
                      @if (insc.salida.comentarioCierre) {
                        <p class="text-sm text-gray-600 mt-1 italic">"{{ insc.salida.comentarioCierre }}"</p>
                      }
                    }
                  }
                  <button (click)="desinscribir(insc.salidaId)" class="text-red-600 text-sm mt-2 hover:underline">Desinscribirme</button>
                </li>
              }
            </ul>
          </div>
        }

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Salidas disponibles</h2>
          <div class="space-y-4">
            @for (salida of salidas; track salida.id) {
              <div class="border rounded-lg p-4 flex justify-between gap-4">
                <div>
                  <h3 class="font-semibold text-gray-800">{{ salida.destino }}</h3>
                  <p class="text-sm text-gray-600">{{ salida.descripcion || 'Sin descripción' }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ salida.fecha | date:'fullDate' }} @if (salida.hora) { · {{ salida.hora }} }</p>
                  <p class="text-sm text-gray-600">Profesor: <strong>{{ salida.profesor?.nombre || '—' }}</strong></p>
                  @if (salida.taller) {
                    <p class="text-sm text-gray-600">Taller: {{ salida.taller.tipo }}</p>
                  }
                  <p class="text-xs text-primary-700 mt-1">{{ etiqueta(salida) }}</p>
                  <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    {{ estadoLabel(salida) }}
                  </span>
                  @if (salida.estado === 'CERRADA' && salida.comentarioCierre) {
                    <p class="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
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
              <p class="text-gray-500">No hay salidas publicadas disponibles.</p>
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

  inscribir(salidaId: number) {
    if (!this.alumnoId) return;
    this.api.inscribirSalida(this.alumnoId, salidaId).subscribe({
      next: () => this.refrescarInscripciones(),
      error: (e) => alert(e?.error?.message || 'Error al inscribirse'),
    });
  }

  desinscribir(salidaId: number) {
    if (!this.alumnoId || !confirm('¿Desinscribirse?')) return;
    this.api.desinscribirSalida(this.alumnoId, salidaId).subscribe({
      next: () => this.refrescarInscripciones(),
      error: () => alert('Error'),
    });
  }

  private refrescarInscripciones() {
    if (!this.alumnoId) return;
    this.api.getInscripcionesPorAlumno(this.alumnoId).subscribe({
      next: (d) => (this.misInscripciones = d),
    });
  }
}
