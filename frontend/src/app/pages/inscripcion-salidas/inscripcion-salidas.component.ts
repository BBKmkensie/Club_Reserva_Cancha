/**
 * =============================================================================
 * app/pages/inscripcion-salidas/inscripcion-salidas.component.ts — Gestión de salidas
 * =============================================================================
 * Coordinación de salidas y partidos: directiva asigna/aprueba; profesor propone,
 * acepta, abre y cierra salidas del día.
 * Rol: coordinación o profesor — canGestionarSalidas().
 * Endpoints ApiService: getTalleres, getProfesores, getSalidas, getSalidasPorProfesor,
 * getSalidasPendientesProfesor, getSalidasPendientesDirectiva, asignarSalidaDirectiva,
 * proponerSalidaProfesor, responderSalida, abrirSalida, cerrarSalida
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Salida, etiquetaFlujoSalida, etiquetaEstadoSalida } from '../../models/salida.model';
import { Taller } from '../../models/taller.model';
import { HoraPickerComponent } from '../../shared/components/hora-picker/hora-picker.component';
import { FechaPickerComponent } from '../../shared/components/fecha-picker/fecha-picker.component';
import { AsistenciaSalidaPanelComponent } from '../../shared/components/asistencia-salida-panel/asistencia-salida-panel.component';

@Component({
  selector: 'app-inscripcion-salidas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, HoraPickerComponent, FechaPickerComponent, AsistenciaSalidaPanelComponent],
  template: `
    <div class="space-y-8">
      <div class="bg-surface rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Salidas y partidos</h1>
        <p class="text-ink-muted">
          @if (auth.isCoordinacion()) {
            Asigna partidos a profesores o aprueba propuestas. Al aceptarse, la salida se publica a los estudiantes.
          } @else {
            Propón partidos/salidas a la directiva o acepta asignaciones. Al aprobarse, los alumnos podrán verla e inscribirse.
          }
        </p>
      </div>

      @if (auth.isCoordinacion()) {
        <section class="bg-surface rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-ink mb-4">Asignar partido a profesor</h2>
          <form [formGroup]="asignarForm" (ngSubmit)="asignarPartido()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1">Profesor</label>
              <select formControlName="profesorId"
                      (change)="sincronizarDesdeProfesor()"
                      class="w-full border rounded-lg px-3 py-2">
                <option [ngValue]="null">Seleccione</option>
                @for (p of profesores; track p.id) {
                  <option [ngValue]="p.id">{{ p.nombre }}@if (nombreTallerProfesor(p); as nt) { — {{ nt }}}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1">Taller</label>
              <select formControlName="tallerId"
                      (change)="sincronizarDesdeTaller()"
                      class="w-full border rounded-lg px-3 py-2">
                <option [ngValue]="null">Seleccione</option>
                @for (t of talleres; track t.id) {
                  <option [ngValue]="t.id">{{ t.tipo }}@if (profesorDeTaller(t); as prof) { — {{ prof.nombre }}}</option>
                }
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1">Destino / partido</label>
              <input formControlName="destino" type="text" placeholder="Ej: Partido vs Colegio X"
                     class="w-full border rounded-lg px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-2">Fecha</label>
              <app-fecha-picker formControlName="fecha" [anchoCompleto]="true" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1">Hora <span class="text-ink-muted font-normal">(opcional)</span></label>
              <app-hora-picker formControlName="hora" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1">Descripción</label>
              <textarea formControlName="descripcion" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
            </div>
            <div class="md:col-span-2">
              <button type="submit" [disabled]="asignarForm.invalid"
                      class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                Asignar a profesor
              </button>
            </div>
          </form>
        </section>

        @if (pendientesDirectiva.length) {
          <section class="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 class="text-xl font-semibold text-amber-900 mb-4">Propuestas pendientes de aprobación</h2>
            <ul class="space-y-3">
              @for (s of pendientesDirectiva; track s.id) {
                <li class="bg-surface rounded-lg p-4 flex flex-wrap justify-between gap-3 border border-amber-100">
                  <div>
                    <p class="font-semibold text-ink">{{ s.destino }}</p>
                    <p class="text-sm text-ink-muted">{{ s.fecha | date:'fullDate' }} · Prof. {{ s.profesor?.nombre }}</p>
                    <p class="text-xs text-amber-700 mt-1">{{ etiqueta(s) }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="responder(s.id, true, 'directiva')" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm">Aceptar</button>
                    <button (click)="responder(s.id, false, 'directiva')" class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm">Rechazar</button>
                  </div>
                </li>
              }
            </ul>
          </section>
        }
      }

      @if (auth.isProfesor()) {
        <section class="bg-surface rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-ink mb-4">Proponer partido / salida</h2>
          <form [formGroup]="proponerForm" (ngSubmit)="proponerPartido()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1">Destino / partido</label>
              <input formControlName="destino" type="text" class="w-full border rounded-lg px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-2">Fecha</label>
              <app-fecha-picker formControlName="fecha" [anchoCompleto]="true" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1">Hora <span class="text-ink-muted font-normal">(opcional)</span></label>
              <app-hora-picker formControlName="hora" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1">Descripción</label>
              <textarea formControlName="descripcion" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
            </div>
            <div class="md:col-span-2">
              <button type="submit" [disabled]="proponerForm.invalid"
                      class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                Enviar propuesta a directiva
              </button>
            </div>
          </form>
        </section>

        @if (pendientesProfesor.length) {
          <section class="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <h2 class="text-xl font-semibold text-indigo-900 mb-4">Asignaciones de la directiva</h2>
            <ul class="space-y-3">
              @for (s of pendientesProfesor; track s.id) {
                <li class="bg-surface rounded-lg p-4 flex flex-wrap justify-between gap-3">
                  <div>
                    <p class="font-semibold">{{ s.destino }}</p>
                    <p class="text-sm text-ink-muted">{{ s.fecha | date:'fullDate' }} · {{ s.taller?.tipo }}</p>
                    <p class="text-xs text-indigo-700 mt-1">{{ etiqueta(s) }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="responder(s.id, true, 'profesor')" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm">Aceptar</button>
                    <button (click)="responder(s.id, false, 'profesor')" class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm">Rechazar</button>
                  </div>
                </li>
              }
            </ul>
          </section>
        }
      }

      <section class="bg-surface rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-ink mb-4">Todas las salidas</h2>
        <div class="space-y-3">
          @for (s of salidas; track s.id) {
            <div class="border rounded-lg p-4">
              <div class="flex flex-wrap justify-between gap-2">
                <div>
                  <p class="font-semibold text-ink">{{ s.destino }}</p>
                  <p class="text-sm text-ink-muted">{{ s.fecha | date:'fullDate' }} @if (s.hora) { · {{ s.hora }} }</p>
                  <p class="text-sm text-ink-muted">Profesor: <strong>{{ s.profesor?.nombre || '—' }}</strong> · Taller: {{ s.taller?.tipo }}</p>
                  <p class="text-xs text-primary-700 mt-1">{{ etiqueta(s) }}</p>
                  <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                        [class.bg-green-100]="s.estado === 'PUBLICADA' || s.estado === 'CERRADA' && s.resultado === 'EXITO'"
                        [class.text-green-800]="s.estado === 'PUBLICADA' || s.estado === 'CERRADA' && s.resultado === 'EXITO'"
                        [class.bg-blue-100]="s.estado === 'EN_CURSO'"
                        [class.text-blue-800]="s.estado === 'EN_CURSO'"
                        [class.bg-red-100]="s.estado === 'RECHAZADA' || s.resultado === 'FRACASO'"
                        [class.text-red-800]="s.estado === 'RECHAZADA' || s.resultado === 'FRACASO'"
                        [class.bg-amber-100]="s.estado === 'PENDIENTE_PROFESOR' || s.estado === 'PENDIENTE_DIRECTIVA'"
                        [class.text-amber-800]="s.estado === 'PENDIENTE_PROFESOR' || s.estado === 'PENDIENTE_DIRECTIVA'">
                    {{ estadoLabel(s) }}
                  </span>
                </div>
                @if (auth.isProfesor() && s.profesorId === auth.currentUserId()) {
                  <div class="flex flex-col gap-2">
                    @if (s.estado === 'PUBLICADA') {
                      <button (click)="abrirSalida(s)" class="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg">Abrir salida</button>
                    }
                    @if (s.estado === 'EN_CURSO') {
                      <button (click)="cerrarSalida(s, 'EXITO')" class="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg">Cerrar · Éxito</button>
                      <button (click)="cerrarSalida(s, 'FRACASO')" class="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg">Cerrar · Fracaso</button>
                    }
                    @if (s.estado === 'PUBLICADA' || s.estado === 'EN_CURSO' || s.estado === 'CERRADA') {
                      <button type="button" (click)="toggleAsistenciaSalida(s.id)"
                              class="text-sm border border-primary-300 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50">
                        {{ salidaAsistenciaAbierta === s.id ? 'Ocultar asistencia' : 'Pasar lista' }}
                      </button>
                    }
                  </div>
                }
              </div>
              @if (auth.isProfesor() && salidaAsistenciaAbierta === s.id && auth.currentUserId()) {
                <app-asistencia-salida-panel
                  [salidaId]="s.id"
                  [profesorId]="auth.currentUserId()"
                  [modoEdicion]="true" />
              }
              @if (s.estado === 'CERRADA' && s.comentarioCierre) {
                <p class="mt-2 text-sm text-ink-secondary bg-page p-2 rounded">
                  <strong>Comentario del profesor:</strong> {{ s.comentarioCierre }}
                </p>
              }
            </div>
          }
          @if (salidas.length === 0) {
            <p class="text-ink-muted text-center py-6">No hay salidas registradas</p>
          }
        </div>
      </section>
    </div>
  `,
})
export class InscripcionSalidasComponent implements OnInit {
  /** Coordinación asigna; profesor propone/responde. */
  auth = inject(AuthRoleService);
  /** Cliente HTTP del flujo de salidas. */
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  /** Talleres para el formulario de asignación. */
  talleres: Taller[] = [];
  /** Profesores (coordinación) para asignar salida. */
  profesores: any[] = [];
  /** Salidas ya creadas / en curso visibles según rol. */
  salidas: Salida[] = [];
  /** Bandeja del profesor: salidas por aceptar/rechazar. */
  pendientesProfesor: Salida[] = [];
  /** Bandeja de directiva: propuestas de profesor. */
  pendientesDirectiva: Salida[] = [];
  /** Id de salida cuyo panel de asistencia está expandido (profesor). */
  salidaAsistenciaAbierta: number | null = null;
  /** Evita bucles al sincronizar profesor ↔ taller en el formulario de asignación. */
  private sincronizandoAsignacion = false;

  /** Formulario coordinación: asignar salida a profesor+taller. */
  asignarForm = this.fb.group({
    profesorId: [null as number | null, Validators.required],
    tallerId: [null as number | null, Validators.required],
    destino: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: [''],
    descripcion: [''],
  });

  /** Formulario profesor: proponer salida a la directiva. */
  proponerForm = this.fb.group({
    destino: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: [''],
    descripcion: [''],
  });

  /** Carga talleres, profesores y listas según el rol (coordinación o profesor). */
  ngOnInit() {
    this.api.getTalleres().subscribe({ next: (d) => (this.talleres = d ?? []) });
    if (this.auth.isCoordinacion()) {
      this.api.getProfesores().subscribe({
        next: (d) => {
          this.profesores = (d ?? []).map((p: any) => ({
            ...p,
            tallerId: Number(p.tallerId ?? p.taller?.id ?? 0) || null,
          }));
        },
      });
      this.cargarPendientesDirectiva();
    }
    if (this.auth.isProfesor() && this.auth.currentUserId()) {
      this.cargarPendientesProfesor();
    }
    this.cargarSalidas();
  }

  /** Nombre del taller ligado al profesor (para el label del select). */
  nombreTallerProfesor(profesor: any): string | null {
    return profesor?.taller?.tipo ?? this.talleres.find((t) => Number(t.id) === Number(profesor?.tallerId))?.tipo ?? null;
  }

  /** Profesor principal asociado a un taller (si existe). */
  profesorDeTaller(taller: Taller | any): { id: number; nombre: string } | null {
    const tid = Number(taller?.id);
    const desdeLista = this.profesores.find(
      (p) => Number(p.tallerId ?? p.taller?.id) === tid,
    );
    if (desdeLista) return { id: Number(desdeLista.id), nombre: desdeLista.nombre };
    const emb = Array.isArray(taller?.profesores) ? taller.profesores[0] : null;
    return emb ? { id: Number(emb.id), nombre: emb.nombre } : null;
  }

  /** Al elegir profesor, rellena de inmediato su taller. */
  sincronizarDesdeProfesor(): void {
    if (this.sincronizandoAsignacion) return;
    const profesorId = Number(this.asignarForm.get('profesorId')!.value);
    if (!profesorId) return;
    const profesor = this.profesores.find((p) => Number(p.id) === profesorId);
    const tallerId = Number(profesor?.tallerId ?? profesor?.taller?.id);
    if (!tallerId) return;
    if (Number(this.asignarForm.get('tallerId')!.value) === tallerId) return;
    this.sincronizandoAsignacion = true;
    this.asignarForm.patchValue({ tallerId }, { emitEvent: false });
    this.sincronizandoAsignacion = false;
  }

  /** Al elegir taller, rellena de inmediato su profesor. */
  sincronizarDesdeTaller(): void {
    if (this.sincronizandoAsignacion) return;
    const tallerId = Number(this.asignarForm.get('tallerId')!.value);
    if (!tallerId) return;
    const taller = this.talleres.find((t) => Number(t.id) === tallerId);
    const profesor = this.profesorDeTaller(taller ?? { id: tallerId });
    if (!profesor) return;
    if (Number(this.asignarForm.get('profesorId')!.value) === Number(profesor.id)) return;
    this.sincronizandoAsignacion = true;
    this.asignarForm.patchValue({ profesorId: Number(profesor.id) }, { emitEvent: false });
    this.sincronizandoAsignacion = false;
  }

  etiqueta(s: Salida) { return etiquetaFlujoSalida(s); }
  estadoLabel(s: Salida) { return etiquetaEstadoSalida(s); }

  /** Recarga el listado completo de salidas (filtrado por profesor si aplica). */
  cargarSalidas() {
    const obs = this.auth.isProfesor() && this.auth.currentUserId()
      ? this.api.getSalidasPorProfesor(this.auth.currentUserId()!)
      : this.api.getSalidas();
    obs.subscribe({ next: (d) => (this.salidas = d), error: () => (this.salidas = []) });
  }

  /** Obtiene asignaciones de la directiva pendientes de respuesta del profesor. */
  cargarPendientesProfesor() {
    const id = this.auth.currentUserId();
    if (!id) return;
    this.api.getSalidasPendientesProfesor(id).subscribe({
      next: (d) => (this.pendientesProfesor = d),
      error: () => (this.pendientesProfesor = []),
    });
  }

  /** Obtiene propuestas de profesores pendientes de aprobación de la directiva. */
  cargarPendientesDirectiva() {
    this.api.getSalidasPendientesDirectiva().subscribe({
      next: (d) => (this.pendientesDirectiva = d),
      error: () => (this.pendientesDirectiva = []),
    });
  }

  /** Envía una asignación de partido/salida a un profesor (solo coordinación). */
  asignarPartido() {
    if (this.asignarForm.invalid) return;
    const v = this.asignarForm.value;
    this.api.asignarSalidaDirectiva({
      profesorId: Number(v.profesorId),
      tallerId: Number(v.tallerId),
      destino: v.destino!,
      fecha: v.fecha!,
      hora: v.hora || undefined,
      descripcion: v.descripcion || undefined,
      adminId: this.auth.currentUserId() ?? undefined,
    }).subscribe({
      next: () => {
        alert('Partido asignado. El profesor debe aceptarlo.');
        this.asignarForm.reset();
        this.cargarSalidas();
        this.cargarPendientesDirectiva();
      },
      error: (e) => alert(e?.error?.message || 'Error al asignar'),
    });
  }

  /** Envía una propuesta de salida a la directiva (solo profesor con taller asignado). */
  proponerPartido() {
    const profesorId = this.auth.currentUserId();
    const tallerId = this.auth.currentTallerId();
    if (!profesorId || !tallerId || this.proponerForm.invalid) {
      alert('Debes tener un taller asignado para proponer salidas.');
      return;
    }
    const v = this.proponerForm.value;
    this.api.proponerSalidaProfesor({
      profesorId,
      tallerId,
      destino: v.destino!,
      fecha: v.fecha!,
      hora: v.hora || undefined,
      descripcion: v.descripcion || undefined,
    }).subscribe({
      next: () => {
        alert('Propuesta enviada a la directiva.');
        this.proponerForm.reset();
        this.cargarSalidas();
      },
      error: (e) => alert(e?.error?.message || 'Error al proponer'),
    });
  }

  /** Acepta o rechaza una salida según el actor (profesor o directiva). */
  responder(id: number, acepta: boolean, actor: 'profesor' | 'directiva') {
    const motivo = !acepta ? prompt('Motivo del rechazo (opcional)') ?? undefined : undefined;
    this.api.responderSalida(id, acepta, actor, this.auth.currentUserId() ?? undefined, motivo).subscribe({
      next: () => {
        alert(acepta ? 'Aceptada. Ya visible para estudiantes.' : 'Rechazada.');
        this.cargarSalidas();
        this.cargarPendientesProfesor();
        this.cargarPendientesDirectiva();
      },
      error: (e) => alert(e?.error?.message || 'Error'),
    });
  }

  toggleAsistenciaSalida(salidaId: number): void {
    this.salidaAsistenciaAbierta = this.salidaAsistenciaAbierta === salidaId ? null : salidaId;
  }

  /** Marca una salida publicada como en curso (profesor responsable). */
  abrirSalida(s: Salida) {
    const comentario = prompt('Comentario al abrir la salida (opcional)') ?? undefined;
    const id = this.auth.currentUserId();
    if (!id) return;
    this.api.abrirSalida(s.id, id, comentario).subscribe({
      next: () => this.cargarSalidas(),
      error: (e) => alert(e?.error?.message || 'Error'),
    });
  }

  /** Cierra una salida en curso registrando resultado y comentario del profesor. */
  cerrarSalida(s: Salida, resultado: 'EXITO' | 'FRACASO') {
    const comentario = prompt('¿Cómo le fue la salida? Escribe un comentario:');
    if (!comentario?.trim()) return;
    const id = this.auth.currentUserId();
    if (!id) return;
    this.api.cerrarSalida(s.id, id, resultado, comentario.trim()).subscribe({
      next: () => {
        alert('Salida cerrada.');
        this.cargarSalidas();
      },
      error: (e) => alert(e?.error?.message || 'Error'),
    });
  }
}
