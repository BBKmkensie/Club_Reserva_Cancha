/**
 * =============================================================================
 * app/pages/portal-apoderado/portal-apoderado.component.ts — Portal apoderado
 * =============================================================================
 * Vista exclusiva del apoderado: resumen del hijo/a, talleres inscritos (uno o más),
 * asistencia por taller y propuestas de inscripción a la directiva.
 * Rol: apoderado — canVerPortalApoderado().
 * Endpoints ApiService: getCatalogoTalleres, getMisPropuestasApoderado, getApoderadoResumen,
 * proponerActividadLibre, proponerInscripcionApoderado
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import {
  horariosOrdenados,
  textoFilaHorario,
  textoHorarioTaller,
  TallerConHorarios,
  TallerHorarioItem,
} from '../../shared/utils/horario-taller.util';

@Component({
  selector: 'app-portal-apoderado',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink">Portal del apoderado</h1>
          <p class="text-ink-muted text-sm mt-1">Asistencia e inscripción de su hijo/a</p>
        </div>
        <a routerLink="/dashboard" class="text-sm text-primary-500 hover:underline">← Volver</a>
      </div>

      @if (cargando) {
        <p class="text-ink-muted">Cargando información...</p>
      } @else if (error) {
        <p class="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">{{ error }}</p>
      } @else if (data) {
        <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
          <h2 class="font-bold text-ink mb-3">Su hijo/a</h2>
          <p class="text-lg font-semibold">{{ data.hijo.nombre }}</p>
          <p class="text-sm text-ink-muted">RUT: {{ data.hijo.rut }}</p>
        </section>

        @if (talleresInscritos.length > 1) {
          <div class="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900">
            <p class="font-semibold">
              {{ data.hijo.nombre }} está inscrito/a en {{ talleresInscritos.length }} talleres
            </p>
            <p class="mt-1 text-primary-800">
              {{ nombresTalleresInscritos }}. Más abajo puede ver la asistencia de cada uno.
            </p>
          </div>
        }

        <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
          <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h2 class="font-bold text-ink">
              {{ talleresInscritos.length > 1 ? 'Talleres en los que está inscrito/a' : 'Taller inscrito' }}
            </h2>
            @if (talleresInscritos.length > 0) {
              <span class="text-xs font-medium text-primary-700 bg-primary-50 px-2 py-1 rounded">
                {{ talleresInscritos.length }}
                {{ talleresInscritos.length === 1 ? 'taller' : 'talleres' }}
              </span>
            }
          </div>
          @if (talleresInscritos.length === 0) {
            <p class="text-ink-muted">Sin taller activo inscrito.</p>
          } @else {
            <ul class="space-y-3">
              @for (t of talleresInscritos; track t.id; let i = $index) {
                <li class="border border-line/60 rounded-lg p-3 flex flex-wrap items-start justify-between gap-2">
                  <div class="min-w-0">
                    @if (talleresInscritos.length > 1) {
                      <p class="text-xs text-ink-muted mb-0.5">Taller {{ i + 1 }} de {{ talleresInscritos.length }}</p>
                    }
                    <p class="font-semibold text-primary-600">{{ t.nombre }}</p>
                    @if (t.horario) {
                      <p class="text-sm text-ink-muted mt-1">{{ t.horario }}</p>
                    }
                  </div>
                  <button type="button" (click)="irAAsistencia(t.id)"
                          class="text-xs font-medium text-primary-700 hover:underline shrink-0">
                    Ver asistencia →
                  </button>
                </li>
              }
            </ul>
          }
        </section>

        @if (talleresInscritos.length > 0) {
          <section class="space-y-4">
            <h2 class="font-bold text-ink text-xl">Asistencia por taller</h2>
            <p class="text-sm text-ink-muted -mt-2">
              Detalle de sesiones cerradas de
              {{ talleresInscritos.length === 1 ? 'su taller' : 'cada taller en el que participa' }}.
            </p>
            @for (a of asistencias; track a.tallerId) {
              <div [attr.id]="'asistencia-taller-' + a.tallerId"
                   class="bg-surface rounded-xl border border-line p-5 shadow-sm scroll-mt-24">
                <h3 class="font-bold text-ink mb-3">{{ a.tallerNombre || 'Taller' }}</h3>
                <div class="flex flex-wrap gap-3 mb-4">
                  <span class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    Presente: {{ a.resumen.presentes }}
                  </span>
                  @if ((a.resumen.tardes ?? 0) > 0) {
                    <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-sm font-medium">
                      Tarde: {{ a.resumen.tardes }}
                    </span>
                  }
                  <span class="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                    Ausente: {{ a.resumen.ausentes }}
                  </span>
                  <span class="px-3 py-1 rounded-full bg-muted text-ink-secondary text-sm font-medium">
                    Asistencia: {{ a.resumen.porcentaje }}%
                  </span>
                  <span class="px-3 py-1 rounded-full bg-muted text-ink-muted text-sm">
                    Sesiones: {{ a.resumen.totalSesiones }}
                  </span>
                </div>

                @if (a.registros.length === 0) {
                  <p class="text-ink-muted text-sm">Aún no hay sesiones cerradas registradas en este taller.</p>
                } @else {
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-line text-left text-ink-muted">
                          <th class="py-2 pr-4">Fecha</th>
                          <th class="py-2 pr-4">Estado</th>
                          <th class="py-2">Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (r of a.registros; track r.fecha) {
                          <tr class="border-b border-line/60">
                            <td class="py-2 pr-4">{{ r.fecha }}</td>
                            <td class="py-2 pr-4">
                              <span [class]="estadoClass(r.estado)">{{ estadoLabel(r.estado) }}</span>
                            </td>
                            <td class="py-2 text-ink-muted">{{ r.observacion || '—' }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            }
          </section>
        }

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
                  @if (p.horarioPropuesto) {
                    <p class="text-ink-muted mt-1">Horario propuesto: {{ p.horarioPropuesto }}</p>
                  }
                  @if (p.esActividadLibre && p.actividadDescripcion) {
                    <p class="text-ink-muted mt-1">{{ p.actividadDescripcion }}</p>
                  }
                  @if (p.estado === 'RECHAZADA') {
                    @if (p.motivoRechazo) {
                      <p class="text-red-700 mt-1">Motivo: {{ p.motivoRechazo }}</p>
                    }
                    @if (p.horarioSugerido) {
                      <p class="text-primary-700 mt-1 font-medium">
                        Horario alternativo sugerido: {{ p.horarioSugerido }}
                      </p>
                    }
                    @if (p.mensajeDirectiva) {
                      <p class="text-ink-muted mt-1">{{ p.mensajeDirectiva }}</p>
                    }
                  }
                  <p class="text-xs text-ink-muted mt-2">{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </li>
              }
            </ul>
          </section>
        }

        <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
          <h2 class="font-bold text-ink mb-3">Proponer inscripción a la directiva</h2>
          <p class="text-sm text-ink-muted mb-4">
            Elija una actividad del catálogo o proponga otra actividad nueva. En ambos casos indique el horario deseado.
          </p>
          @if (catalogo.length === 0) {
            <p class="text-ink-muted text-sm">No hay actividades publicadas disponibles.</p>
          } @else {
            <ul class="space-y-2">
              @for (t of catalogo; track t.id) {
                <li class="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-line/60 last:border-0">
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-ink">{{ t.tipo }}</p>
                    <p class="text-xs text-ink-muted line-clamp-1">{{ t.descripcion }}</p>
                    <p class="text-xs text-ink-secondary mt-0.5">{{ horarioTaller(t) }}</p>
                  </div>
                  @if (propuestaPendiente(t.id)) {
                    <span class="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Propuesta pendiente</span>
                  } @else {
                    <button (click)="abrirModal(t)" [disabled]="proponiendo === t.id"
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
            Si la actividad que busca no está en la lista, puede proponerla aquí con nombre, horario y una breve descripción.
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
                        placeholder="Ej.: Mi hijo/a tiene experiencia previa en esta actividad"></textarea>
            </div>
            <button type="button" (click)="enviarActividadLibre()" [disabled]="!puedeEnviarActividadLibre() || enviandoLibre"
                    class="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {{ enviandoLibre ? 'Enviando…' : 'Enviar propuesta a la directiva' }}
            </button>
          </div>
        </section>

        <section class="bg-surface rounded-xl border border-line p-5 shadow-sm text-sm text-ink-muted">
          <p><strong class="text-ink">Apoderado:</strong> {{ data.apoderado.nombre }} · RUT {{ data.apoderado.rut }}</p>
          <p class="mt-1"><strong class="text-ink">Correo:</strong> {{ data.apoderado.email || '—' }}</p>
        </section>
      }

      @if (modalTaller) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" (click)="cerrarModal()">
          <div class="bg-surface rounded-xl shadow-xl max-w-md w-full p-5 border border-line"
               (click)="$event.stopPropagation()">
            <h3 class="text-lg font-bold text-ink mb-1">Proponer {{ modalTaller.tipo }}</h3>
            <p class="text-sm text-ink-muted mb-4">
              Escriba el horario que desea para su hijo/a. Si la actividad tiene horarios publicados, puede usarlos como referencia o modificar el texto.
            </p>

            @if (opcionesModal.length > 0) {
              <label class="block text-sm font-medium text-ink mb-1">Horarios publicados (referencia)</label>
              <select [(ngModel)]="horarioSeleccionadoId" (ngModelChange)="aplicarHorarioCatalogo($event)"
                      class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3">
                <option [ngValue]="null">— Escribir horario manualmente —</option>
                @for (h of opcionesModal; track h.id ?? h.etiqueta) {
                  <option [ngValue]="h.id">{{ h.etiqueta }}</option>
                }
              </select>
            }

            <label class="block text-sm font-medium text-ink mb-1">Horario propuesto *</label>
            <input type="text" [(ngModel)]="horarioLibre"
                   class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
                   placeholder="Ej.: Martes 16:00 - 17:30" />

            <label class="block text-sm font-medium text-ink mb-1">Mensaje para la directiva (opcional)</label>
            <textarea [(ngModel)]="mensajeApoderado" rows="3"
                      class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-4"
                      placeholder="Ej.: Prefiere este horario por compromisos familiares"></textarea>

            <div class="flex justify-end gap-2">
              <button type="button" (click)="cerrarModal()"
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
    </div>
  `,
})
export class PortalApoderadoComponent implements OnInit {
  /** Cliente HTTP: resumen del hijo, catálogo y propuestas. */
  private api = inject(ApiService);
  /** Valida que el usuario sea apoderado. */
  auth = inject(AuthRoleService);

  /** true en la carga inicial del portal. */
  cargando = true;
  /** Error de acceso o de red. */
  error = '';
  /** Resumen del alumno vinculado (talleres, asistencia, etc.). */
  data: any = null;
  /** Talleres publicados disponibles para proponer inscripción. */
  catalogo: any[] = [];
  /** Propuestas ya enviadas por este apoderado. */
  misPropuestas: any[] = [];
  /** Id de taller mientras se envía una propuesta (spinner). */
  proponiendo: number | null = null;

  /** Taller del catálogo abierto en el modal de propuesta. */
  modalTaller: any = null;
  /** Horarios del taller para elegir en el modal. */
  opcionesModal: { id: number | null; etiqueta: string }[] = [];
  /** Id de horario del catálogo seleccionado. */
  horarioSeleccionadoId: number | null = null;
  /** Horario en texto libre si no hay id. */
  horarioLibre = '';
  /** Mensaje opcional al coordinador. */
  mensajeApoderado = '';

  /** Formulario de propuesta de actividad fuera del catálogo. */
  actividadLibreNombre = '';
  actividadLibreDescripcion = '';
  actividadLibreHorario = '';
  actividadLibreMensaje = '';
  /** true mientras se envía la actividad libre. */
  enviandoLibre = false;

  /** Talleres con inscripción aceptada (soporta más de uno). */
  get talleresInscritos(): Array<{ id: number; nombre: string; horario?: string | null }> {
    if (!this.data) return [];
    if (Array.isArray(this.data.talleresInscritos)) return this.data.talleresInscritos;
    return this.data.tallerInscrito ? [this.data.tallerInscrito] : [];
  }

  /** Nombres unidos para el aviso de multi-taller. */
  get nombresTalleresInscritos(): string {
    return this.talleresInscritos.map((t) => t.nombre).join(', ');
  }

  /** Asistencia de cada taller inscrito. */
  get asistencias(): Array<{
    tallerId: number;
    tallerNombre?: string;
    resumen: {
      presentes: number;
      ausentes: number;
      tardes?: number;
      porcentaje: number;
      totalSesiones: number;
    };
    registros: Array<{ fecha: string; estado: string; observacion?: string | null }>;
  }> {
    if (!this.data) return [];
    if (Array.isArray(this.data.asistencias)) return this.data.asistencias;
    return this.data.asistencia ? [this.data.asistencia] : [];
  }

  /** Desplaza la vista al bloque de asistencia del taller indicado. */
  irAAsistencia(tallerId: number): void {
    const el = document.getElementById(`asistencia-taller-${tallerId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Valida acceso de apoderado y carga resumen + catálogo de talleres publicados. */
  ngOnInit(): void {
    if (!this.auth.isApoderado()) {
      this.error = 'Acceso solo para apoderados.';
      this.cargando = false;
      return;
    }
    this.api.getCatalogoTalleres().subscribe({
      next: (t) => (this.catalogo = t ?? []),
      error: () => (this.catalogo = []),
    });
    this.api.getMisPropuestasApoderado().subscribe({
      next: (p) => (this.misPropuestas = p ?? []),
      error: () => (this.misPropuestas = []),
    });
    this.api.getApoderadoResumen().subscribe({
      next: (res) => {
        this.data = res;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cargar la información.';
        this.cargando = false;
      },
    });
  }

  /** Devuelve el texto de horario formateado de un taller del catálogo. */
  horarioTaller(t: TallerConHorarios): string {
    return textoHorarioTaller(t);
  }

  /** Indica si ya existe una propuesta pendiente para el taller indicado. */
  propuestaPendiente(tallerId: number): boolean {
    return this.misPropuestas.some((p) => p.tallerId === tallerId && p.estado === 'PENDIENTE');
  }

  /** Valida que nombre y horario de actividad libre cumplan requisitos mínimos. */
  puedeEnviarActividadLibre(): boolean {
    return this.actividadLibreNombre.trim().length >= 2 && this.actividadLibreHorario.trim().length >= 3;
  }

  /** Envía una propuesta de actividad nueva fuera del catálogo a la directiva. */
  enviarActividadLibre(): void {
    if (!this.puedeEnviarActividadLibre()) return;
    this.enviandoLibre = true;
    this.api
      .proponerActividadLibre({
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
          alert('Propuesta de actividad enviada a la directiva.');
          this.api.getMisPropuestasApoderado().subscribe({
            next: (p) => (this.misPropuestas = p ?? []),
          });
        },
        error: (err) => {
          this.enviandoLibre = false;
          alert(err?.error?.message || 'No se pudo enviar la propuesta');
        },
      });
  }

  /** Abre el modal de propuesta para un taller del catálogo con horarios de referencia. */
  abrirModal(taller: any): void {
    this.modalTaller = taller;
    this.mensajeApoderado = '';
    this.horarioLibre = '';
    const horarios = horariosOrdenados(taller);
    if (horarios.length > 0) {
      this.opcionesModal = horarios.map((h: TallerHorarioItem) => ({
        id: h.id ?? null,
        etiqueta: textoFilaHorario(h),
      }));
    } else if (taller.diaSemana && taller.horaInicio && taller.horaFin) {
      this.opcionesModal = [
        {
          id: null,
          etiqueta: textoHorarioTaller(taller),
        },
      ];
    } else {
      this.opcionesModal = [];
    }
    if (this.opcionesModal.length > 0) {
      const primero = this.opcionesModal[0];
      this.horarioSeleccionadoId = primero.id;
      this.horarioLibre = primero.etiqueta;
    } else {
      this.horarioSeleccionadoId = null;
      this.horarioLibre = '';
    }
  }

  /** Copia al campo de texto el horario seleccionado del catálogo. */
  aplicarHorarioCatalogo(horarioId: number | null): void {
    if (horarioId == null) return;
    const opcion = this.opcionesModal.find((h) => h.id === horarioId);
    if (opcion) this.horarioLibre = opcion.etiqueta;
  }

  /** Cierra el modal de propuesta de taller del catálogo. */
  cerrarModal(): void {
    this.modalTaller = null;
    this.opcionesModal = [];
    this.horarioSeleccionadoId = null;
    this.horarioLibre = '';
    this.mensajeApoderado = '';
  }

  /** Valida que haya taller y horario propuesto antes de enviar. */
  puedeEnviarPropuesta(): boolean {
    return !!this.modalTaller && this.horarioLibre.trim().length > 0;
  }

  /** Envía la propuesta de inscripción del catálogo a la directiva con horario indicado. */
  confirmarPropuesta(): void {
    if (!this.modalTaller || !this.puedeEnviarPropuesta()) return;
    const tallerId = this.modalTaller.id;
    this.proponiendo = tallerId;
    this.api
      .proponerInscripcionApoderado(tallerId, {
        tallerHorarioId: this.horarioSeleccionadoId ?? undefined,
        horarioPropuestoTexto: this.horarioLibre.trim(),
        mensajeApoderado: this.mensajeApoderado.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.proponiendo = null;
          this.cerrarModal();
          alert('Propuesta enviada a la directiva con el horario indicado.');
          this.api.getMisPropuestasApoderado().subscribe({
            next: (p) => (this.misPropuestas = p ?? []),
          });
        },
        error: (err) => {
          this.proponiendo = null;
          alert(err?.error?.message || 'No se pudo enviar la propuesta');
        },
      });
  }

  estadoLabel(estado: string): string {
    if (estado === 'PRESENTE') return 'Presente';
    if (estado === 'TARDE') return 'Tarde';
    if (estado === 'AUSENTE') return 'Ausente';
    return 'Sin registro';
  }

  estadoClass(estado: string): string {
    if (estado === 'PRESENTE') return 'text-green-700 font-medium';
    if (estado === 'TARDE') return 'text-amber-800 font-medium';
    if (estado === 'AUSENTE') return 'text-red-700 font-medium';
    return 'text-ink-muted';
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
}
