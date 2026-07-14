/**
 * =============================================================================
 * app/pages/propuestas-actividad/propuestas-actividad.component.ts — Bandeja propuestas
 * =============================================================================
 * La directiva revisa propuestas de apoderados: inscripción en catálogo o actividad libre.
 * Rol: coordinación — canGestionarPropuestas().
 * Endpoints ApiService: getPropuestasPendientes, responderPropuestaInscripcion
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { AlumnoPrivacidadService } from '../../shared/services/alumno-privacidad.service';

@Component({
  selector: 'app-propuestas-actividad',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-surface rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Bandeja de propuestas</h1>
        <p class="text-ink-muted text-sm">
          La directiva revisa propuestas de apoderados y alumnos (actividad y horario) y decide cómo continuar.
        </p>
      </div>

      @if (!auth.canGestionarPropuestas()) {
        <p class="text-amber-700 bg-amber-50 p-4 rounded-lg">Acceso solo para directiva o super admin.</p>
      } @else if (cargando) {
        <p class="text-ink-muted">Cargando propuestas…</p>
      } @else if (propuestas.length === 0) {
        <p class="text-ink-muted bg-surface rounded-lg p-6 text-center">No hay propuestas pendientes.</p>
      } @else {
        <div class="space-y-4">
          @for (p of propuestas; track p.id) {
            <div class="bg-surface rounded-xl border p-5 shadow-sm transition-colors"
                 [class.border-primary-400]="p.id === destacarId"
                 [class.ring-2]="p.id === destacarId"
                 [class.ring-primary-200]="p.id === destacarId">
              <div class="flex flex-wrap justify-between gap-3 mb-2">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="text-lg font-bold text-ink">{{ p.tallerNombre }}</h2>
                    @if (p.esActividadLibre) {
                      <span class="text-xs bg-violet-100 text-violet-800 px-2 py-0.5 rounded">Fuera de catálogo</span>
                    }
                    <span class="text-xs px-2 py-0.5 rounded"
                          [class.bg-sky-100]="p.origen === 'ALUMNO'"
                          [class.text-sky-800]="p.origen === 'ALUMNO'"
                          [class.bg-amber-100]="p.origen !== 'ALUMNO'"
                          [class.text-amber-900]="p.origen !== 'ALUMNO'">
                      {{ p.origen === 'ALUMNO' ? 'Propuesto por alumno' : 'Propuesto por apoderado' }}
                    </span>
                  </div>
                  @if (p.actividadDescripcion) {
                    <p class="text-sm text-ink-muted mt-1">{{ p.actividadDescripcion }}</p>
                  }
                  <p class="text-sm text-ink-muted">
                    Estudiante: <strong>{{ priv.nombre(p.alumnoNombre) }}</strong> ({{ priv.rut(p.alumnoRut) }})
                  </p>
                  @if (p.origen !== 'ALUMNO' && p.apoderadoNombre) {
                    <p class="text-sm text-ink-muted">Apoderado: {{ p.apoderadoNombre }}</p>
                  }
                  @if (p.horarioPropuesto) {
                    <p class="text-sm text-primary-700 font-medium mt-1">
                      Horario propuesto: {{ p.horarioPropuesto }}
                    </p>
                  }
                  @if (p.mensajeApoderado) {
                    <p class="text-sm text-ink-muted mt-1 italic">«{{ p.mensajeApoderado }}»</p>
                  }
                </div>
                <span class="text-xs text-ink-muted">{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="flex flex-wrap gap-2 mt-3">
                <button (click)="abrirAceptar(p)"
                        class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                  Aceptar propuesta
                </button>
                <button (click)="abrirRechazar(p)"
                        class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                  Rechazar
                </button>
              </div>
            </div>
          }
        </div>
      }

      <a routerLink="/dashboard" class="text-sm text-primary-500 hover:underline inline-block">← Volver al dashboard</a>
    </div>

    @if (modal) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" (click)="cerrarModal()">
        <div class="bg-surface rounded-xl shadow-xl max-w-lg w-full p-5 border border-line"
             (click)="$event.stopPropagation()">
          @if (modal.tipo === 'aceptar') {
            <h3 class="text-lg font-bold text-ink mb-2">Aceptar propuesta</h3>
            <p class="text-sm text-ink-muted mb-4">
              @if (modal.propuesta.esActividadLibre) {
                Aprobará la idea de la actividad <strong>{{ modal.propuesta.tallerNombre }}</strong>
                @if (modal.propuesta.horarioPropuesto) {
                  ({{ modal.propuesta.horarioPropuesto }})
                }.
                La coordinación deberá crear el taller en el sistema.
              } @else {
                Se creará la solicitud de inscripción para el profesor del taller
                <strong>{{ modal.propuesta.tallerNombre }}</strong>
                @if (modal.propuesta.horarioPropuesto) {
                  ({{ modal.propuesta.horarioPropuesto }})
                }.
              }
            </p>
            <label class="block text-sm font-medium text-ink mb-1">
              Mensaje {{ modal.propuesta.origen === 'ALUMNO' ? 'para el alumno' : 'para el apoderado' }} (opcional)
            </label>
            <textarea [(ngModel)]="mensajeDirectiva" rows="2"
                      class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-4"></textarea>
            <div class="flex justify-end gap-2">
              <button type="button" (click)="cerrarModal()" class="px-4 py-2 text-sm rounded-lg border border-line">Cancelar</button>
              <button type="button" (click)="confirmarAceptar()"
                      class="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700">
                Confirmar aceptación
              </button>
            </div>
          } @else {
            <h3 class="text-lg font-bold text-ink mb-2">Rechazar propuesta</h3>
            <p class="text-sm text-ink-muted mb-4">
              Indique el motivo del rechazo. Puede sugerir otro horario disponible de la misma actividad.
            </p>
            <label class="block text-sm font-medium text-ink mb-1">Motivo del rechazo</label>
            <textarea [(ngModel)]="motivoRechazo" rows="2" required
                      class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
                      placeholder="Ej.: El horario propuesto coincide con otra actividad del estudiante"></textarea>

            @if (horariosAlternativos.length > 0) {
              <label class="block text-sm font-medium text-ink mb-1">Horario alternativo del catálogo (opcional)</label>
              <select [(ngModel)]="horarioSugeridoId"
                      class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3">
                <option [ngValue]="null">— Sin sugerir otro horario —</option>
                @for (h of horariosAlternativos; track h.id) {
                  <option [ngValue]="h.id">{{ h.etiqueta }}</option>
                }
              </select>
            }

            @if (modal.propuesta.esActividadLibre) {
              <label class="block text-sm font-medium text-ink mb-1">Horario alternativo sugerido (opcional)</label>
              <input type="text" [(ngModel)]="horarioSugeridoTexto"
                     class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
                     placeholder="Ej.: Miércoles 15:00 - 16:30" />
            }

            <label class="block text-sm font-medium text-ink mb-1">Mensaje adicional (opcional)</label>
            <textarea [(ngModel)]="mensajeDirectiva" rows="2"
                      class="w-full border border-line rounded-lg px-3 py-2 text-sm mb-4"></textarea>

            <div class="flex justify-end gap-2">
              <button type="button" (click)="cerrarModal()" class="px-4 py-2 text-sm rounded-lg border border-line">Cancelar</button>
              <button type="button" (click)="confirmarRechazar()" [disabled]="!motivoRechazo.trim()"
                      class="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                Confirmar rechazo
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class PropuestasActividadComponent implements OnInit {
  /** Cliente HTTP: bandeja y respuesta de propuestas. */
  private api = inject(ApiService);
  /** Lee ?id= para destacar una propuesta desde notificación. */
  private route = inject(ActivatedRoute);
  /** Solo directiva/super admin gestionan propuestas. */
  auth = inject(AuthRoleService);
  /** Enmascara datos del apoderado/alumno en la tarjeta. */
  priv = inject(AlumnoPrivacidadService);

  /** Propuestas pendientes de la bandeja. */
  propuestas: any[] = [];
  /** true mientras se carga la lista. */
  cargando = true;
  /** Id a resaltar (viene de query param). */
  destacarId: number | null = null;

  /** Modal abierto: aceptar o rechazar una propuesta (null = cerrado). */
  modal: { tipo: 'aceptar' | 'rechazar'; propuesta: any } | null = null;
  /** Motivo obligatorio al rechazar. */
  motivoRechazo = '';
  /** Mensaje opcional de la directiva al apoderado. */
  mensajeDirectiva = '';
  /** Horario alternativo elegido del catálogo (rechazo). */
  horarioSugeridoId: number | null = null;
  /** Texto libre de horario sugerido si no hay id. */
  horarioSugeridoTexto = '';
  /** Opciones de horario del taller propuesto para sugerir alternativa. */
  horariosAlternativos: { id: number; etiqueta: string }[] = [];

  /** Lee el id de query param para destacar una propuesta y carga la bandeja. */
  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    this.destacarId = id ? Number(id) : null;
    this.cargar();
  }

  /** Obtiene las propuestas pendientes desde la API (solo directiva/super admin). */
  cargar(): void {
    if (!this.auth.canGestionarPropuestas()) {
      this.cargando = false;
      return;
    }
    this.api.getPropuestasPendientes().subscribe({
      next: (data) => {
        this.propuestas = data ?? [];
        this.cargando = false;
      },
      error: () => {
        this.propuestas = [];
        this.cargando = false;
      },
    });
  }

  /** Abre el modal de confirmación para aceptar una propuesta. */
  abrirAceptar(propuesta: any): void {
    this.modal = { tipo: 'aceptar', propuesta };
    this.mensajeDirectiva = '';
  }

  /** Abre el modal de rechazo y prepara horarios alternativos del catálogo. */
  abrirRechazar(propuesta: any): void {
    this.modal = { tipo: 'rechazar', propuesta };
    this.motivoRechazo = '';
    this.mensajeDirectiva = '';
    this.horarioSugeridoId = null;
    this.horarioSugeridoTexto = '';
    const todos = (propuesta.horariosDisponibles ?? []).filter((h: { id: number | null }) => h.id != null);
    this.horariosAlternativos = todos.filter(
      (h: { id: number }) => h.id !== propuesta.tallerHorarioId,
    );
  }

  /** Cierra el modal y restablece el estado del formulario de respuesta. */
  cerrarModal(): void {
    this.modal = null;
    this.motivoRechazo = '';
    this.mensajeDirectiva = '';
    this.horarioSugeridoId = null;
    this.horarioSugeridoTexto = '';
    this.horariosAlternativos = [];
  }

  /** Confirma la aceptación; en actividad libre la coordinación deberá crear el taller. */
  confirmarAceptar(): void {
    if (!this.modal) return;
    const id = this.modal.propuesta.id;
    const esLibre = this.modal.propuesta.esActividadLibre;
    this.api
      .responderPropuestaInscripcion(id, true, {
        mensajeDirectiva: this.mensajeDirectiva.trim() || undefined,
      })
      .subscribe({
        next: () => {
          alert(
            esLibre
              ? 'Propuesta aceptada. La coordinación gestionará la nueva actividad.'
              : 'Propuesta aceptada. La solicitud quedó pendiente para el profesor.',
          );
          this.cerrarModal();
          this.cargar();
        },
        error: (e) => alert(e?.error?.message || 'No se pudo responder la propuesta'),
      });
  }

  /** Confirma el rechazo con motivo y horario alternativo opcional (catálogo o texto libre). */
  confirmarRechazar(): void {
    if (!this.modal || !this.motivoRechazo.trim()) return;
    const id = this.modal.propuesta.id;
    this.api
      .responderPropuestaInscripcion(id, false, {
        motivoRechazo: this.motivoRechazo.trim(),
        horarioSugeridoId: this.horarioSugeridoId ?? undefined,
        horarioSugeridoTexto: this.horarioSugeridoTexto.trim() || undefined,
        mensajeDirectiva: this.mensajeDirectiva.trim() || undefined,
      })
      .subscribe({
        next: () => {
          alert('Propuesta rechazada. El apoderado recibirá el motivo y el horario sugerido si indicó uno.');
          this.cerrarModal();
          this.cargar();
        },
        error: (e) => alert(e?.error?.message || 'No se pudo responder la propuesta'),
      });
  }
}
