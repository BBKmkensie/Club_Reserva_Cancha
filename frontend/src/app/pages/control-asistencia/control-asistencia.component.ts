/**
 * =============================================================================
 * app/pages/control-asistencia/control-asistencia.component.ts — Control de asistencia
 * =============================================================================
 * Sesión diaria de asistencia del taller: abrir, marcar estados, cerrar y reporte.
 * Rol: profesor del taller o coordinación — canGestionarAsistencia().
 * Endpoints ApiService: getTaller, getSesionActiva, getHistorialSesiones,
 * abrirSesionAsistencia, actualizarAsistencia, cerrarSesionAsistencia, getReporteActividad
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { AlumnoPrivacidadService } from '../../shared/services/alumno-privacidad.service';
import { descargarPdfReporteActividad } from '../../shared/utils/reporte-pdf.util';

interface RegistroUI {
  alumnoId: number;
  nombre: string;
  rut: string;
  estado: 'PRESENTE' | 'AUSENTE';
  observacion: string;
  expandido: boolean;
}

@Component({
  selector: 'app-control-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-surface rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Control de Asistencia</h1>
        <p class="text-ink-muted">
          Abre una sesión, marca asistencia (presente o ausente) y registra observaciones por alumno.
        </p>
      </div>

      @if (!tallerId) {
        <p class="text-amber-700 bg-amber-50 p-4 rounded-lg">
          Entra como profesor para gestionar la asistencia de tu taller.
        </p>
      } @else {
        <div class="bg-surface rounded-xl shadow p-6">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 class="text-xl font-bold text-ink">{{ nombreTaller }}</h2>
              <p class="text-sm text-ink-muted">Fecha: {{ fechaHoy | date:'dd/MM/yyyy' }}</p>
            </div>
            @if (!sesion) {
              <button (click)="abrirSesion()" [disabled]="cargando"
                      class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                Abrir sesión de hoy
              </button>
            } @else if (sesion.estado === 'ABIERTA') {
              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">Sesión abierta</span>
            } @else {
              <span class="bg-gray-200 text-ink-secondary px-3 py-1 rounded-full text-sm font-bold">Sesión cerrada</span>
            }
          </div>

          @if (error) {
            <p class="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{{ error }}</p>
          }

          @if (sesion && sesion.estado === 'ABIERTA') {
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 class="text-lg font-semibold text-ink">Pasar lista</h3>
              <div class="flex flex-wrap items-center gap-3">
                <p class="text-sm text-ink-muted">
                  <span class="text-green-700 font-semibold">{{ contarPresentes() }} presentes</span>
                  ·
                  <span class="text-red-700 font-semibold">{{ contarAusentes() }} ausentes</span>
                  · {{ registros.length }} alumnos
                </p>
                <button type="button" (click)="marcarTodosPresentes()"
                        class="text-sm text-primary-600 hover:text-primary-800 font-medium">
                  Todos presentes
                </button>
              </div>
            </div>
            <p class="text-xs text-ink-muted mb-3">
              Toca el círculo para cambiar: presente ↔ ausente. Usa «Obs.» para notas por alumno.
            </p>
            <div class="flex flex-wrap gap-4 text-xs text-ink-muted mb-4">
              <span class="inline-flex items-center gap-1.5">
                <span class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</span>
                Presente
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="w-6 h-6 rounded-full border-2 border-red-400 bg-surface"></span>
                Ausente
              </span>
            </div>
            <ul class="mb-4 max-h-[32rem] overflow-y-auto rounded-xl border border-line divide-y divide-gray-100 bg-surface">
              @for (r of registros; track r.alumnoId) {
                <li class="px-3 sm:px-4 py-3 transition-colors"
                    [ngClass]="claseFila(r.estado)">
                  <div class="flex items-center gap-3">
                    <div class="min-w-0 flex-1">
                      <p class="font-medium text-ink truncate">{{ priv.nombre(r.nombre) }}</p>
                      <p class="text-xs text-ink-muted">{{ priv.rut(r.rut) }}</p>
                    </div>
                    <button type="button" (click)="r.expandido = !r.expandido"
                            class="text-xs text-primary-600 hover:underline shrink-0">
                      Obs.
                    </button>
                    <button type="button"
                            (click)="ciclarEstado(r)"
                            [attr.aria-label]="etiquetaEstado(r.estado)"
                            class="asistencia-circulo shrink-0"
                            [class.asistencia-circulo--presente]="r.estado === 'PRESENTE'"
                            [class.asistencia-circulo--ausente]="r.estado === 'AUSENTE'">
                      @if (r.estado === 'PRESENTE') {
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                        </svg>
                      }
                    </button>
                  </div>
                  @if (r.expandido || r.observacion) {
                    <input type="text" [(ngModel)]="r.observacion"
                           class="mt-2 w-full border border-line-strong rounded-lg px-3 py-1.5 text-sm"
                           placeholder="Observación del alumno (opcional)">
                  }
                </li>
              }
            </ul>

            <div class="mb-4">
              <label class="block text-sm font-medium text-ink-secondary mb-1">Observaciones de la sesión</label>
              <textarea [(ngModel)]="observacionesSesion" rows="2"
                        class="w-full border border-line-strong rounded-lg px-3 py-2"
                        placeholder="Notas generales de la clase..."></textarea>
            </div>

            <div class="flex gap-3">
              <button (click)="guardarAsistencia()" [disabled]="cargando"
                      class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                Guardar lista
              </button>
              <button (click)="cerrarSesion()" [disabled]="cargando"
                      class="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50">
                Cerrar sesión
              </button>
            </div>
          }

          @if (sesion && sesion.estado === 'CERRADA') {
            <p class="text-green-700 bg-green-50 p-4 rounded-lg">
              Sesión cerrada correctamente. Las estadísticas fueron actualizadas.
            </p>
          }
        </div>

        <div class="bg-surface rounded-xl shadow p-6 border-2 border-indigo-100">
          <h3 class="text-lg font-semibold text-ink mb-2">Reporte final (docente)</h3>
          <p class="text-sm text-ink-muted mb-3">
            Genera el reporte de participación, inscripciones y asistencia de tu actividad.
          </p>
          <button (click)="generarReporteFinal()"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
            Generar reporte final
          </button>
        </div>

        @if (historial.length > 0) {
          <div class="bg-surface rounded-xl shadow p-6">
            <h3 class="text-lg font-semibold text-ink mb-3">Historial de sesiones</h3>
            <ul class="space-y-2 text-sm">
              @for (h of historial; track h.id) {
                <li class="flex justify-between py-2 px-3 bg-page rounded-lg">
                  <span>{{ h.fecha | date:'dd/MM/yyyy' }} — {{ h.estado }}</span>
                  <span class="text-ink-muted">
                    {{ contarEstado(h, 'PRESENTE') }} presentes,
                    {{ contarEstado(h, 'AUSENTE') }} ausentes
                  </span>
                </li>
              }
            </ul>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .asistencia-circulo {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 9999px;
      border: 2px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
      cursor: pointer;
    }
    .asistencia-circulo:hover {
      transform: scale(1.06);
    }
    .asistencia-circulo:active {
      transform: scale(0.95);
    }
    .asistencia-circulo--presente {
      background-color: #10b981;
      border-color: #059669;
      color: #fff;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
    }
    .asistencia-circulo--ausente {
      background-color: #fff;
      border-color: #f87171;
      box-shadow: 0 1px 4px rgba(239, 68, 68, 0.12);
    }
    .fila-presente {
      background-color: rgba(16, 185, 129, 0.08);
    }
    .fila-ausente {
      background-color: rgba(239, 68, 68, 0.06);
    }
  `],
})
export class ControlAsistenciaComponent implements OnInit {
  /** Cliente HTTP: sesión activa, guardar/cerrar, historial, PDF. */
  private api = inject(ApiService);
  /** Profesor logueado → tallerId y profesorId de sesión. */
  auth = inject(AuthRoleService);
  /** Enmascara nombre/RUT en la lista de asistencia. */
  priv = inject(AlumnoPrivacidadService);

  /** Taller del profesor (desde AuthRoleService). */
  tallerId: number | null = null;
  /** Id del profesor logueado. */
  profesorId: number | null = null;
  /** Nombre del taller para el encabezado. */
  nombreTaller = '';
  /** Sesión abierta del día (null si aún no se abrió). */
  sesion: any = null;
  /** Filas UI de asistencia (alumno + estado + observación). */
  registros: RegistroUI[] = [];
  /** Sesiones cerradas previas. */
  historial: any[] = [];
  /** Observación general de la sesión al cerrar. */
  observacionesSesion = '';
  /** Mensaje de error de operaciones. */
  error = '';
  /** true mientras se abre/guarda/cierra sesión. */
  cargando = false;
  /** Fecha mostrada como «hoy» en la UI. */
  fechaHoy = new Date();

  /** Inicializa taller del profesor y carga sesión activa e historial. */
  ngOnInit() {
    this.tallerId = this.auth.currentTallerId();
    this.profesorId = this.auth.currentUserId();
    if (this.tallerId) {
      this.api.getTaller(this.tallerId).subscribe({
        next: (t) => this.nombreTaller = t.tipo,
        error: () => this.nombreTaller = `Taller #${this.tallerId}`
      });
      this.cargarSesionActiva();
      this.cargarHistorial();
    }
  }

  /** Consulta la sesión de asistencia abierta del taller, si existe. */
  cargarSesionActiva() {
    if (!this.tallerId) return;
    this.api.getSesionActiva(this.tallerId).subscribe({
      next: (s) => {
        this.sesion = s;
        if (s) this.mapearRegistros(s);
      },
      error: () => this.sesion = null
    });
  }

  /** Carga el historial de sesiones de asistencia cerradas del taller. */
  cargarHistorial() {
    if (!this.tallerId) return;
    this.api.getHistorialSesiones(this.tallerId).subscribe({
      next: (data) => this.historial = data ?? [],
      error: () => this.historial = []
    });
  }

  /** Convierte registros del API a filas UI (TARDE histórica → PRESENTE). */
  mapearRegistros(sesion: any) {
    this.registros = (sesion.registros ?? []).map((r: any) => {
      // Datos históricos con TARDE se tratan como presente al editar
      const estadoRaw = String(r.estado ?? '').toUpperCase();
      const estado: RegistroUI['estado'] =
        estadoRaw === 'AUSENTE' ? 'AUSENTE' : 'PRESENTE';
      return {
        alumnoId: r.alumnoId,
        nombre: r.alumno?.nombre ?? 'Alumno',
        rut: r.alumno?.rut ?? '',
        estado,
        observacion: r.observacion ?? '',
        expandido: !!r.observacion,
      };
    });
    this.observacionesSesion = sesion.observaciones ?? '';
  }

  /** Abre la sesión de asistencia del día para el taller del profesor logueado. */
  abrirSesion() {
    if (!this.tallerId || !this.profesorId) return;
    this.cargando = true;
    this.error = '';
    this.api.abrirSesionAsistencia(this.tallerId, this.profesorId).subscribe({
      next: (s) => {
        this.cargando = false;
        this.sesion = s;
        this.mapearRegistros(s);
        this.cargarHistorial();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'No se pudo abrir la sesión';
      }
    });
  }

  /** Guarda los estados de asistencia y observaciones por alumno en la sesión abierta. */
  guardarAsistencia() {
    if (!this.sesion) return;
    this.cargando = true;
    this.api.actualizarAsistencia(this.sesion.id, this.registros.map((r) => ({
      alumnoId: r.alumnoId,
      estado: r.estado,
      observacion: r.observacion || undefined,
    }))).subscribe({
      next: (s) => {
        this.cargando = false;
        this.sesion = s;
        this.mapearRegistros(s);
        alert('Lista guardada');
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'Error al guardar';
      }
    });
  }

  /** Cierra la sesión; requiere haber guardado la lista previamente. */
  cerrarSesion() {
    if (!this.sesion) return;
    if (!this.sesion.listaGuardada) {
      alert('Primero debes guardar la lista de asistencia antes de cerrar la sesión.');
      return;
    }
    if (!confirm('¿Cerrar la sesión? No podrás editar la asistencia después.')) return;
    this.cargando = true;
    this.api.cerrarSesionAsistencia(this.sesion.id, this.observacionesSesion).subscribe({
      next: (s) => {
        this.cargando = false;
        this.sesion = s;
        this.cargarHistorial();
        alert('Sesión cerrada. Se evaluaron alertas de ausencias recurrentes.');
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'Error al cerrar sesión';
      }
    });
  }

  contarEstado(sesion: any, estado: string): number {
    return sesion.registros?.filter((r: any) => r.estado === estado).length ?? 0;
  }

  contarPresentes(): number {
    return this.registros.filter((r) => r.estado === 'PRESENTE').length;
  }

  contarAusentes(): number {
    return this.registros.filter((r) => r.estado === 'AUSENTE').length;
  }

  /** Alterna el estado del alumno: presente ↔ ausente. */
  ciclarEstado(r: RegistroUI) {
    r.estado = r.estado === 'PRESENTE' ? 'AUSENTE' : 'PRESENTE';
  }

  claseFila(estado: RegistroUI['estado']): string {
    return estado === 'AUSENTE' ? 'fila-ausente' : 'fila-presente';
  }

  etiquetaEstado(estado: RegistroUI['estado']): string {
    return estado === 'PRESENTE'
      ? 'Presente, tocar para marcar ausente'
      : 'Ausente, tocar para marcar presente';
  }

  marcarTodosPresentes() {
    this.registros.forEach((r) => { r.estado = 'PRESENTE'; });
  }

  /** Genera y descarga el reporte de actividad del taller en PDF. */
  generarReporteFinal() {
    if (!this.tallerId) return;
    this.api.getReporteActividad(this.tallerId).subscribe({
      next: (r) => {
        descargarPdfReporteActividad(r, 'REPORTE FINAL DEL DOCENTE', (al) => this.priv.alumno(al));
      },
      error: (e) => alert(e?.error?.message || 'No se pudo generar el reporte'),
    });
  }
}
