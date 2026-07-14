/**
 * =============================================================================
 * app/pages/comparacion-semestre/comparacion-semestre.component.ts — Comparación semestral
 * =============================================================================
 * Estadísticas comparativas de talleres por período académico: ocupación, ranking
 * y sugerencias para el próximo semestre.
 * Rol: coordinación o profesor — canVerComparacionSemestre().
 * Endpoints ApiService: getPeriodos, getComparacionSemestre
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';

@Component({
  selector: 'app-comparacion-semestre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-surface rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Comparación de semestre</h1>
        <p class="text-ink-muted mb-4">
          Cantidad de alumnos por taller, ranking de ocupación y sugerencias para el próximo período.
        </p>

        @if (periodos.length) {
          <label class="block text-sm font-medium text-ink-secondary mb-1">Período académico</label>
          <select [(ngModel)]="periodoId" (ngModelChange)="cargar()"
                  class="border border-line-strong rounded-lg px-3 py-2 mb-4 w-full max-w-md">
            @for (p of periodos; track p.id) {
              <option [ngValue]="p.id">{{ p.nombre || ('Período ' + p.id) }}</option>
            }
          </select>
        }

        @if (cargando) {
          <p class="text-ink-muted">Cargando estadísticas…</p>
        } @else if (error) {
          <p class="text-red-600">{{ error }}</p>
        } @else if (datos) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ datos.resumen?.totalTalleres ?? 0 }}</div>
              <div class="text-sm text-ink-muted">Talleres activos</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">{{ datos.resumen?.totalAceptados ?? 0 }}</div>
              <div class="text-sm text-ink-muted">Aceptados</div>
            </div>
            <div class="bg-amber-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-amber-600">{{ datos.resumen?.totalPendientes ?? 0 }}</div>
              <div class="text-sm text-ink-muted">Pendientes</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">{{ datos.resumen?.promedioOcupacion ?? 0 }}%</div>
              <div class="text-sm text-ink-muted">Ocupación promedio</div>
            </div>
          </div>

          @if (datos.ranking?.length) {
            <h2 class="text-xl font-bold text-ink mb-3">Ranking de talleres</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm border border-line rounded-lg">
                <thead class="bg-page">
                  <tr>
                    <th class="text-left p-3">Taller</th>
                    <th class="text-right p-3">Aceptados</th>
                    <th class="text-right p-3">Pendientes</th>
                    <th class="text-right p-3">Ocupación</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of datos.ranking; track r.tallerId) {
                    <tr class="border-t border-line">
                      <td class="p-3 font-medium">{{ r.tipo }}</td>
                      <td class="p-3 text-right">{{ r.aceptados }}</td>
                      <td class="p-3 text-right">{{ r.pendientes }}</td>
                      <td class="p-3 text-right">{{ r.ocupacionPct }}%</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (datos.sugerencias?.length) {
            <h2 class="text-xl font-bold text-ink mt-6 mb-3">Sugerencias</h2>
            <ul class="space-y-2">
              @for (s of datos.sugerencias; track $index) {
                <li class="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900">{{ s.mensaje }}</li>
              }
            </ul>
          }
        }
      </div>
    </div>
  `,
})
export class ComparacionSemestreComponent implements OnInit {
  /** Cliente HTTP: períodos y comparación semestral. */
  private api = inject(ApiService);
  /** Si es profesor, la API filtra por su taller. */
  auth = inject(AuthRoleService);

  /** Lista de períodos académicos para el select. */
  periodos: any[] = [];
  /** Período seleccionado (por defecto el activo). */
  periodoId: number | null = null;
  /** Respuesta: resumen, ranking y sugerencias del semestre. */
  datos: any = null;
  /** true mientras getComparacionSemestre está en curso. */
  cargando = false;
  /** Mensaje de error si falla la carga. */
  error = '';

  /** Carga períodos académicos y preselecciona el activo antes de consultar estadísticas. */
  ngOnInit() {
    this.api.getPeriodos().subscribe({
      next: (data) => {
        this.periodos = Array.isArray(data) ? data : [];
        const activo = this.periodos.find((p) => p.activo);
        this.periodoId = activo?.id ?? this.periodos[0]?.id ?? null;
        this.cargar();
      },
      error: () => this.cargar(),
    });
  }

  /** Obtiene ranking de ocupación y sugerencias del período seleccionado. */
  cargar() {
    this.cargando = true;
    this.error = '';
    const profesorId = this.auth.isProfesor() ? this.auth.currentUserId() ?? undefined : undefined;
    this.api.getComparacionSemestre(this.periodoId ?? undefined, profesorId).subscribe({
      next: (data) => {
        this.datos = data;
        this.cargando = false;
      },
      error: (e) => {
        this.datos = null;
        this.cargando = false;
        this.error = e?.error?.message || 'No se pudieron cargar las estadísticas.';
      },
    });
  }
}
