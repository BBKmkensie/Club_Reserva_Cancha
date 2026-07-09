/**
 * Portal exclusivo para apoderados.
 * Muestra datos del hijo/a, asistencia, taller inscrito y propuestas de inscripción
 * (catálogo o actividad libre fuera de catálogo) a la directiva.
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

/**
 * Vista del apoderado: resumen familiar, asistencia, propuestas de catálogo y actividad libre.
 */
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
        <div class="grid gap-4 sm:grid-cols-2">
          <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
            <h2 class="font-bold text-ink mb-3">Su hijo/a</h2>
            <p class="text-lg font-semibold">{{ data.hijo.nombre }}</p>
            <p class="text-sm text-ink-muted">RUT: {{ data.hijo.rut }}</p>
          </section>

          <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
            <h2 class="font-bold text-ink mb-3">Taller inscrito</h2>
            @if (data.tallerInscrito) {
              <p class="text-lg font-semibold text-primary-600">{{ data.tallerInscrito.nombre }}</p>
              @if (data.tallerInscrito.horario) {
                <p class="text-sm text-ink-muted mt-1">{{ data.tallerInscrito.horario }}</p>
              }
            } @else {
              <p class="text-ink-muted">Sin taller activo inscrito.</p>
            }
          </section>
        </div>

        @if (data.asistencia) {
          <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
            <h2 class="font-bold text-ink mb-4">Resumen de asistencia</h2>
            <div class="flex flex-wrap gap-3 mb-4">
              <span class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Presente: {{ data.asistencia.resumen.presentes }}
              </span>
              <span class="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                Ausente: {{ data.asistencia.resumen.ausentes }}
              </span>
              <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                Tarde: {{ data.asistencia.resumen.tardes }}
              </span>
              <span class="px-3 py-1 rounded-full bg-muted text-ink-secondary text-sm font-medium">
                Asistencia: {{ data.asistencia.resumen.porcentaje }}%
              </span>
            </div>

            @if (data.asistencia.registros.length === 0) {
              <p class="text-ink-muted text-sm">Aún no hay sesiones cerradas registradas.</p>
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
                    @for (r of data.asistencia.registros; track r.fecha) {
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
  private api = inject(ApiService);
  auth = inject(AuthRoleService);

  cargando = true;
  error = '';
  data: any = null;
  catalogo: any[] = [];
  misPropuestas: any[] = [];
  proponiendo: number | null = null;

  modalTaller: any = null;
  opcionesModal: { id: number | null; etiqueta: string }[] = [];
  horarioSeleccionadoId: number | null = null;
  horarioLibre = '';
  mensajeApoderado = '';

  actividadLibreNombre = '';
  actividadLibreDescripcion = '';
  actividadLibreHorario = '';
  actividadLibreMensaje = '';
  enviandoLibre = false;

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
    if (estado === 'AUSENTE') return 'Ausente';
    if (estado === 'TARDE') return 'Tarde';
    return 'Sin registro';
  }

  estadoClass(estado: string): string {
    if (estado === 'PRESENTE') return 'text-green-700 font-medium';
    if (estado === 'AUSENTE') return 'text-red-700 font-medium';
    if (estado === 'TARDE') return 'text-amber-700 font-medium';
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
