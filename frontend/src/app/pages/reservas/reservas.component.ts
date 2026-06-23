import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Reserva } from '../../models/reserva.model';
import { Taller } from '../../models/taller.model';

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const ESPACIO = 'Cancha Principal';
const HORAS = Array.from({ length: 12 }, (_, i) => 9 + i); // 9..20 → hasta 21:00
const HORA_PARA_TODOS = 13;

type EstadoSlot = 'disponible' | 'ocupada' | 'no_habilitada';

interface SlotCancha {
  horaInicio: string;
  horaFin: string;
  espacio: string;
  estado: EstadoSlot;
  duracionHoras?: number;
  paraTodos?: boolean;
  reservaId?: number;
  tallerId?: number;
  tallerNombre?: string;
  profesorNombre?: string;
}

interface FranjaConfig {
  diaSemana: number;
  horaInicio: string;
  activa: boolean;
  paraTodos: boolean;
  duracionHoras: number;
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Reserva de cancha</h1>
        <p class="text-gray-600 mt-1">
          Horarios de <strong>09:00 a 21:00</strong> (1 hora por reserva). El bloque <strong>13:00–14:00</strong> está habilitado para todos los talleres.
          La directiva puede ampliar franjas a más de 1 hora.
        </p>
      </div>

      @if (auth.canGestionarFranjasCancha()) {
        <section class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-800">Franjas habilitadas (semanal)</h2>
              <p class="text-sm text-gray-500">Clic para habilitar/deshabilitar. En celdas activas, elige duración (1–3 h). 13:00–14:00 es fijo para todos.</p>
            </div>
            <button (click)="guardarFranjas()" [disabled]="guardandoFranjas || !franjasModificadas"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {{ guardandoFranjas ? 'Guardando...' : 'Guardar franjas' }}
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th class="p-2 text-left text-gray-500 font-medium">Hora</th>
                  @for (d of [1,2,3,4,5,6,7]; track d) {
                    <th class="p-2 text-center text-gray-600 font-medium">{{ DIAS_SEMANA[d] }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (h of HORAS; track h) {
                  <tr [class.bg-amber-50]="h === HORA_PARA_TODOS">
                    <td class="p-2 text-gray-700 whitespace-nowrap font-medium">
                      {{ fmtHora(h) }}–{{ fmtHora(h + 1) }}
                      @if (h === HORA_PARA_TODOS) {
                        <span class="block text-xs text-amber-700 font-normal">Para todos</span>
                      }
                    </td>
                    @for (d of [1,2,3,4,5,6,7]; track d) {
                      <td class="p-1">
                        @if (esParaTodos(h)) {
                          <div class="w-full h-9 rounded-md border border-amber-400 bg-amber-100 text-amber-800 text-xs font-medium flex items-center justify-center">
                            Todos
                          </div>
                        } @else {
                          <button type="button"
                                  (click)="toggleFranja(d, h)"
                                  class="w-full h-9 rounded-md border text-xs font-medium transition"
                                  [class.bg-green-100]="franjaActiva(d, h)"
                                  [class.border-green-400]="franjaActiva(d, h)"
                                  [class.text-green-800]="franjaActiva(d, h)"
                                  [class.bg-gray-100]="!franjaActiva(d, h)"
                                  [class.border-gray-300]="!franjaActiva(d, h)"
                                  [class.text-gray-500]="!franjaActiva(d, h)">
                            {{ franjaActiva(d, h) ? 'Sí' : 'No' }}
                          </button>
                          @if (franjaActiva(d, h)) {
                            <select [ngModel]="getDuracion(d, h)" (ngModelChange)="setDuracion(d, h, $event)"
                                    class="mt-1 w-full text-xs border rounded px-1 py-0.5">
                              <option [ngValue]="1">1 h</option>
                              <option [ngValue]="2">2 h</option>
                              <option [ngValue]="3">3 h</option>
                            </select>
                          }
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      <section class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Reservar horario</h2>
        <div class="flex flex-wrap gap-4 items-end mb-6">
          <label class="block">
            <span class="text-sm text-gray-700 font-medium">Fecha</span>
            <input type="date" [(ngModel)]="fechaSeleccionada" (ngModelChange)="cargarDisponibilidad()"
                   class="mt-1 block border border-gray-300 rounded-lg px-3 py-2">
          </label>
          @if (auth.isSuperAdmin() || auth.isDirectiva()) {
            <label class="block min-w-[200px]">
              <span class="text-sm text-gray-700 font-medium">Taller</span>
              <select [(ngModel)]="tallerReservaId" class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2">
                <option [ngValue]="null">Seleccione taller</option>
                @for (t of talleres; track t.id) {
                  <option [ngValue]="t.id">{{ t.tipo }}</option>
                }
              </select>
            </label>
          } @else if (auth.isProfesor()) {
            <p class="text-sm text-gray-600 pb-2">
              Taller: <strong>{{ nombreTallerProfesor }}</strong>
            </p>
          }
        </div>

        @if (cargandoSlots) {
          <p class="text-gray-500">Cargando horarios...</p>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            @for (slot of slots; track slot.horaInicio) {
              <button type="button"
                      [disabled]="slot.estado !== 'disponible' || reservando"
                      (click)="reservarSlot(slot)"
                      class="p-3 rounded-lg border text-left transition"
                      [class.bg-green-50]="slot.estado === 'disponible'"
                      [class.border-green-300]="slot.estado === 'disponible'"
                      [class.hover:bg-green-100]="slot.estado === 'disponible'"
                      [class.cursor-pointer]="slot.estado === 'disponible'"
                      [class.bg-red-50]="slot.estado === 'ocupada'"
                      [class.border-red-300]="slot.estado === 'ocupada'"
                      [class.bg-gray-50]="slot.estado === 'no_habilitada'"
                      [class.border-gray-200]="slot.estado === 'no_habilitada'"
                      [class.opacity-60]="slot.estado !== 'disponible'">
                <p class="font-semibold text-gray-800">{{ slot.horaInicio }}–{{ slot.horaFin }}</p>
                @if (slot.paraTodos) {
                  <p class="text-xs text-amber-700 mt-0.5">Para todos</p>
                }
                @if (slot.duracionHoras && slot.duracionHoras > 1) {
                  <p class="text-xs text-blue-700">{{ slot.duracionHoras }} horas</p>
                }
                @if (slot.estado === 'disponible') {
                  <p class="text-xs text-green-700 mt-1">Disponible</p>
                } @else if (slot.estado === 'ocupada') {
                  <p class="text-xs text-red-700 mt-1">Ocupada</p>
                  <p class="text-xs text-gray-600 truncate">{{ slot.tallerNombre }}</p>
                } @else {
                  <p class="text-xs text-gray-500 mt-1">No habilitada</p>
                }
              </button>
            }
          </div>
        }

        @if (errorReserva) {
          <p class="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{{ errorReserva }}</p>
        }
      </section>

      <section class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-xl font-semibold text-gray-800">Reservas registradas</h2>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taller</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
              @if (auth.canGestionarFranjasCancha() || auth.isProfesor()) {
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (r of reservas; track r.id) {
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">{{ r.fecha | date:'dd/MM/yyyy' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ fmtHoraStr(r.horaInicio) }}–{{ fmtHoraStr(r.horaFin) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ r.taller?.tipo || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ profesorNombre(r) }}</td>
                @if (auth.canGestionarFranjasCancha() || auth.isProfesor()) {
                  <td class="px-6 py-4 whitespace-nowrap">
                    @if (puedeEliminar(r)) {
                      <button (click)="eliminarReserva(r.id)" class="text-red-600 hover:text-red-800 text-sm">Cancelar</button>
                    }
                  </td>
                }
              </tr>
            }
            @if (reservas.length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">No hay reservas registradas</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: []
})
export class ReservasComponent implements OnInit {
  auth = inject(AuthRoleService);
  private api = inject(ApiService);

  readonly DIAS_SEMANA = DIAS_SEMANA;
  readonly HORAS = HORAS;
  readonly HORA_PARA_TODOS = HORA_PARA_TODOS;

  reservas: Reserva[] = [];
  talleres: Taller[] = [];
  slots: SlotCancha[] = [];
  franjasConfig: FranjaConfig[] = [];
  franjasModificadas = false;
  guardandoFranjas = false;

  fechaSeleccionada = new Date().toISOString().split('T')[0];
  tallerReservaId: number | null = null;
  nombreTallerProfesor = '';
  cargandoSlots = false;
  reservando = false;
  errorReserva = '';

  ngOnInit() {
    this.loadReservas();
    this.api.getTalleres().subscribe({
      next: (data) => {
        this.talleres = data;
        if (this.auth.isProfesor() && this.auth.currentTallerId()) {
          this.tallerReservaId = this.auth.currentTallerId();
          const t = data.find((x: Taller) => x.id === this.tallerReservaId);
          this.nombreTallerProfesor = t?.tipo ?? 'Mi taller';
        }
      }
    });
    if (this.auth.canGestionarFranjasCancha()) {
      this.cargarFranjas();
    }
    this.cargarDisponibilidad();
  }

  fmtHora(h: number): string {
    return `${h.toString().padStart(2, '0')}:00`;
  }

  fmtHoraStr(h?: string): string {
    if (!h) return '';
    return h.substring(0, 5);
  }

  profesorNombre(r: Reserva): string {
    return (r as any).profesor?.nombre || '-';
  }

  esParaTodos(hora: number): boolean {
    return hora === HORA_PARA_TODOS;
  }

  franjaActiva(diaSemana: number, hora: number): boolean {
    if (this.esParaTodos(hora)) return true;
    const horaInicio = this.fmtHora(hora);
    const f = this.franjasConfig.find(
      (x) => x.diaSemana === diaSemana && this.fmtHoraStr(x.horaInicio) === horaInicio,
    );
    return f?.activa ?? false;
  }

  getDuracion(diaSemana: number, hora: number): number {
    const horaInicio = this.fmtHora(hora);
    const f = this.franjasConfig.find(
      (x) => x.diaSemana === diaSemana && this.fmtHoraStr(x.horaInicio) === horaInicio,
    );
    return f?.duracionHoras ?? 1;
  }

  setDuracion(diaSemana: number, hora: number, duracion: number) {
    const horaInicio = this.fmtHora(hora);
    let f = this.franjasConfig.find(
      (x) => x.diaSemana === diaSemana && this.fmtHoraStr(x.horaInicio) === horaInicio,
    );
    if (!f) {
      f = { diaSemana, horaInicio, activa: true, paraTodos: false, duracionHoras: duracion };
      this.franjasConfig.push(f);
    } else {
      f.duracionHoras = duracion;
      f.activa = true;
    }
    this.franjasModificadas = true;
  }

  toggleFranja(diaSemana: number, hora: number) {
    if (this.esParaTodos(hora)) return;
    const horaInicio = this.fmtHora(hora);
    const idx = this.franjasConfig.findIndex(
      (x) => x.diaSemana === diaSemana && this.fmtHoraStr(x.horaInicio) === horaInicio,
    );
    if (idx >= 0) {
      this.franjasConfig[idx].activa = !this.franjasConfig[idx].activa;
    } else {
      this.franjasConfig.push({
        diaSemana, horaInicio, activa: true, paraTodos: false, duracionHoras: 1,
      });
    }
    this.franjasModificadas = true;
  }

  cargarFranjas() {
    this.api.getFranjasCancha(ESPACIO).subscribe({
      next: (data) => {
        this.franjasConfig = data.map((f: any) => {
          const ini = this.fmtHoraStr(f.horaInicio);
          const fin = this.fmtHoraStr(f.horaFin);
          const iniH = parseInt(ini.split(':')[0], 10);
          const finH = parseInt(fin.split(':')[0], 10);
          return {
            diaSemana: f.diaSemana,
            horaInicio: f.horaInicio,
            activa: f.activa,
            paraTodos: !!f.paraTodos,
            duracionHoras: Math.max(1, finH - iniH),
          };
        });
        this.franjasModificadas = false;
      }
    });
  }

  guardarFranjas() {
    this.guardandoFranjas = true;
    const payload = this.franjasConfig.map((f) => ({
      diaSemana: f.diaSemana,
      horaInicio: this.fmtHoraStr(f.horaInicio),
      activa: f.paraTodos ? true : f.activa,
      duracionHoras: f.duracionHoras || 1,
    }));
    this.api.actualizarFranjasCancha(payload, ESPACIO).subscribe({
      next: () => {
        this.guardandoFranjas = false;
        this.franjasModificadas = false;
        this.cargarFranjas();
        this.cargarDisponibilidad();
        alert('Franjas horarias actualizadas.');
      },
      error: (e) => {
        this.guardandoFranjas = false;
        alert(e?.error?.message || 'Error al guardar franjas');
      }
    });
  }

  cargarDisponibilidad() {
    if (!this.fechaSeleccionada) return;
    this.cargandoSlots = true;
    this.errorReserva = '';
    this.api.getDisponibilidadCancha(this.fechaSeleccionada, ESPACIO).subscribe({
      next: (data) => {
        this.slots = data;
        this.cargandoSlots = false;
      },
      error: () => {
        this.cargandoSlots = false;
        this.slots = [];
      }
    });
  }

  reservarSlot(slot: SlotCancha) {
    const tallerId = this.tallerReservaId;
    if (!tallerId) {
      this.errorReserva = 'Debe seleccionar un taller para reservar.';
      return;
    }
    if (!confirm(`¿Reservar la cancha el ${this.fechaSeleccionada} de ${slot.horaInicio} a ${slot.horaFin}?`)) {
      return;
    }

    this.reservando = true;
    this.errorReserva = '';
    const data: any = {
      espacio: ESPACIO,
      fecha: this.fechaSeleccionada,
      horaInicio: slot.horaInicio,
      horaFin: slot.horaFin,
      tallerId,
    };
    if (this.auth.isProfesor() && this.auth.currentUserId()) {
      data.profesorId = this.auth.currentUserId();
    }

    this.api.createReserva(data).subscribe({
      next: () => {
        this.reservando = false;
        this.loadReservas();
        this.cargarDisponibilidad();
      },
      error: (e) => {
        this.reservando = false;
        this.errorReserva = e?.error?.message || 'No se pudo crear la reserva.';
        this.cargarDisponibilidad();
      }
    });
  }

  loadReservas() {
    this.api.getReservas().subscribe({
      next: (data) => this.reservas = data,
      error: () => this.reservas = []
    });
  }

  puedeEliminar(r: Reserva): boolean {
    if (this.auth.canGestionarFranjasCancha()) return true;
    if (this.auth.isProfesor()) {
      return r.tallerId === this.auth.currentTallerId();
    }
    return false;
  }

  eliminarReserva(id: number) {
    if (!confirm('¿Cancelar esta reserva de cancha?')) return;
    this.api.deleteReserva(id).subscribe({
      next: () => {
        this.loadReservas();
        this.cargarDisponibilidad();
      },
      error: (e) => alert(e?.error?.message || 'Error al cancelar')
    });
  }
}
