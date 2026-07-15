/**
 * =============================================================================
 * app/pages/salidas/salidas.component.ts — Historial de salidas (solo lectura)
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Salida, etiquetaFlujoSalida, etiquetaEstadoSalida, salidaPermiteAsistencia } from '../../models/salida.model';
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

      <section id="control-asistencia" class="bg-primary-50 rounded-xl shadow-lg p-6 border-2 border-primary-300">
        <h2 class="text-xl font-bold text-primary-900 mb-1">Asistencia e imagen de evidencia</h2>
        <p class="text-sm text-ink-muted mb-4">
          @if (auth.isProfesor()) {
            Si eres el profesor responsable, puedes iniciar la lista, marcar asistencia y subir la imagen de evidencia.
          } @else {
            Selecciona una salida para ver la lista de alumnos inscritos, quién asistió y la foto registrada por el profesor.
          }
        </p>
        @if (errorCarga) {
          <p class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{{ errorCarga }}</p>
        }
        @if (salidasAsistencia.length === 0) {
          <p class="text-sm text-ink-muted">
            No hay salidas publicadas, en curso o cerradas para revisar.
            @if (salidas.length > 0) {
              Hay {{ salidas.length }} salida(s) aún pendientes de aprobación.
            }
          </p>
        } @else {
          <label class="block text-sm font-medium text-ink-secondary mb-1">Seleccionar salida</label>
          <select [(ngModel)]="salidaSeleccionada"
                  class="w-full max-w-xl border border-primary-300 rounded-lg px-3 py-2 mb-4 bg-white">
            <option [ngValue]="null">— Seleccione una salida —</option>
            @for (s of salidasAsistencia; track s.id) {
              <option [ngValue]="s.id">
                {{ s.destino }} · {{ s.fecha | date:'dd/MM/yyyy' }} · {{ estadoLabel(s) }}
              </option>
            }
          </select>
          @if (salidaSeleccionada) {
            @if (auth.isProfesor() && !puedeEditarAsistencia(salidaSeleccionada)) {
              <p class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                Solo el profesor asignado a esta salida puede registrar la asistencia.
                Usa una salida donde aparezcas como responsable o ve a <strong>Abrir Salidas</strong>.
              </p>
            }
            <app-asistencia-salida-panel
              [salidaId]="salidaSeleccionada"
              [profesorId]="puedeEditarAsistencia(salidaSeleccionada) ? auth.currentUserId() : null"
              [modoEdicion]="puedeEditarAsistencia(salidaSeleccionada)" />
          } @else {
            <p class="text-sm text-primary-800">Selecciona una salida arriba para ver la asistencia.</p>
          }
        }
      </section>

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

            @if (salidaPermiteAsistencia(salida)) {
              <button type="button" (click)="salidaSeleccionada = salida.id; scrollAsistencia()"
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
  errorCarga = '';
  salidaPermiteAsistencia = salidaPermiteAsistencia;

  get salidasAsistencia(): Salida[] {
    return this.salidas.filter((s) => salidaPermiteAsistencia(s));
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
      next: (d) => {
        this.salidas = d ?? [];
        this.errorCarga = '';
        if (this.salidaSeleccionada && !this.salidasAsistencia.some((s) => s.id === this.salidaSeleccionada)) {
          this.salidaSeleccionada = null;
        }
        if (!this.salidaSeleccionada && this.salidasAsistencia.length === 1) {
          this.salidaSeleccionada = this.salidasAsistencia[0].id;
        }
      },
      error: () => {
        this.salidas = [];
        this.errorCarga = 'No se pudieron cargar las salidas. Verifica que el backend esté activo.';
      },
    });
  }

  scrollAsistencia(): void {
    if (typeof document === 'undefined') return;
    document.getElementById('control-asistencia')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  puedeEditarAsistencia(salidaId: number): boolean {
    if (!this.auth.isProfesor() || !this.auth.currentUserId()) return false;
    const salida = this.salidas.find((s) => Number(s.id) === Number(salidaId));
    const responsableId = salida?.profesorId ?? salida?.profesor?.id;
    return Number(responsableId) === Number(this.auth.currentUserId());
  }

  etiqueta(s: Salida) { return etiquetaFlujoSalida(s); }
  estadoLabel(s: Salida) { return etiquetaEstadoSalida(s); }
}
