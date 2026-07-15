/**
 * =============================================================================
 * app/pages/salidas/salidas.component.ts — Historial de salidas (solo lectura)
 * =============================================================================
 * Consulta del historial de salidas pedagógicas con estado, resultado y asistencia.
 * Rol: coordinación / gestión. Los alumnos se redirigen a /mis-salidas.
 * Endpoints ApiService: getSalidas, getAsistenciaSalida
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Salida, etiquetaFlujoSalida, etiquetaEstadoSalida } from '../../models/salida.model';
import { AsistenciaSalidaPanelComponent } from '../../shared/components/asistencia-salida-panel/asistencia-salida-panel.component';

@Component({
  selector: 'app-salidas',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, AsistenciaSalidaPanelComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-ink">Salidas programadas</h1>
        <p class="text-ink-muted mt-1">Historial con profesor responsable, asistencia e imagen de evidencia.</p>
      </div>

      @if (salidasAsistencia.length) {
        <section class="bg-surface rounded-xl shadow-lg p-6 border border-primary-200">
          <h2 class="text-xl font-semibold text-ink mb-2">Asistencia e imagen de evidencia</h2>
          <p class="text-sm text-ink-muted mb-4">
            Selecciona una salida para ver la lista de alumnos inscritos, quién asistió y la foto registrada por el profesor.
          </p>
          <label class="block text-sm font-medium text-ink-secondary mb-1">Salida</label>
          <select [(ngModel)]="salidaSeleccionada"
                  class="w-full max-w-xl border border-line rounded-lg px-3 py-2 mb-4 bg-surface">
            <option [ngValue]="null">— Seleccione una salida —</option>
            @for (s of salidasAsistencia; track s.id) {
              <option [ngValue]="s.id">
                {{ s.destino }} · {{ s.fecha | date:'dd/MM/yyyy' }} · {{ estadoLabel(s) }}
              </option>
            }
          </select>
          @if (salidaSeleccionada) {
            <app-asistencia-salida-panel
              [salidaId]="salidaSeleccionada"
              [modoEdicion]="false" />
          }
        </section>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (salida of salidas; track salida.id) {
          <div class="bg-surface rounded-xl shadow p-6 border-l-4"
               [class.border-purple-500]="salida.estado === 'PUBLICADA'"
               [class.border-blue-500]="salida.estado === 'EN_CURSO'"
               [class.border-green-500]="salida.estado === 'CERRADA' && salida.resultado === 'EXITO'"
               [class.border-red-500]="salida.estado === 'CERRADA' && salida.resultado === 'FRACASO'"
               [class.border-amber-500]="salida.estado === 'PENDIENTE_PROFESOR' || salida.estado === 'PENDIENTE_DIRECTIVA'">
            <h3 class="text-xl font-semibold text-ink">{{ salida.destino }}</h3>
            <p class="text-sm text-ink-muted mt-1">{{ salida.fecha | date:'fullDate' }} @if (salida.hora) { · {{ salida.hora }} }</p>
            <p class="text-sm text-ink-muted mt-2">Profesor: <strong>{{ salida.profesor?.nombre || '—' }}</strong></p>
            <p class="text-sm text-ink-muted">Taller: {{ salida.taller?.tipo || '—' }}</p>
            @if (salida.descripcion) {
              <p class="text-sm text-ink-muted mt-2">{{ salida.descripcion }}</p>
            }
            <p class="text-xs text-primary-700 mt-2">{{ etiqueta(salida) }}</p>
            <span class="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-muted text-ink-secondary">
              {{ estadoLabel(salida) }}
            </span>
            @if (salida.estado === 'CERRADA') {
              <div class="mt-3 p-2 rounded text-sm"
                   [class.bg-green-50]="salida.resultado === 'EXITO'"
                   [class.text-green-800]="salida.resultado === 'EXITO'"
                   [class.bg-red-50]="salida.resultado === 'FRACASO'"
                   [class.text-red-800]="salida.resultado === 'FRACASO'">
                {{ salida.resultado === 'EXITO' ? '✓ Salida exitosa' : '✗ Salida con dificultades' }}
                @if (salida.comentarioCierre) {
                  <p class="mt-1 italic">"{{ salida.comentarioCierre }}"</p>
                }
              </div>
            }

            @if (salida.estado === 'PUBLICADA' || salida.estado === 'EN_CURSO' || salida.estado === 'CERRADA') {
              <button type="button" (click)="salidaSeleccionada = salida.id"
                      class="mt-4 text-sm text-primary-600 hover:text-primary-800 font-medium">
                Ver asistencia e imagen
              </button>
            }
          </div>
        }
        @if (salidas.length === 0) {
          <div class="col-span-full text-center text-ink-muted py-12">No hay salidas registradas</div>
        }
      </div>
    </div>
  `,
})
export class SalidasComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  auth = inject(AuthRoleService);

  salidas: Salida[] = [];
  salidaSeleccionada: number | null = null;

  get salidasAsistencia(): Salida[] {
    return this.salidas.filter(
      (s) => s.estado === 'PUBLICADA' || s.estado === 'EN_CURSO' || s.estado === 'CERRADA',
    );
  }

  ngOnInit() {
    if (this.auth.isAlumno() || this.auth.canInscribirseSalidas()) {
      this.router.navigate(['/mis-salidas']);
      return;
    }
    this.cargar();
  }

  cargar() {
    this.api.getSalidas().subscribe({
      next: (d) => (this.salidas = d),
      error: () => (this.salidas = []),
    });
  }

  etiqueta(s: Salida) { return etiquetaFlujoSalida(s); }
  estadoLabel(s: Salida) { return etiquetaEstadoSalida(s); }
}
