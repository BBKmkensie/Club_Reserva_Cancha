import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Salida, etiquetaFlujoSalida, etiquetaEstadoSalida } from '../../models/salida.model';
import { Taller } from '../../models/taller.model';

@Component({
  selector: 'app-inscripcion-salidas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  template: `
    <div class="space-y-8">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Salidas y partidos</h1>
        <p class="text-gray-600">
          @if (auth.isCoordinacion()) {
            Asigna partidos a profesores o aprueba propuestas. Al aceptarse, la salida se publica a los estudiantes.
          } @else {
            Propón partidos/salidas a la directiva o acepta asignaciones. Al aprobarse, los alumnos podrán verla e inscribirse.
          }
        </p>
      </div>

      @if (auth.isCoordinacion()) {
        <section class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Asignar partido a profesor</h2>
          <form [formGroup]="asignarForm" (ngSubmit)="asignarPartido()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
              <select formControlName="profesorId" class="w-full border rounded-lg px-3 py-2">
                <option value="">Seleccione</option>
                @for (p of profesores; track p.id) {
                  <option [value]="p.id">{{ p.nombre }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Taller</label>
              <select formControlName="tallerId" class="w-full border rounded-lg px-3 py-2">
                <option value="">Seleccione</option>
                @for (t of talleres; track t.id) {
                  <option [value]="t.id">{{ t.tipo }}</option>
                }
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Destino / partido</label>
              <input formControlName="destino" type="text" placeholder="Ej: Partido vs Colegio X"
                     class="w-full border rounded-lg px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input formControlName="fecha" type="date" class="w-full border rounded-lg px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input formControlName="hora" type="time" class="w-full border rounded-lg px-3 py-2">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
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
                <li class="bg-white rounded-lg p-4 flex flex-wrap justify-between gap-3 border border-amber-100">
                  <div>
                    <p class="font-semibold text-gray-800">{{ s.destino }}</p>
                    <p class="text-sm text-gray-600">{{ s.fecha | date:'fullDate' }} · Prof. {{ s.profesor?.nombre }}</p>
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
        <section class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Proponer partido / salida</h2>
          <form [formGroup]="proponerForm" (ngSubmit)="proponerPartido()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Destino / partido</label>
              <input formControlName="destino" type="text" class="w-full border rounded-lg px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input formControlName="fecha" type="date" class="w-full border rounded-lg px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input formControlName="hora" type="time" class="w-full border rounded-lg px-3 py-2">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
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
                <li class="bg-white rounded-lg p-4 flex flex-wrap justify-between gap-3">
                  <div>
                    <p class="font-semibold">{{ s.destino }}</p>
                    <p class="text-sm text-gray-600">{{ s.fecha | date:'fullDate' }} · {{ s.taller?.tipo }}</p>
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

      <section class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Todas las salidas</h2>
        <div class="space-y-3">
          @for (s of salidas; track s.id) {
            <div class="border rounded-lg p-4">
              <div class="flex flex-wrap justify-between gap-2">
                <div>
                  <p class="font-semibold text-gray-800">{{ s.destino }}</p>
                  <p class="text-sm text-gray-600">{{ s.fecha | date:'fullDate' }} @if (s.hora) { · {{ s.hora }} }</p>
                  <p class="text-sm text-gray-600">Profesor: <strong>{{ s.profesor?.nombre || '—' }}</strong> · Taller: {{ s.taller?.tipo }}</p>
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
                  </div>
                }
              </div>
              @if (s.estado === 'CERRADA' && s.comentarioCierre) {
                <p class="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  <strong>Comentario del profesor:</strong> {{ s.comentarioCierre }}
                </p>
              }
            </div>
          }
          @if (salidas.length === 0) {
            <p class="text-gray-500 text-center py-6">No hay salidas registradas</p>
          }
        </div>
      </section>
    </div>
  `,
})
export class InscripcionSalidasComponent implements OnInit {
  auth = inject(AuthRoleService);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  talleres: Taller[] = [];
  profesores: any[] = [];
  salidas: Salida[] = [];
  pendientesProfesor: Salida[] = [];
  pendientesDirectiva: Salida[] = [];

  asignarForm = this.fb.group({
    profesorId: ['', Validators.required],
    tallerId: ['', Validators.required],
    destino: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: [''],
    descripcion: [''],
  });

  proponerForm = this.fb.group({
    destino: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: [''],
    descripcion: [''],
  });

  ngOnInit() {
    this.api.getTalleres().subscribe({ next: (d) => (this.talleres = d) });
    if (this.auth.isCoordinacion()) {
      this.api.getProfesores().subscribe({ next: (d) => (this.profesores = d) });
      this.cargarPendientesDirectiva();
    }
    if (this.auth.isProfesor() && this.auth.currentUserId()) {
      this.cargarPendientesProfesor();
    }
    this.cargarSalidas();
  }

  etiqueta(s: Salida) { return etiquetaFlujoSalida(s); }
  estadoLabel(s: Salida) { return etiquetaEstadoSalida(s); }

  cargarSalidas() {
    const obs = this.auth.isProfesor() && this.auth.currentUserId()
      ? this.api.getSalidasPorProfesor(this.auth.currentUserId()!)
      : this.api.getSalidas();
    obs.subscribe({ next: (d) => (this.salidas = d), error: () => (this.salidas = []) });
  }

  cargarPendientesProfesor() {
    const id = this.auth.currentUserId();
    if (!id) return;
    this.api.getSalidasPendientesProfesor(id).subscribe({
      next: (d) => (this.pendientesProfesor = d),
      error: () => (this.pendientesProfesor = []),
    });
  }

  cargarPendientesDirectiva() {
    this.api.getSalidasPendientesDirectiva().subscribe({
      next: (d) => (this.pendientesDirectiva = d),
      error: () => (this.pendientesDirectiva = []),
    });
  }

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

  abrirSalida(s: Salida) {
    const comentario = prompt('Comentario al abrir la salida (opcional)') ?? undefined;
    const id = this.auth.currentUserId();
    if (!id) return;
    this.api.abrirSalida(s.id, id, comentario).subscribe({
      next: () => this.cargarSalidas(),
      error: (e) => alert(e?.error?.message || 'Error'),
    });
  }

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
