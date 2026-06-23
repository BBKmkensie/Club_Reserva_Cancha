import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

@Component({
  selector: 'app-gestion-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Gestión de Inscripciones</h1>
        <p class="text-gray-600">
          Como profesor/coordinador revisas las solicitudes, apruebas o rechazas alumnos y monitoreas la capacidad del taller.
        </p>
      </div>

      @if (auth.isCoordinacion()) {
        <div class="bg-white rounded-lg shadow p-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar taller</label>
          <select [(ngModel)]="tallerIdSeleccionado" (ngModelChange)="cargarResumen()"
                  class="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2">
            <option [ngValue]="null">— Elegir taller —</option>
            @for (t of talleres; track t.id) {
              <option [ngValue]="t.id">{{ t.tipo }}</option>
            }
          </select>
        </div>
      }

      @if (!tallerIdSeleccionado) {
        <p class="text-gray-500 bg-white rounded-lg shadow p-6 text-center">
          @if (auth.isAdmin()) {
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
            <div class="text-sm text-gray-600">Capacidad</div>
          </div>
          <div class="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
            <div class="text-2xl font-bold text-amber-700">{{ resumen.resumen.pendientes }}</div>
            <div class="text-sm text-gray-600">Pendientes</div>
          </div>
          <div class="bg-green-50 rounded-xl p-4 text-center border border-green-200">
            <div class="text-2xl font-bold text-green-700">{{ resumen.resumen.aceptados }}</div>
            <div class="text-sm text-gray-600">Aceptados</div>
          </div>
          <div class="bg-red-50 rounded-xl p-4 text-center border border-red-200">
            <div class="text-2xl font-bold text-red-700">{{ resumen.resumen.rechazados }}</div>
            <div class="text-sm text-gray-600">Rechazados</div>
          </div>
          <div class="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
            <div class="text-2xl font-bold text-purple-700">{{ resumen.resumen.cuposDisponibles }}</div>
            <div class="text-sm text-gray-600">Cupos libres</div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">{{ resumen.taller.tipo }}</h2>
              <p class="text-sm text-gray-500">{{ textoHorario(resumen.taller) }}</p>
            </div>
            <button (click)="exportarReporte()"
                    class="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900">
              Descargar reporte
            </button>
          </div>

          <!-- Solicitudes pendientes -->
          <h3 class="text-lg font-semibold text-amber-800 mb-3">Solicitudes pendientes (revisar y responder)</h3>
          @if (pendientes.length === 0) {
            <p class="text-gray-500 py-4 bg-gray-50 rounded-lg text-center mb-6">No hay solicitudes pendientes</p>
          } @else {
            <ul class="space-y-3 mb-8">
              @for (s of pendientes; track s.id) {
                <li class="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <span class="font-semibold text-gray-800">{{ s.alumno?.nombre }}</span>
                    <span class="text-sm text-gray-500 ml-2">({{ s.alumno?.rut }})</span>
                    <p class="text-xs text-gray-400 mt-1">Solicitud #{{ s.id }}</p>
                    <p class="text-xs text-gray-600 mt-2">
                      Ficha: {{ textoFicha(s) }}
                    </p>
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
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Fichas de alumnos (por taller)</h3>
          <div class="overflow-x-auto mb-8">
            <table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead class="bg-gray-100">
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
                  <tr class="border-t border-gray-100 hover:bg-gray-50">
                    <td class="p-3 font-medium">{{ s.alumno?.nombre }}</td>
                    <td class="p-3">{{ s.alumno?.rut }}</td>
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
        </div>
      }

      @if (fichaEditando) {
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-1">Editar ficha</h3>
            <p class="text-sm text-gray-600 mb-4">{{ fichaEditando.alumno?.nombre }} — {{ resumen?.taller?.tipo }}</p>
            <div class="grid grid-cols-2 gap-3 text-sm mb-4">
              <label class="block">
                <span class="text-gray-700">Altura (cm)</span>
                <input type="number" [(ngModel)]="fichaForm.altura" min="50" max="250" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-gray-700">Peso (kg)</span>
                <input type="number" [(ngModel)]="fichaForm.peso" min="20" max="300" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-gray-700">% grasa</span>
                <input type="number" [(ngModel)]="fichaForm.porcentajeGrasa" min="1" max="60" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-gray-700">Sedentario</span>
                <select [(ngModel)]="fichaForm.sedentario" class="mt-1 w-full border rounded-lg px-2 py-1.5">
                  <option [ngValue]="true">Sí</option>
                  <option [ngValue]="false">No</option>
                </select>
              </label>
            </div>
            <div class="flex gap-3 justify-end">
              <button (click)="cerrarEditarFicha()" class="px-4 py-2 rounded-lg border border-gray-300">Cancelar</button>
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
  private api = inject(ApiService);
  auth = inject(AuthRoleService);

  talleres: any[] = [];
  tallerIdSeleccionado: number | null = null;
  resumen: any = null;
  error = '';
  fichaEditando: any = null;
  fichaForm = { altura: null as number | null, peso: null as number | null, porcentajeGrasa: null as number | null, sedentario: false };

  get pendientes() {
    return this.resumen?.inscripciones?.filter((s: any) => s.estado === 'PENDIENTE') ?? [];
  }

  ngOnInit() {
    if (this.auth.isAdmin() && this.auth.currentTallerId()) {
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

  cargarResumen() {
    if (!this.tallerIdSeleccionado) return;
    this.api.getResumenInscripcionesTaller(this.tallerIdSeleccionado).subscribe({
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

  responder(id: number, estado: 'ACEPTADO' | 'RECHAZADO') {
    this.api.responderInscripcionTaller(id, estado).subscribe({
      next: () => this.cargarResumen(),
      error: (err) => alert(err?.error?.message || 'No se pudo responder la solicitud')
    });
  }

  textoFicha(s: any): string {
    if (s.altura == null && s.peso == null) return 'Sin datos';
    const sed = s.sedentario === true ? 'sedentario' : s.sedentario === false ? 'activo' : '—';
    return `${s.altura ?? '—'} cm · ${s.peso ?? '—'} kg · ${s.porcentajeGrasa ?? '—'}% grasa · ${sed}`;
  }

  abrirEditarFicha(s: any) {
    this.fichaEditando = s;
    this.fichaForm = {
      altura: s.altura != null ? Number(s.altura) : null,
      peso: s.peso != null ? Number(s.peso) : null,
      porcentajeGrasa: s.porcentajeGrasa != null ? Number(s.porcentajeGrasa) : null,
      sedentario: s.sedentario ?? false,
    };
  }

  cerrarEditarFicha() {
    this.fichaEditando = null;
  }

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

  textoHorario(taller: any): string {
    if (!taller?.diaSemana || !taller?.horaInicio || !taller?.horaFin) {
      return 'Horario por confirmar';
    }
    const dia = DIAS_SEMANA[taller.diaSemana] ?? `Día ${taller.diaSemana}`;
    return `${dia} ${String(taller.horaInicio).slice(0, 5)} - ${String(taller.horaFin).slice(0, 5)}`;
  }

  exportarReporte() {
    if (!this.resumen) return;
    const lineas = [
      `REPORTE DE INSCRIPCIONES - ${this.resumen.taller.tipo}`,
      `Capacidad: ${this.resumen.resumen.capacidad}`,
      `Aceptados: ${this.resumen.resumen.aceptados} | Pendientes: ${this.resumen.resumen.pendientes} | Rechazados: ${this.resumen.resumen.rechazados}`,
      `Cupos disponibles: ${this.resumen.resumen.cuposDisponibles}`,
      '',
      'Alumno\tRUT\tAltura\tPeso\t%Grasa\tSedentario\tEstado\tFecha',
      ...this.resumen.inscripciones.map((s: any) =>
        `${s.alumno?.nombre}\t${s.alumno?.rut}\t${s.altura ?? ''}\t${s.peso ?? ''}\t${s.porcentajeGrasa ?? ''}\t${s.sedentario === true ? 'Sí' : s.sedentario === false ? 'No' : ''}\t${s.estado}\t${s.createdAt ?? ''}`
      )
    ];
    const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscripciones-${this.resumen.taller.tipo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
