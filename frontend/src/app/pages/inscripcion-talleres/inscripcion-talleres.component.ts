/**
 * =============================================================================
 * app/pages/inscripcion-talleres/inscripcion-talleres.component.ts — Inscripción talleres
 * =============================================================================
 * Catálogo publicado e inscripción para estudiantes: validación de cupos/horarios,
 * ficha física y seguimiento de solicitudes (pendiente/aceptado/rechazado).
 * Rol: alumno — canInscribirseTalleres().
 * Endpoints ApiService: getCatalogoTalleres, validarInscripcionTaller,
 * getInscripcionesTallerPorAlumno, solicitarInscripcionTaller, retirarseDeTaller
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Taller } from '../../models/taller.model';
import { HorariosTallerComponent } from '../../shared/components/horarios-taller/horarios-taller.component';
import {
  AdvertenciasInscripcionComponent,
  tallerSinProfesor,
} from '../../shared/components/advertencias-inscripcion/advertencias-inscripcion.component';
import { ValidacionInscripcionTaller } from '../../models/inscripcion-taller.model';
import { requiereFichaFisica } from '../../shared/utils/taller-categoria.util';
import {
  horariosOrdenados,
  textoFilaHorario,
  textoHorarioTaller,
  TallerConHorarios,
  TallerHorarioItem,
} from '../../shared/utils/horario-taller.util';

interface InscripcionTaller {
  id: number;
  alumnoId: number;
  tallerId: number;
  estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  taller?: { id: number; tipo: string; descripcion: string };
}

@Component({
  selector: 'app-inscripcion-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HorariosTallerComponent, AdvertenciasInscripcionComponent],
  template: `
    <div class="space-y-6">
      <div class="bg-surface rounded-lg shadow p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Inscripción en Talleres</h1>
        <p class="text-ink-muted">
          Explora el catálogo, inscríbete en un taller o envía propuestas a la directiva
          (actividades del catálogo o nuevas, por ejemplo un taller que aún no existe).
        </p>
      </div>

      @if (auth.canInscribirseTalleres()) {
        <div class="bg-surface rounded-xl shadow-lg p-6 border-2 border-primary-200">
          <h2 class="text-2xl font-bold text-ink mb-1">Estado de tus solicitudes</h2>
          <p class="text-ink-muted text-sm mb-4">Aquí ves si fuiste <strong>aceptado</strong> o <strong>rechazado</strong> en cada taller.</p>
          @if (!alumnoId) {
            <p class="text-amber-700 bg-amber-50 py-3 px-4 rounded-lg">
              Inicia sesión como estudiante eligiendo tu nombre en /login.
            </p>
          } @else if (misSolicitudes.length === 0) {
            <p class="text-ink-muted py-2">Aún no has enviado solicitudes. Elige un taller abajo.</p>
          } @else {
            <ul class="space-y-3">
              @for (s of misSolicitudes; track s.id) {
                <li class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-4 rounded-lg border-2"
                    [class.bg-amber-50]="s.estado === 'PENDIENTE'"
                    [class.border-amber-300]="s.estado === 'PENDIENTE'"
                    [class.bg-green-50]="s.estado === 'ACEPTADO'"
                    [class.border-green-300]="s.estado === 'ACEPTADO'"
                    [class.bg-red-50]="s.estado === 'RECHAZADO'"
                    [class.border-red-300]="s.estado === 'RECHAZADO'">
                  <span class="font-semibold text-ink">{{ nombreTaller(s) }}</span>
                  <span class="text-base font-bold px-3 py-1 rounded-full shrink-0"
                        [class.text-amber-800]="s.estado === 'PENDIENTE'"
                        [class.bg-amber-200]="s.estado === 'PENDIENTE'"
                        [class.text-green-800]="s.estado === 'ACEPTADO'"
                        [class.bg-green-200]="s.estado === 'ACEPTADO'"
                        [class.text-red-800]="s.estado === 'RECHAZADO'"
                        [class.bg-red-200]="s.estado === 'RECHAZADO'">
                    {{ s.estado === 'PENDIENTE' ? 'Pendiente' : s.estado === 'ACEPTADO' ? 'Aceptado' : 'Rechazado' }}
                  </span>
                  @if (s.estado === 'PENDIENTE' || s.estado === 'ACEPTADO') {
                    <button (click)="abrirConfirmacionRetiro(s)"
                            [disabled]="retirando === s.id"
                            class="text-sm text-red-700 border border-red-300 bg-white px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 shrink-0">
                      {{ retirando === s.id ? 'Retirando...' : 'Retirarme' }}
                    </button>
                  }
                </li>
              }
            </ul>
          }
        </div>
      }

      <div class="bg-surface rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold mb-4 text-ink">Catálogo de actividades publicadas</h2>
        <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          @for (taller of talleres; track taller.id) {
            <div class="border rounded-lg overflow-hidden flex flex-col hover:shadow-md transition">
              @if (taller.imagenUrl) {
                <img [src]="taller.imagenUrl" [alt]="taller.tipo"
                     class="w-full h-40 object-cover border-b border-line" loading="lazy" />
              } @else {
                <div class="w-full h-40 bg-muted flex items-center justify-center text-ink-muted text-sm border-b border-line">
                  Sin imagen
                </div>
              }
              <div class="p-4 flex flex-col flex-1">
              <h3 class="font-semibold text-ink text-lg">{{ taller.tipo }}</h3>
              @if (tallerSinProfesor(taller)) {
                <p class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mt-1 inline-block">
                  Sin profesor asignado aún
                </p>
              }
              <p class="text-sm text-ink-muted mt-1 flex-1">{{ taller.descripcion }}</p>
              <app-horarios-taller [taller]="taller" [mostrarTitulo]="true" />
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                <span class="text-sm text-ink-muted">
                  Cupos: {{ cuposPorTaller[taller.id]?.cuposDisponibles ?? '—' }} / {{ taller.capacidad }}
                </span>
                @if (auth.canInscribirseTalleres() && alumnoId) {
                  <div class="flex flex-wrap items-center justify-end gap-2">
                    @if (estadoSolicitud(taller.id) === 'PENDIENTE') {
                      <span class="text-sm text-amber-600 font-medium">Solicitud enviada</span>
                      <button (click)="abrirConfirmacionRetiroPorTaller(taller.id)"
                              [disabled]="retirando === solicitudId(taller.id)"
                              class="text-sm text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
                        Cancelar solicitud
                      </button>
                    } @else if (estadoSolicitud(taller.id) === 'ACEPTADO') {
                      <span class="text-sm text-green-600 font-medium">Inscrito</span>
                      <button (click)="abrirConfirmacionRetiroPorTaller(taller.id)"
                              [disabled]="retirando === solicitudId(taller.id)"
                              class="text-sm text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
                        Retirarme
                      </button>
                    } @else if (estadoSolicitud(taller.id) === 'RECHAZADO') {
                      <button (click)="abrirConfirmacion(taller)"
                              class="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700">
                        Volver a solicitar
                      </button>
                    } @else {
                      <a [routerLink]="['/taller', taller.id]" class="text-sm text-primary-600 hover:underline mr-2">Ver detalle</a>
                      <button (click)="abrirConfirmacion(taller)"
                              [disabled]="enviando === taller.id"
                              class="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                        Inscribirse
                      </button>
                    }
                  </div>
                } @else {
                  <a [routerLink]="['/taller', taller.id]" class="text-primary-600 text-sm hover:underline">Ver detalle</a>
                }
              </div>
              </div>
            </div>
          }
        </div>
        @if (talleres.length === 0) {
          <p class="text-ink-muted py-6 text-center">No hay actividades publicadas en el catálogo</p>
        }
      </div>

      @if (auth.canInscribirseTalleres() && alumnoId) {
        @if (misPropuestas.length > 0) {
          <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
            <h2 class="font-bold text-ink mb-3">Mis propuestas a la directiva</h2>
            <ul class="space-y-3">
              @for (p of misPropuestas; track p.id) {
                <li class="border border-line/60 rounded-lg p-3 text-sm">
                  <div class="flex flex-wrap justify-between gap-2">
                    <p class="font-medium text-ink">{{ p.tallerNombre }}</p>
                    <span [class]="estadoPropuestaClass(p.estado)">{{ estadoPropuestaLabel(p.estado) }}</span>
                  </div>
                  @if (p.esActividadLibre) {
                    <p class="text-xs text-violet-700 mt-1">Fuera de catálogo</p>
                  }
                  @if (p.horarioPropuesto) {
                    <p class="text-ink-muted mt-1">Horario propuesto: {{ p.horarioPropuesto }}</p>
                  }
                  @if (p.estado === 'RECHAZADA' && p.motivoRechazo) {
                    <p class="text-red-700 mt-1">Motivo: {{ p.motivoRechazo }}</p>
                  }
                </li>
              }
            </ul>
          </section>
        }

        <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
          <h2 class="font-bold text-ink mb-3">Proponer inscripción a la directiva</h2>
          <p class="text-sm text-ink-muted mb-4">
            Elige una actividad del catálogo e indica el horario que prefieres. La propuesta llegará a la directiva para su revisión.
          </p>
          @if (talleres.length === 0) {
            <p class="text-ink-muted text-sm">No hay actividades publicadas disponibles.</p>
          } @else {
            <ul class="space-y-2">
              @for (t of talleres; track t.id) {
                <li class="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-line/60 last:border-0">
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-ink">{{ t.tipo }}</p>
                    <p class="text-xs text-ink-muted line-clamp-1">{{ t.descripcion }}</p>
                    <p class="text-xs text-ink-secondary mt-0.5">{{ horarioTaller(t) }}</p>
                  </div>
                  @if (propuestaPendiente(t.id)) {
                    <span class="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Propuesta pendiente</span>
                  } @else {
                    <button (click)="abrirModalPropuesta(t)" [disabled]="proponiendo === t.id"
                            class="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 shrink-0">
                      {{ proponiendo === t.id ? 'Enviando…' : 'Proponer' }}
                    </button>
                  }
                </li>
              }
            </ul>
          }
        </section>

        <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
          <h2 class="font-bold text-ink mb-3">Proponer otra actividad (fuera del catálogo)</h2>
          <p class="text-sm text-ink-muted mb-4">
            Si la actividad que buscas no está en la lista, puedes proponerla aquí con nombre, horario y una breve descripción.
            La propuesta llega a la directiva.
          </p>
          <div class="space-y-3 max-w-lg">
            <div>
              <label class="block text-sm font-medium text-ink mb-1">Nombre de la actividad *</label>
              <input type="text" [(ngModel)]="actividadLibreNombre"
                     class="w-full border border-line rounded-lg px-3 py-2 text-sm"
                     placeholder="Ej.: Ajedrez, Danza contemporánea" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink mb-1">Descripción (opcional)</label>
              <textarea [(ngModel)]="actividadLibreDescripcion" rows="2"
                        class="w-full border border-line rounded-lg px-3 py-2 text-sm"
                        placeholder="Ej.: Taller de estrategia para estudiantes de enseñanza media"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-ink mb-1">Horario propuesto *</label>
              <input type="text" [(ngModel)]="actividadLibreHorario"
                     class="w-full border border-line rounded-lg px-3 py-2 text-sm"
                     placeholder="Ej.: Jueves 17:00 - 18:30" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink mb-1">Mensaje para la directiva (opcional)</label>
              <textarea [(ngModel)]="actividadLibreMensaje" rows="2"
                        class="w-full border border-line rounded-lg px-3 py-2 text-sm"
                        placeholder="Ej.: Tengo experiencia previa en esta actividad"></textarea>
            </div>
            <button type="button" (click)="enviarActividadLibre()"
                    [disabled]="!puedeEnviarActividadLibre() || enviandoLibre"
                    class="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {{ enviandoLibre ? 'Enviando…' : 'Enviar propuesta a la directiva' }}
            </button>
          </div>
        </section>
      }
    </div>

    @if (modalPropuestaTaller) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" (click)="cerrarModalPropuesta()">
        <div class="bg-surface rounded-xl shadow-xl max-w-md w-full p-5 border border-line"
             (click)="$event.stopPropagation()">
          <h3 class="text-lg font-bold text-ink mb-1">Proponer {{ modalPropuestaTaller.tipo }}</h3>
          <p class="text-sm text-ink-muted mb-4">
            Escribe el horario que prefieres. Si la actividad tiene horarios publicados, puedes usarlos como referencia o modificar el texto.
          </p>

          @if (opcionesModalPropuesta.length > 0) {
            <label class="block text-sm font-medium text-ink mb-1">Horarios publicados (referencia)</label>
            <select [(ngModel)]="horarioSeleccionadoId" (ngModelChange)="aplicarHorarioCatalogo($event)"
                    class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3">
              <option [ngValue]="null">— Escribir horario manualmente —</option>
              @for (h of opcionesModalPropuesta; track h.id ?? h.etiqueta) {
                <option [ngValue]="h.id">{{ h.etiqueta }}</option>
              }
            </select>
          }

          <label class="block text-sm font-medium text-ink mb-1">Horario propuesto *</label>
          <input type="text" [(ngModel)]="horarioLibre"
                 class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
                 placeholder="Ej.: Martes 16:00 - 17:30" />

          <label class="block text-sm font-medium text-ink mb-1">Mensaje para la directiva (opcional)</label>
          <textarea [(ngModel)]="mensajePropuesta" rows="3"
                    class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-4"
                    placeholder="Ej.: Prefiero este horario por compromisos escolares"></textarea>

          <div class="flex justify-end gap-2">
            <button type="button" (click)="cerrarModalPropuesta()"
                    class="px-4 py-2 text-sm rounded-lg border border-line hover:bg-muted">
              Cancelar
            </button>
            <button type="button" (click)="confirmarPropuesta()" [disabled]="!puedeEnviarPropuesta()"
                    class="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
              Enviar propuesta
            </button>
          </div>
        </div>
      </div>
    }

    @if (tallerConfirmando) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-ink mb-2">Confirmar inscripción</h3>
          <p class="text-ink-muted mb-4">¿Deseas inscribirte en <strong>{{ tallerConfirmando.tipo }}</strong>?</p>

          <app-advertencias-inscripcion [advertencias]="validacionActual?.advertencias" />

          <div class="bg-page rounded-lg p-4 text-sm space-y-2 mb-4">
            <app-horarios-taller *ngIf="tallerConfirmando" [taller]="tallerConfirmando" [mostrarTitulo]="false" />
            @if (validacionActual) {
              <p><strong>Cupos disponibles:</strong> {{ validacionActual.cuposDisponibles }} de {{ validacionActual.capacidad }}</p>
            }
          </div>

          @if (pideFichaFisica(tallerConfirmando)) {
          <div class="border border-primary-200 bg-primary-50 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-ink mb-2">Ficha del alumno</h4>
            @if (fichaReutilizada) {
              <p class="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2 mb-3">
                Se reutilizaron tus datos físicos de un taller deportivo anterior. Puedes corregirlos si cambiaron.
              </p>
            } @else {
              <p class="text-xs text-ink-muted mb-3">Completa tus datos físicos. El profesor los verá al revisar tu solicitud.</p>
            }
            <div class="grid grid-cols-2 gap-3 text-sm">
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
                <span class="text-ink-secondary">% grasa corporal</span>
                <input type="number" [(ngModel)]="fichaForm.porcentajeGrasa" min="1" max="60" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-ink-secondary">¿Sedentario?</span>
                <select [(ngModel)]="fichaForm.sedentario" class="mt-1 w-full border rounded-lg px-2 py-1.5">
                  <option [ngValue]="true">Sí</option>
                  <option [ngValue]="false">No</option>
                </select>
              </label>
            </div>
          </div>
          }

          @if (errorConfirmacion) {
            <p class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{{ errorConfirmacion }}</p>
          }

          <div class="flex gap-3 justify-end">
            <button (click)="cerrarConfirmacion()" class="px-4 py-2 rounded-lg border border-line-strong text-ink-secondary hover:bg-page">
              Cancelar
            </button>
            <button (click)="confirmarInscripcion()"
                    [disabled]="!validacionActual?.puedeInscribirse || confirmando || !fichaValida()"
                    class="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
              {{ confirmando ? 'Enviando...' : 'Confirmar inscripción' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (solicitudRetirando) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-ink mb-2">Confirmar retiro</h3>
          <p class="text-ink-muted mb-4">
            ¿Estás seguro de que deseas retirarte de <strong>{{ nombreTaller(solicitudRetirando) }}</strong>?
            @if (solicitudRetirando.estado === 'ACEPTADO') {
              <span class="block mt-2 text-amber-800">Perderás tu cupo en el taller y el profesor será notificado.</span>
            } @else {
              <span class="block mt-2 text-amber-800">Se cancelará tu solicitud pendiente y el profesor será notificado.</span>
            }
          </p>
          @if (errorRetiro) {
            <p class="text-red-600 text-sm mb-3">{{ errorRetiro }}</p>
          }
          <div class="flex gap-3 justify-end">
            <button (click)="cerrarConfirmacionRetiro()" class="px-4 py-2 rounded-lg border border-line-strong text-ink-secondary hover:bg-page">
              Cancelar
            </button>
            <button (click)="confirmarRetiro()"
                    [disabled]="retirando !== null"
                    class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
              {{ retirando !== null ? 'Retirando...' : 'Sí, retirarme' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class InscripcionTalleresComponent implements OnInit {
  /** Cliente HTTP: catálogo, validar, inscribir, retirar. */
  private apiService = inject(ApiService);
  /** Id del alumno logueado. */
  auth = inject(AuthRoleService);

  /** Catálogo de talleres publicados. */
  talleres: Taller[] = [];
  /** Solicitudes previas del alumno (cualquier estado). */
  misSolicitudes: InscripcionTaller[] = [];
  /** Resultado de validarInscripcionTaller por tallerId. */
  cuposPorTaller: Record<number, ValidacionInscripcionTaller> = {};
  /** Id del alumno en sesión. */
  alumnoId: number | null = null;
  /** Id del taller mientras se envía la solicitud (spinner). */
  enviando: number | null = null;

  /** Taller abierto en el modal de confirmación + ficha. */
  tallerConfirmando: Taller | null = null;
  /** Validación del taller que se está confirmando. */
  validacionActual: ValidacionInscripcionTaller | null = null;
  /** Error al confirmar inscripción. */
  errorConfirmacion = '';
  /** true mientras POST de inscripción está en curso. */
  confirmando = false;
  /** Ficha física obligatoria al inscribirse. */
  fichaForm = { altura: null as number | null, peso: null as number | null, porcentajeGrasa: null as number | null, sedentario: false };
  /** true si se precargó ficha de otro taller deportivo. */
  fichaReutilizada = false;

  /** Solicitud abierta en el modal de retiro. */
  solicitudRetirando: InscripcionTaller | null = null;
  /** Id de solicitud mientras se retira. */
  retirando: number | null = null;
  /** Error al retirar inscripción. */
  errorRetiro = '';

  /** Formulario de actividad libre para la directiva. */
  actividadLibreNombre = '';
  actividadLibreDescripcion = '';
  actividadLibreHorario = '';
  actividadLibreMensaje = '';
  enviandoLibre = false;
  misPropuestas: any[] = [];

  /** Modal de propuesta de taller del catálogo a la directiva. */
  modalPropuestaTaller: Taller | null = null;
  opcionesModalPropuesta: { id: number | null; etiqueta: string }[] = [];
  horarioSeleccionadoId: number | null = null;
  horarioLibre = '';
  mensajePropuesta = '';
  proponiendo: number | null = null;

  /** Helper de advertencia: taller sin docente asignado. */
  readonly tallerSinProfesor = tallerSinProfesor;

  /** Carga catálogo y solicitudes previas del alumno logueado. */
  ngOnInit() {
    this.cargarTalleres();
    this.alumnoId = this.auth.currentUserId();
    if (this.alumnoId) {
      this.cargarMisSolicitudes();
      this.cargarMisPropuestas();
    }
  }

  /** Obtiene el catálogo de talleres publicados y dispara carga de cupos. */
  cargarTalleres() {
    this.apiService.getCatalogoTalleres().subscribe({
      next: (data) => {
        this.talleres = data;
        this.cargarCupos();
      },
      error: (err) => console.error('Error cargando catálogo:', err)
    });
  }

  /** Valida cupos y conflictos de horario para cada taller del catálogo. */
  cargarCupos() {
    if (!this.alumnoId) return;
    for (const taller of this.talleres) {
      this.apiService.validarInscripcionTaller(this.alumnoId, taller.id).subscribe({
        next: (v) => this.cuposPorTaller[taller.id] = v,
        error: () => {}
      });
    }
  }

  /** Recupera las solicitudes de inscripción previas del alumno logueado. */
  cargarMisSolicitudes() {
    if (!this.alumnoId) return;
    this.apiService.getInscripcionesTallerPorAlumno(this.alumnoId).subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.misSolicitudes = list.map((s: any) => ({
          ...s,
          estado: String(s.estado || '').toUpperCase() as 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'
        }));
        this.cargarCupos();
      },
      error: () => this.misSolicitudes = []
    });
  }

  estadoSolicitud(tallerId: number): 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' | null {
    const s = this.misSolicitudes.find(x => x.tallerId === tallerId || x.taller?.id === tallerId);
    return s ? s.estado : null;
  }

  solicitudId(tallerId: number): number | null {
    const s = this.misSolicitudes.find(x => x.tallerId === tallerId || x.taller?.id === tallerId);
    return s?.id ?? null;
  }

  abrirConfirmacionRetiro(solicitud: InscripcionTaller) {
    this.solicitudRetirando = solicitud;
    this.errorRetiro = '';
  }

  abrirConfirmacionRetiroPorTaller(tallerId: number) {
    const s = this.misSolicitudes.find(x => x.tallerId === tallerId || x.taller?.id === tallerId);
    if (s) this.abrirConfirmacionRetiro(s);
  }

  cerrarConfirmacionRetiro() {
    this.solicitudRetirando = null;
    this.errorRetiro = '';
    this.retirando = null;
  }

  /** Ejecuta el retiro o cancelación de una solicitud/inscripción activa. */
  confirmarRetiro() {
    if (!this.solicitudRetirando || !this.alumnoId) return;
    this.retirando = this.solicitudRetirando.id;
    this.errorRetiro = '';
    this.apiService.retirarseDeTaller(this.solicitudRetirando.id, this.alumnoId).subscribe({
      next: () => {
        this.cerrarConfirmacionRetiro();
        this.cargarMisSolicitudes();
        this.cargarCupos();
      },
      error: (err) => {
        this.retirando = null;
        this.errorRetiro = err?.error?.message || 'No se pudo completar el retiro';
      },
    });
  }

  nombreTaller(s: InscripcionTaller): string {
    return s.taller?.tipo ?? `Taller #${s.tallerId}`;
  }

  /** Abre el modal de confirmación y valida cupos/horarios antes de inscribirse. */
  abrirConfirmacion(taller: Taller) {
    if (!this.alumnoId) {
      alert('Inicia sesión como estudiante para inscribirte.');
      return;
    }
    this.tallerConfirmando = taller;
    this.validacionActual = null;
    this.errorConfirmacion = '';
    this.fichaForm = { altura: null, peso: null, porcentajeGrasa: null, sedentario: false };
    this.fichaReutilizada = false;

    if (this.pideFichaFisica(taller) && this.alumnoId) {
      this.apiService.getUltimaFichaAlumno(this.alumnoId).subscribe({
        next: (previa) => {
          if (!previa?.encontrada) return;
          this.fichaForm = {
            altura: Number(previa.altura),
            peso: Number(previa.peso),
            porcentajeGrasa: Number(previa.porcentajeGrasa),
            sedentario: !!previa.sedentario,
          };
          this.fichaReutilizada = true;
        },
      });
    }

    this.apiService.validarInscripcionTaller(this.alumnoId, taller.id, true).subscribe({
      next: (v) => {
        this.validacionActual = v;
        if (!v.puedeInscribirse) {
          this.errorConfirmacion = v.motivo ?? 'No puedes inscribirte en este taller';
        }
      },
      error: (err) => {
        this.errorConfirmacion = err?.error?.message || 'No se pudo validar la inscripción';
      }
    });
  }

  cerrarConfirmacion() {
    this.tallerConfirmando = null;
    this.validacionActual = null;
    this.errorConfirmacion = '';
    this.confirmando = false;
    this.fichaReutilizada = false;
  }

  fichaValida(): boolean {
    if (!this.pideFichaFisica(this.tallerConfirmando)) return true;
    const { altura, peso, porcentajeGrasa } = this.fichaForm;
    return altura != null && altura >= 50 && altura <= 250
      && peso != null && peso >= 20 && peso <= 300
      && porcentajeGrasa != null && porcentajeGrasa >= 1 && porcentajeGrasa <= 60;
  }

  pideFichaFisica(taller: Taller | null | undefined): boolean {
    return !!taller && requiereFichaFisica(taller.tipo ?? '');
  }

  cargarMisPropuestas(): void {
    this.apiService.getMisPropuestasAlumno().subscribe({
      next: (p) => (this.misPropuestas = p ?? []),
      error: () => (this.misPropuestas = []),
    });
  }

  horarioTaller(t: TallerConHorarios): string {
    return textoHorarioTaller(t);
  }

  propuestaPendiente(tallerId: number): boolean {
    return this.misPropuestas.some((p) => p.tallerId === tallerId && p.estado === 'PENDIENTE');
  }

  abrirModalPropuesta(taller: Taller): void {
    this.modalPropuestaTaller = taller;
    this.mensajePropuesta = '';
    this.horarioLibre = '';
    const horarios = horariosOrdenados(taller);
    if (horarios.length > 0) {
      this.opcionesModalPropuesta = horarios.map((h: TallerHorarioItem) => ({
        id: h.id ?? null,
        etiqueta: textoFilaHorario(h),
      }));
    } else if (taller.diaSemana != null && taller.horaInicio && taller.horaFin) {
      this.opcionesModalPropuesta = [{ id: null, etiqueta: textoHorarioTaller(taller) }];
    } else {
      this.opcionesModalPropuesta = [];
    }
    if (this.opcionesModalPropuesta.length > 0) {
      const primero = this.opcionesModalPropuesta[0];
      this.horarioSeleccionadoId = primero.id;
      this.horarioLibre = primero.etiqueta;
    } else {
      this.horarioSeleccionadoId = null;
      this.horarioLibre = '';
    }
  }

  aplicarHorarioCatalogo(horarioId: number | null): void {
    if (horarioId == null) return;
    const opcion = this.opcionesModalPropuesta.find((h) => h.id === horarioId);
    if (opcion) this.horarioLibre = opcion.etiqueta;
  }

  cerrarModalPropuesta(): void {
    this.modalPropuestaTaller = null;
    this.opcionesModalPropuesta = [];
    this.horarioSeleccionadoId = null;
    this.horarioLibre = '';
    this.mensajePropuesta = '';
  }

  puedeEnviarPropuesta(): boolean {
    return !!this.modalPropuestaTaller && this.horarioLibre.trim().length > 0;
  }

  confirmarPropuesta(): void {
    if (!this.modalPropuestaTaller || !this.puedeEnviarPropuesta()) return;
    const tallerId = this.modalPropuestaTaller.id;
    this.proponiendo = tallerId;
    this.apiService
      .proponerInscripcionAlumno(tallerId, {
        tallerHorarioId: this.horarioSeleccionadoId ?? undefined,
        horarioPropuestoTexto: this.horarioLibre.trim(),
        mensajeApoderado: this.mensajePropuesta.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.proponiendo = null;
          this.cerrarModalPropuesta();
          alert('Propuesta enviada a la directiva con el horario indicado.');
          this.cargarMisPropuestas();
        },
        error: (err) => {
          this.proponiendo = null;
          alert(err?.error?.message || 'No se pudo enviar la propuesta');
        },
      });
  }

  puedeEnviarActividadLibre(): boolean {
    return this.actividadLibreNombre.trim().length >= 2 && this.actividadLibreHorario.trim().length >= 3;
  }

  enviarActividadLibre(): void {
    if (!this.puedeEnviarActividadLibre() || !this.alumnoId) return;
    this.enviandoLibre = true;
    this.apiService
      .proponerActividadLibreAlumno({
        actividadNombre: this.actividadLibreNombre.trim(),
        actividadDescripcion: this.actividadLibreDescripcion.trim() || undefined,
        horarioPropuestoTexto: this.actividadLibreHorario.trim(),
        mensajeApoderado: this.actividadLibreMensaje.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.enviandoLibre = false;
          this.actividadLibreNombre = '';
          this.actividadLibreDescripcion = '';
          this.actividadLibreHorario = '';
          this.actividadLibreMensaje = '';
          alert('Propuesta enviada a la directiva.');
          this.cargarMisPropuestas();
        },
        error: (err) => {
          this.enviandoLibre = false;
          alert(err?.error?.message || 'No se pudo enviar la propuesta');
        },
      });
  }

  estadoPropuestaLabel(estado: string): string {
    if (estado === 'PENDIENTE') return 'Pendiente';
    if (estado === 'ACEPTADA') return 'Aceptada';
    if (estado === 'RECHAZADA') return 'Rechazada';
    return estado;
  }

  estadoPropuestaClass(estado: string): string {
    if (estado === 'PENDIENTE') return 'text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded';
    if (estado === 'ACEPTADA') return 'text-xs text-green-800 bg-green-100 px-2 py-0.5 rounded';
    if (estado === 'RECHAZADA') return 'text-xs text-red-800 bg-red-100 px-2 py-0.5 rounded';
    return 'text-xs text-ink-muted';
  }

  /** Envía la solicitud de inscripción; ficha solo en talleres deportivos. */
  confirmarInscripcion() {
    if (!this.tallerConfirmando || !this.alumnoId || !this.validacionActual?.puedeInscribirse || !this.fichaValida()) return;
    this.confirmando = true;
    const ficha = this.pideFichaFisica(this.tallerConfirmando)
      ? {
          altura: Number(this.fichaForm.altura),
          peso: Number(this.fichaForm.peso),
          porcentajeGrasa: Number(this.fichaForm.porcentajeGrasa),
          sedentario: this.fichaForm.sedentario,
        }
      : null;
    this.apiService.solicitarInscripcionTaller(this.alumnoId, this.tallerConfirmando.id, ficha).subscribe({
      next: () => {
        this.confirmando = false;
        this.cerrarConfirmacion();
        this.cargarMisSolicitudes();
        alert('Solicitud registrada. Revisa tus notificaciones en el Dashboard.');
      },
      error: (err) => {
        this.confirmando = false;
        this.errorConfirmacion = err?.error?.message || 'No se pudo enviar la solicitud.';
        this.cargarMisSolicitudes();
      }
    });
  }
}
