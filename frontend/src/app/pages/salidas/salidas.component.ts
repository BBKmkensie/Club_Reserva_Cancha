/**
 * =============================================================================
 * app/pages/salidas/salidas.component.ts — Historial de salidas (solo lectura)
 * =============================================================================
 * Consulta del historial de salidas pedagógicas con estado y resultado.
 * Rol: coordinación / gestión. Los alumnos se redirigen a /mis-salidas.
 * Endpoints ApiService: getSalidas
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Salida, etiquetaFlujoSalida, etiquetaEstadoSalida } from '../../models/salida.model';

@Component({
  selector: 'app-salidas',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-ink">Salidas programadas</h1>
        <p class="text-ink-muted mt-1">Historial con profesor responsable, origen y resultado al cerrar.</p>
      </div>

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
  /** Cliente HTTP para listar salidas. */
  private api = inject(ApiService);
  /** Redirige alumnos a /mis-salidas (esta vista es de gestión). */
  private router = inject(Router);
  /** Permisos y tipo de usuario (alumno vs coordinación). */
  auth = inject(AuthRoleService);

  /** Listado completo de salidas pedagógicas desde la API. */
  salidas: Salida[] = [];

  /**
   * Si el usuario es alumno (o solo se inscribe a salidas), lo manda a Mis salidas.
   * Si es gestión/coordinación, carga el historial completo.
   */
  ngOnInit() {
    // Alumnos usan Mis salidas (filtrado por talleres inscritos)
    if (this.auth.isAlumno() || this.auth.canInscribirseSalidas()) {
      this.router.navigate(['/mis-salidas']);
      return;
    }
    this.cargar();
  }

  /** Historial completo para coordinación / roles de gestión. */
  cargar() {
    this.api.getSalidas().subscribe({
      next: (d) => (this.salidas = d),
      error: () => (this.salidas = []),
    });
  }

  /** Texto del flujo pedagógico (p. ej. pendiente profesor / directiva). */
  etiqueta(s: Salida) { return etiquetaFlujoSalida(s); }
  /** Etiqueta corta del estado (PUBLICADA, EN_CURSO, CERRADA…). */
  estadoLabel(s: Salida) { return etiquetaEstadoSalida(s); }
}
