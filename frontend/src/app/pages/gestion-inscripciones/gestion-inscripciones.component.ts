/**
 * =============================================================================
 * app/pages/gestion-inscripciones/gestion-inscripciones.component.ts — Gestión inscripciones
 * =============================================================================
 * Panel para revisar solicitudes, aceptar/rechazar alumnos y editar fichas físicas.
 * Rol: profesor de su taller o coordinación — canGestionarInscripcionesTaller().
 * Endpoints ApiService: getTalleres, getResumenInscripcionesTaller,
 * responderInscripcionTaller, actualizarFichaInscripcion
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { AlumnoPrivacidadService } from '../../shared/services/alumno-privacidad.service';
import { descargarPdfReporteInscripciones } from '../../shared/utils/reporte-pdf.util';

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

@Component({
  selector: 'app-gestion-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="bg-surface rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Gestión de Inscripciones</h1>
        <p class="text-ink-muted">
          Como profesor/coordinador revisas las solicitudes, apruebas o rechazas alumnos y monitoreas la capacidad del taller.
        </p>
      </div>

      @if (auth.isCoordinacion()) {
        <div class="bg-surface rounded-lg shadow p-4">
          <label class="block text-sm font-medium text-ink-secondary mb-2">Seleccionar taller</label>
          <select [(ngModel)]="tallerIdSeleccionado" (ngModelChange)="cargarResumen()"
                  class="w-full max-w-md border border-line-strong rounded-lg px-3 py-2">
            <option [ngValue]="null">— Elegir taller —</option>
            @for (t of talleres; track t.id) {
              <option [ngValue]="t.id">{{ t.tipo }}</option>
            }
          </select>
        </div>
      }

      @if (!tallerIdSeleccionado) {
        <p class="text-ink-muted bg-surface rounded-lg shadow p-6 text-center">
          @if (auth.isProfesor()) {
            No se detectó tu taller. Cierra sesión y entra de nuevo como profesor.
          } @else {
            Selecciona un taller para ver las inscripciones.
          }
        </p>
      } @else if (resumen) {
        <!-- Monitorear capacidad -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
            <div class="text-2xl font-bold text-blue-700">{{ resumen.resumen.capacidad }}</div>
            <div class="text-sm text-ink-muted">Capacidad</div>
          </div>
          <div class="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
            <div class="text-2xl font-bold text-amber-700">{{ resumen.resumen.pendientes }}</div>
            <div class="text-sm text-ink-muted">Pendientes</div>
          </div>
          <div class="bg-green-50 rounded-xl p-4 text-center border border-green-200">
            <div class="text-2xl font-bold text-green-700">{{ resumen.resumen.aceptados }}</div>
            <div class="text-sm text-ink-muted">Aceptados</div>
          </div>
          <div class="bg-red-50 rounded-xl p-4 text-center border border-red-200">
            <div class="text-2xl font-bold text-red-700">{{ resumen.resumen.rechazados }}</div>
            <div class="text-sm text-ink-muted">Rechazados</div>
          </div>
          <div class="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
            <div class="text-2xl font-bold text-purple-700">{{ resumen.resumen.cuposDisponibles }}</div>
            <div class="text-sm text-ink-muted">Cupos libres</div>
          </div>
        </div>

        <div class="bg-surface rounded-xl shadow-lg p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 class="text-2xl font-bold text-ink">{{ resumen.taller.tipo }}</h2>
              <p class="text-sm text-ink-muted">{{ textoHorario(resumen.taller) }}</p>
            </div>
            <button (click)="exportarReporte()"
                    class="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900">
              Descargar reporte
            </button>
          </div>

          <!-- Solicitudes pendientes -->
          <h3 class="text-lg font-semibold text-amber-800 mb-3">Solicitudes pendientes (revisar y responder)</h3>
          @if (pendientes.length === 0) {
            <p class="text-ink-muted py-4 bg-page rounded-lg text-center mb-6">No hay solicitudes pendientes</p>
          } @else {
            <ul class="space-y-3 mb-8">
              @for (s of pendientes; track s.id) {
                <li class="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <span class="font-semibold text-ink">{{ priv.alumno(s.alumno).nombre }}</span>
                    <span class="text-sm text-ink-muted ml-2">({{ priv.alumno(s.alumno).rut }})</span>
                    <p class="text-xs text-ink-muted mt-1">Solicitud #{{ s.id }}</p>
                    @if (auth.canVerDatosAntropometricosAlumno()) {
                      <p class="text-xs text-ink-muted mt-2">
                        Ficha: {{ textoFicha(s) }}
                      </p>
                    }
                  </div>
                  <div class="flex gap-2">
                    <button (click)="responder(s.id, 'ACEPTADO')"
                            [disabled]="resumen.resumen.cuposDisponibles <= 0"
                            class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                      Aceptar
                    </button>
                    <button (click)="responder(s.id, 'RECHAZADO')"
                            class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                      Rechazar
                    </button>
                  </div>
                </li>
              }
            </ul>
          }

          <!-- Fichas de alumnos por taller -->
          @if (auth.canVerDatosAntropometricosAlumno()) {
          <h3 class="text-lg font-semibold text-ink mb-3">Fichas de alumnos (por taller)</h3>

          <div class="md:hidden space-y-3 mb-8">
            @for (s of resumen.inscripciones; track s.id) {
              <article class="border border-line rounded-lg p-4 bg-page space-y-2 text-sm">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="font-semibold text-ink break-words">{{ priv.alumno(s.alumno).nombre }}</p>
                    <p class="text-ink-muted">RUT {{ priv.alumno(s.alumno).rut }}</p>
                  </div>
                  <span class="px-2 py-1 rounded-full text-xs font-bold shrink-0"
                        [class.bg-amber-200]="s.estado === 'PENDIENTE'"
                        [class.text-amber-800]="s.estado === 'PENDIENTE'"
                        [class.bg-green-200]="s.estado === 'ACEPTADO'"
                        [class.text-green-800]="s.estado === 'ACEPTADO'"
                        [class.bg-red-200]="s.estado === 'RECHAZADO'"
                        [class.text-red-800]="s.estado === 'RECHAZADO'">
                    {{ s.estado }}
                  </span>
                </div>
                <dl class="grid grid-cols-2 gap-2 text-sm border-t border-line/60 pt-2">
                  <div><dt class="text-ink-muted text-xs">Altura</dt><dd>{{ s.altura != null ? s.altura + ' cm' : '—' }}</dd></div>
                  <div><dt class="text-ink-muted text-xs">Peso</dt><dd>{{ s.peso != null ? s.peso + ' kg' : '—' }}</dd></div>
                  <div><dt class="text-ink-muted text-xs">% Grasa</dt><dd>{{ s.porcentajeGrasa != null ? s.porcentajeGrasa + '%' : '—' }}</dd></div>
                  <div>
                    <dt class="text-ink-muted text-xs">Sedentario</dt>
                    <dd>
                      @if (s.sedentario === true) { Sí }
                      @else if (s.sedentario === false) { No }
                      @else { — }
                    </dd>
                  </div>
                </dl>
                <button type="button" (click)="abrirEditarFicha(s)"
                        class="text-primary-600 hover:underline text-sm font-medium">
                  Editar ficha
                </button>
              </article>
            }
          </div>

          <div class="hidden md:block overflow-x-auto mb-8">
            <table class="w-full text-sm border border-line rounded-lg overflow-hidden">
              <thead class="bg-muted">
                <tr>
                  <th class="text-left p-3">Alumno</th>
                  <th class="text-left p-3">RUT</th>
                  <th class="text-left p-3">Altura</th>
                  <th class="text-left p-3">Peso</th>
                  <th class="text-left p-3">% Grasa</th>
                  <th class="text-left p-3">Sedentario</th>
                  <th class="text-left p-3">Estado</th>
                  <th class="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (s of resumen.inscripciones; track s.id) {
                  <tr class="border-t border-line hover:bg-page">
                    <td class="p-3 font-medium">{{ priv.alumno(s.alumno).nombre }}</td>
                    <td class="p-3">{{ priv.alumno(s.alumno).rut }}</td>
                    <td class="p-3">{{ s.altura != null ? s.altura + ' cm' : '—' }}</td>
                    <td class="p-3">{{ s.peso != null ? s.peso + ' kg' : '—' }}</td>
                    <td class="p-3">{{ s.porcentajeGrasa != null ? s.porcentajeGrasa + '%' : '—' }}</td>
                    <td class="p-3">
                      @if (s.sedentario === true) { Sí }
                      @else if (s.sedentario === false) { No }
                      @else { — }
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-1 rounded-full text-xs font-bold"
                            [class.bg-amber-200]="s.estado === 'PENDIENTE'"
                            [class.text-amber-800]="s.estado === 'PENDIENTE'"
                            [class.bg-green-200]="s.estado === 'ACEPTADO'"
                            [class.text-green-800]="s.estado === 'ACEPTADO'"
                            [class.bg-red-200]="s.estado === 'RECHAZADO'"
                            [class.text-red-800]="s.estado === 'RECHAZADO'">
                        {{ s.estado }}
                      </span>
                    </td>
                    <td class="p-3">
                      <button (click)="abrirEditarFicha(s)"
                              class="text-primary-600 hover:underline text-xs">
                        Editar ficha
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          } @else {
            <p class="text-sm text-ink-muted mb-8 italic">
              Los datos físicos de las fichas solo están disponibles para el profesor del taller.
            </p>
          }
        </div>
      }

      @if (fichaEditando && auth.canVerDatosAntropometricosAlumno()) {
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div class="bg-surface rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 class="text-xl font-bold text-ink mb-1">Editar ficha</h3>
            <p class="text-sm text-ink-muted mb-4">{{ priv.alumno(fichaEditando.alumno).nombre }} — {{ resumen?.taller?.tipo }}</p>
            <div class="grid grid-cols-2 gap-3 text-sm mb-4">
              <label class="block">
                <span class="text-ink-secondary">Altura (cm)</span>
                <input type="number" [(ngModel)]="fichaForm.altura" min="50" max="250" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-ink-secondary">Peso (kg)</span>
                <input type="number" [(ngModel)]="fichaForm.peso" min="20" max="300" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-ink-secondary">% grasa</span>
                <input type="number" [(ngModel)]="fichaForm.porcentajeGrasa" min="1" max="60" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-ink-secondary">Sedentario</span>
                <select [(ngModel)]="fichaForm.sedentario" class="mt-1 w-full border rounded-lg px-2 py-1.5">
                  <option [ngValue]="true">Sí</option>
                  <option [ngValue]="false">No</option>
                </select>
              </label>
            </div>
            <div class="flex gap-3 justify-end">
              <button (click)="cerrarEditarFicha()" class="px-4 py-2 rounded-lg border border-line-strong">Cancelar</button>
              <button (click)="guardarFicha()" class="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Guardar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class GestionInscripcionesComponent implements OnInit {
  /** Cliente HTTP: resumen, responder inscripción, ficha. */
  private api = inject(ApiService);
  /** Profesor (su taller) o coordinación (elige taller). */
  auth = inject(AuthRoleService);
  /** Enmascara nombre/RUT en listados. */
  priv = inject(AlumnoPrivacidadService);

  /** Talleres disponibles en el select (coordinación). */
  talleres: any[] = [];
  /** Taller cuyo resumen se está gestionando. */
  tallerIdSeleccionado: number | null = null;
  /** Respuesta API: capacidad, inscripciones, fichas. */
  resumen: any = null;
  /** Mensaje de error de carga o guardado. */
  error = '';
  /** Inscripción cuya ficha se edita en el modal (null = cerrado). */
  fichaEditando: any = null;
  /** Campos del modal de ficha física. */
  fichaForm = { altura: null as number | null, peso: null as number | null, porcentajeGrasa: null as number | null, sedentario: false };

  /** Solicitudes en estado PENDIENTE (filtro del resumen). */
  get pendientes() {
    return this.resumen?.inscripciones?.filter((s: any) => s.estado === 'PENDIENTE') ?? [];
  }

  /** Preselecciona el taller del profesor o carga listado para coordinación. */
  ngOnInit() {
    if (this.auth.isProfesor() && this.auth.currentTallerId()) {
      this.tallerIdSeleccionado = this.auth.currentTallerId();
      this.cargarResumen();
    }
    if (this.auth.isCoordinacion()) {
      this.api.getTalleres().subscribe({
        next: (data) => this.talleres = data,
        error: () => this.talleres = []
      });
    }
  }

  /** Carga el resumen de inscripciones (capacidad, pendientes, fichas) del taller seleccionado. */
  cargarResumen() {
    if (!this.tallerIdSeleccionado) return;
    this.api.getResumenInscripcionesTaller(
      this.tallerIdSeleccionado,
      !this.auth.canVerDatosAntropometricosAlumno(),
    ).subscribe({
      next: (data) => {
        this.resumen = data;
        this.error = '';
      },
      error: (err) => {
        this.resumen = null;
        this.error = err?.error?.message || 'Error al cargar inscripciones';
      }
    });
  }

  /** Acepta o rechaza una solicitud de inscripción pendiente. */
  responder(id: number, estado: 'ACEPTADO' | 'RECHAZADO') {
    this.api.responderInscripcionTaller(id, estado).subscribe({
      next: () => this.cargarResumen(),
      error: (err) => alert(err?.error?.message || 'No se pudo responder la solicitud')
    });
  }

  /** Resume en texto los datos de ficha física de una solicitud. */
  textoFicha(s: any): string {
    if (s.altura == null && s.peso == null) return 'Sin datos';
    const sed = s.sedentario === true ? 'sedentario' : s.sedentario === false ? 'activo' : '—';
    return `${s.altura ?? '—'} cm · ${s.peso ?? '—'} kg · ${s.porcentajeGrasa ?? '—'}% grasa · ${sed}`;
  }

  /** Abre el modal de edición de ficha física de un alumno inscrito. */
  abrirEditarFicha(s: any) {
    this.fichaEditando = s;
    this.fichaForm = {
      altura: s.altura != null ? Number(s.altura) : null,
      peso: s.peso != null ? Number(s.peso) : null,
      porcentajeGrasa: s.porcentajeGrasa != null ? Number(s.porcentajeGrasa) : null,
      sedentario: s.sedentario ?? false,
    };
  }

  /** Cierra el modal de edición de ficha sin guardar cambios. */
  cerrarEditarFicha() {
    this.fichaEditando = null;
  }

  /** Persiste la ficha física editada de un alumno inscrito. */
  guardarFicha() {
    if (!this.fichaEditando) return;
    this.api.actualizarFichaInscripcion(this.fichaEditando.id, {
      altura: this.fichaForm.altura != null ? Number(this.fichaForm.altura) : undefined,
      peso: this.fichaForm.peso != null ? Number(this.fichaForm.peso) : undefined,
      porcentajeGrasa: this.fichaForm.porcentajeGrasa != null ? Number(this.fichaForm.porcentajeGrasa) : undefined,
      sedentario: this.fichaForm.sedentario,
    }).subscribe({
      next: () => {
        this.cerrarEditarFicha();
        this.cargarResumen();
      },
      error: (err) => alert(err?.error?.message || 'No se pudo guardar la ficha'),
    });
  }

  /** Formatea el horario del taller para mostrar en el encabezado. */
  textoHorario(taller: any): string {
    if (!taller?.diaSemana || !taller?.horaInicio || !taller?.horaFin) {
      return 'Horario por confirmar';
    }
    const dia = DIAS_SEMANA[taller.diaSemana] ?? `Día ${taller.diaSemana}`;
    return `${dia} ${String(taller.horaInicio).slice(0, 5)} - ${String(taller.horaFin).slice(0, 5)}`;
  }

  /** Genera y descarga un reporte PDF con todas las inscripciones del taller. */
  exportarReporte() {
    if (!this.resumen) return;
    descargarPdfReporteInscripciones({
      tallerTipo: this.resumen.taller.tipo,
      capacidad: this.resumen.resumen.capacidad,
      aceptados: this.resumen.resumen.aceptados,
      pendientes: this.resumen.resumen.pendientes,
      rechazados: this.resumen.resumen.rechazados,
      cuposDisponibles: this.resumen.resumen.cuposDisponibles,
      filas: this.resumen.inscripciones.map((s: any) => {
        const a = this.priv.alumno(s.alumno);
        const base = {
          nombre: a.nombre,
          rut: a.rut,
          estado: s.estado,
          fecha: s.createdAt ? String(s.createdAt).slice(0, 10) : '',
        };
        if (!this.auth.canVerDatosAntropometricosAlumno()) {
          return { ...base, altura: '', peso: '', porcentajeGrasa: '', sedentario: '' };
        }
        return {
          ...base,
          altura: s.altura != null ? String(s.altura) : '',
          peso: s.peso != null ? String(s.peso) : '',
          porcentajeGrasa: s.porcentajeGrasa != null ? String(s.porcentajeGrasa) : '',
          sedentario: s.sedentario === true ? 'Sí' : s.sedentario === false ? 'No' : '',
        };
      }),
    });
  }
}
