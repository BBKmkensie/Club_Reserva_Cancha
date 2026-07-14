/**
 * =============================================================================
 * app/pages/reservas/reservas.component.ts — Reserva de cancha
 * =============================================================================
 * Disponibilidad por fecha, reserva de slots, franjas semanales (directiva) y listado.
 * Rol: reserva canReservarCancha(); franjas canGestionarFranjasCancha().
 * Endpoints ApiService: getTalleres, getFranjasCancha, actualizarFranjasCancha,
 * getDisponibilidadCancha, createReserva, getReservas, deleteReserva
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Reserva } from '../../models/reserva.model';
import { Taller } from '../../models/taller.model';
import {
  SLOTS_FRANJA_CANCHA,
  CANCHA_HORA_INICIO,
  CANCHA_HORA_FIN,
  CANCHA_DURACION_SLOT_MIN,
  DURACIONES_FRANJA_MIN,
  fmtSlotInicio,
  fmtSlotFin,
  esSlotParaTodos,
} from '../../shared/utils/cancha.constants';
import { CanchaSemanaVistaComponent } from '../../shared/components/cancha-semana-vista/cancha-semana-vista.component';
import { FechaPickerComponent } from '../../shared/components/fecha-picker/fecha-picker.component';

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const ESPACIO = 'Cancha Principal';
const SLOTS = SLOTS_FRANJA_CANCHA;

type EstadoSlot = 'disponible' | 'ocupada' | 'no_habilitada';

interface SlotCancha {
  horaInicio: string;
  horaFin: string;
  espacio: string;
  estado: EstadoSlot;
  duracionMinutos?: number;
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
  duracionMinutos: number;
}

/**
 * Componente de reservas: slots del día, configuración de franjas y CRUD de reservas.
 */
@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CanchaSemanaVistaComponent, FechaPickerComponent],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold text-ink">Reserva de cancha</h1>
        <p class="text-ink-muted mt-1">
          Horarios de <strong>{{ fmtHora(CANCHA_HORA_INICIO) }} a {{ fmtHora(CANCHA_HORA_FIN) }}</strong> (cada {{ CANCHA_DURACION_SLOT_MIN }} minutos). El bloque <strong>13:00–14:00</strong> está habilitado para todos los talleres.
          La directiva puede ampliar franjas a más tiempo.
        </p>
      </div>

      @if (auth.isCoordinacion()) {
        <div>
          <h2 class="text-xl font-semibold text-ink mb-1">Ocupación semanal de la cancha</h2>
          <p class="text-sm text-ink-muted mb-4">
            Revisa la semana completa: días, horarios ocupados y franjas disponibles (09:00–20:00).
          </p>
          <app-cancha-semana-vista [version]="versionSemana" [espacio]="ESPACIO" />
        </div>
      }

      <section class="bg-surface rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-ink mb-4">Reservar horario</h2>
        <p class="text-sm text-ink-muted mb-4">
          Selecciona uno o más horarios disponibles y luego confirma la reserva.
        </p>
        <div class="flex flex-col lg:flex-row gap-6 mb-6">
          <div class="w-full lg:w-auto shrink-0">
            <span class="block text-sm text-ink-secondary font-medium mb-2">Fecha</span>
            <app-fecha-picker [(ngModel)]="fechaSeleccionada" (ngModelChange)="onFechaChange()" />
          </div>
          <div class="flex flex-wrap gap-4 items-end flex-1">
          @if (auth.isSuperAdmin() || auth.isDirectiva()) {
            <label class="block min-w-[200px] flex-1">
              <span class="text-sm text-ink-secondary font-medium">Taller</span>
              <select [(ngModel)]="tallerReservaId" class="mt-1 w-full border border-line-strong rounded-lg px-3 py-2">
                <option [ngValue]="null">Seleccione taller</option>
                @for (t of talleres; track t.id) {
                  <option [ngValue]="t.id">{{ t.tipo }}</option>
                }
              </select>
            </label>
          } @else if (auth.isProfesor()) {
            <p class="text-sm text-ink-muted pb-2">
              Taller: <strong>{{ nombreTallerProfesor }}</strong>
            </p>
          }
          </div>
        </div>

        @if (cargandoSlots) {
          <p class="text-ink-muted">Cargando horarios...</p>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            @for (slot of slots; track slot.horaInicio) {
              <button type="button"
                      [disabled]="slot.estado !== 'disponible' || reservando"
                      (click)="toggleSlot(slot)"
                      class="p-3 rounded-lg border text-left transition"
                      [class.bg-green-50]="slot.estado === 'disponible' && !estaSeleccionado(slot)"
                      [class.border-green-300]="slot.estado === 'disponible' && !estaSeleccionado(slot)"
                      [class.hover:bg-green-100]="slot.estado === 'disponible' && !estaSeleccionado(slot)"
                      [class.bg-primary-100]="estaSeleccionado(slot)"
                      [class.border-primary-500]="estaSeleccionado(slot)"
                      [class.ring-2]="estaSeleccionado(slot)"
                      [class.ring-primary-400]="estaSeleccionado(slot)"
                      [class.cursor-pointer]="slot.estado === 'disponible'"
                      [class.bg-red-50]="slot.estado === 'ocupada'"
                      [class.border-red-300]="slot.estado === 'ocupada'"
                      [class.bg-page]="slot.estado === 'no_habilitada'"
                      [class.border-line]="slot.estado === 'no_habilitada'"
                      [class.opacity-60]="slot.estado !== 'disponible'">
                <p class="font-semibold text-ink">{{ slot.horaInicio }}–{{ slot.horaFin }}</p>
                @if (slot.paraTodos) {
                  <p class="text-xs text-amber-700 mt-0.5">Para todos</p>
                }
                @if (slot.duracionMinutos && slot.duracionMinutos > CANCHA_DURACION_SLOT_MIN) {
                  <p class="text-xs text-blue-700">{{ etiquetaDuracion(slot.duracionMinutos) }}</p>
                }
                @if (estaSeleccionado(slot)) {
                  <p class="text-xs text-primary-700 mt-1 font-medium">Seleccionado</p>
                } @else if (slot.estado === 'disponible') {
                  <p class="text-xs text-green-700 mt-1">Disponible</p>
                } @else if (slot.estado === 'ocupada') {
                  <p class="text-xs text-red-700 mt-1">Ocupada</p>
                  <p class="text-xs text-ink-muted truncate">{{ slot.tallerNombre }}</p>
                } @else {
                  <p class="text-xs text-ink-muted mt-1">No habilitada</p>
                }
              </button>
            }
          </div>
        }

        @if (slotsSeleccionados.length > 0) {
          <div class="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-primary-200 bg-primary-50">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-ink">
                {{ slotsSeleccionados.length }}
                {{ slotsSeleccionados.length === 1 ? 'horario seleccionado' : 'horarios seleccionados' }}
              </p>
              <p class="text-xs text-ink-muted mt-0.5 break-words">
                {{ resumenSeleccion() }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2 shrink-0">
              <button type="button" (click)="limpiarSeleccion()" [disabled]="reservando"
                      class="px-4 py-2 rounded-lg border border-line-strong text-ink-secondary hover:bg-page text-sm disabled:opacity-50">
                Limpiar
              </button>
              <button type="button" (click)="confirmarReservas()" [disabled]="reservando"
                      class="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 text-sm font-medium disabled:opacity-50">
                {{ reservando ? 'Reservando...' : 'Confirmar reserva' }}
              </button>
            </div>
          </div>
        }

        @if (errorReserva) {
          <p class="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{{ errorReserva }}</p>
        }
      </section>

      @if (auth.canGestionarFranjasCancha()) {
        <section class="bg-surface rounded-xl shadow-lg p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 class="text-xl font-semibold text-ink">Franjas habilitadas (semanal)</h2>
              <p class="text-sm text-ink-muted">Clic para habilitar/deshabilitar. En celdas activas, elige duración. 13:00–14:00 es fijo para todos.</p>
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
                  <th class="p-2 text-left text-ink-muted font-medium">Hora</th>
                  @for (d of [1,2,3,4,5,6,7]; track d) {
                    <th class="p-2 text-center text-ink-muted font-medium">{{ DIAS_SEMANA[d] }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (slot of SLOTS; track slot.key) {
                  <tr [class.bg-amber-50]="esSlotParaTodos(slot.hora, slot.minuto)">
                    <td class="p-2 text-ink-secondary whitespace-nowrap font-medium text-xs">
                      {{ fmtSlotInicio(slot.hora, slot.minuto) }}–{{ fmtSlotFin(slot.hora, slot.minuto) }}
                      @if (esSlotParaTodos(slot.hora, slot.minuto)) {
                        <span class="block text-xs text-amber-700 font-normal">Para todos</span>
                      }
                    </td>
                    @for (d of [1,2,3,4,5,6,7]; track d) {
                      <td class="p-1">
                        @if (esSlotParaTodos(slot.hora, slot.minuto)) {
                          <div class="w-full h-9 rounded-md border border-amber-400 bg-amber-100 text-amber-800 text-xs font-medium flex items-center justify-center">
                            Todos
                          </div>
                        } @else {
                          <button type="button"
                                  (click)="toggleFranja(d, slot.hora, slot.minuto)"
                                  class="w-full h-9 rounded-md border text-xs font-medium transition"
                                  [class.bg-green-100]="franjaActiva(d, slot.hora, slot.minuto)"
                                  [class.border-green-400]="franjaActiva(d, slot.hora, slot.minuto)"
                                  [class.text-green-800]="franjaActiva(d, slot.hora, slot.minuto)"
                                  [class.bg-muted]="!franjaActiva(d, slot.hora, slot.minuto)"
                                  [class.border-line-strong]="!franjaActiva(d, slot.hora, slot.minuto)"
                                  [class.text-ink-muted]="!franjaActiva(d, slot.hora, slot.minuto)">
                            {{ franjaActiva(d, slot.hora, slot.minuto) ? 'Sí' : 'No' }}
                          </button>
                          @if (franjaActiva(d, slot.hora, slot.minuto)) {
                            <select [ngModel]="getDuracion(d, slot.hora, slot.minuto)" (ngModelChange)="setDuracion(d, slot.hora, slot.minuto, $event)"
                                    class="mt-1 w-full text-xs border rounded px-1 py-0.5">
                              @for (dur of DURACIONES_FRANJA_MIN; track dur) {
                                <option [ngValue]="dur">{{ etiquetaDuracion(dur) }}</option>
                              }
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

      <section class="bg-surface rounded-xl shadow-lg overflow-hidden">
        <div class="p-6 border-b border-line">
          <h2 class="text-xl font-semibold text-ink">Reservas registradas</h2>
        </div>
        <table class="min-w-full divide-y divide-line">
          <thead class="bg-page">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Horario</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Taller</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Profesor</th>
              @if (auth.canGestionarFranjasCancha() || auth.isProfesor()) {
                <th class="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Acciones</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
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
                <td colspan="5" class="px-6 py-8 text-center text-ink-muted">No hay reservas registradas</td>
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
  /** Permisos: reservar, gestionar franjas, cancelar. */
  auth = inject(AuthRoleService);
  /** Cliente HTTP: reservas, disponibilidad y franjas. */
  private api = inject(ApiService);

  readonly DIAS_SEMANA = DIAS_SEMANA;
  readonly SLOTS = SLOTS;
  readonly DURACIONES_FRANJA_MIN = DURACIONES_FRANJA_MIN;
  readonly CANCHA_DURACION_SLOT_MIN = CANCHA_DURACION_SLOT_MIN;
  readonly fmtSlotInicio = fmtSlotInicio;
  readonly fmtSlotFin = fmtSlotFin;
  readonly esSlotParaTodos = esSlotParaTodos;
  readonly CANCHA_HORA_INICIO = CANCHA_HORA_INICIO;
  readonly CANCHA_HORA_FIN = CANCHA_HORA_FIN;
  readonly ESPACIO = ESPACIO;

  /** Incrementar fuerza recarga de app-cancha-semana-vista. */
  versionSemana = 0;

  /** Historial de reservas existentes. */
  reservas: Reserva[] = [];
  /** Talleres para asociar la reserva. */
  talleres: Taller[] = [];
  /** Slots del día seleccionado (disponible/ocupada/cerrada). */
  slots: SlotCancha[] = [];
  /** Configuración semanal de franjas (solo coordinación). */
  franjasConfig: FranjaConfig[] = [];
  /** true si el usuario cambió franjas y aún no guardó. */
  franjasModificadas = false;
  /** true mientras se persisten las franjas. */
  guardandoFranjas = false;

  /** Día ISO (YYYY-MM-DD) cuya disponibilidad se consulta. */
  fechaSeleccionada = new Date().toISOString().split('T')[0];
  /** Taller asociado a la reserva (fijo si es profesor). */
  tallerReservaId: number | null = null;
  /** Etiqueta del taller del profesor en la UI. */
  nombreTallerProfesor = '';
  /** true mientras se pide disponibilidad del día. */
  cargandoSlots = false;
  /** true mientras se confirman las reservas seleccionadas. */
  reservando = false;
  /** Error al crear reserva. */
  errorReserva = '';
  /** Claves horaInicio de slots elegidos (aún no confirmados). */
  slotsSeleccionadosKeys = new Set<string>();

  /** Slots disponibles marcados por el usuario. */
  get slotsSeleccionados(): SlotCancha[] {
    return this.slots.filter(
      (s) => s.estado === 'disponible' && this.slotsSeleccionadosKeys.has(s.horaInicio),
    );
  }

  /** Notifica a la vista semanal que debe recargar. */
  private refrescarSemana(): void {
    this.versionSemana++;
  }

  /** Carga reservas, talleres y disponibilidad inicial según permisos del usuario. */
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

  esParaTodos(hora: number, minuto: number): boolean {
    return esSlotParaTodos(hora, minuto);
  }

  franjaActiva(diaSemana: number, hora: number, minuto: number): boolean {
    if (this.esParaTodos(hora, minuto)) return true;
    const horaInicio = fmtSlotInicio(hora, minuto);
    const f = this.franjasConfig.find(
      (x) => x.diaSemana === diaSemana && this.fmtHoraStr(x.horaInicio) === horaInicio,
    );
    return f?.activa ?? false;
  }

  getDuracion(diaSemana: number, hora: number, minuto: number): number {
    const horaInicio = fmtSlotInicio(hora, minuto);
    const f = this.franjasConfig.find(
      (x) => x.diaSemana === diaSemana && this.fmtHoraStr(x.horaInicio) === horaInicio,
    );
    return f?.duracionMinutos ?? CANCHA_DURACION_SLOT_MIN;
  }

  setDuracion(diaSemana: number, hora: number, minuto: number, duracion: number) {
    const horaInicio = fmtSlotInicio(hora, minuto);
    let f = this.franjasConfig.find(
      (x) => x.diaSemana === diaSemana && this.fmtHoraStr(x.horaInicio) === horaInicio,
    );
    if (!f) {
      f = { diaSemana, horaInicio, activa: true, paraTodos: false, duracionMinutos: duracion };
      this.franjasConfig.push(f);
    } else {
      f.duracionMinutos = duracion;
      f.activa = true;
    }
    this.franjasModificadas = true;
  }

  toggleFranja(diaSemana: number, hora: number, minuto: number) {
    if (this.esParaTodos(hora, minuto)) return;
    const horaInicio = fmtSlotInicio(hora, minuto);
    const idx = this.franjasConfig.findIndex(
      (x) => x.diaSemana === diaSemana && this.fmtHoraStr(x.horaInicio) === horaInicio,
    );
    if (idx >= 0) {
      this.franjasConfig[idx].activa = !this.franjasConfig[idx].activa;
    } else {
      this.franjasConfig.push({
        diaSemana, horaInicio, activa: true, paraTodos: false, duracionMinutos: CANCHA_DURACION_SLOT_MIN,
      });
    }
    this.franjasModificadas = true;
  }

  etiquetaDuracion(minutos: number): string {
    if (minutos % 60 === 0) return `${minutos / 60} h`;
    if (minutos > 60) return `${Math.floor(minutos / 60)} h ${minutos % 60} min`;
    return `${minutos} min`;
  }

  /** Obtiene la configuración semanal de franjas horarias de la cancha. */
  cargarFranjas() {
    this.api.getFranjasCancha(ESPACIO).subscribe({
      next: (data) => {
        this.franjasConfig = data.map((f: any) => {
          const ini = this.fmtHoraStr(f.horaInicio);
          const fin = this.fmtHoraStr(f.horaFin);
          const iniMin = parseInt(ini.split(':')[0], 10) * 60 + parseInt(ini.split(':')[1] || '0', 10);
          const finMin = parseInt(fin.split(':')[0], 10) * 60 + parseInt(fin.split(':')[1] || '0', 10);
          return {
            diaSemana: f.diaSemana,
            horaInicio: f.horaInicio,
            activa: f.activa,
            paraTodos: !!f.paraTodos,
            duracionMinutos: Math.max(CANCHA_DURACION_SLOT_MIN, finMin - iniMin),
          };
        });
        this.franjasModificadas = false;
      }
    });
  }

  /** Persiste la configuración semanal de franjas habilitadas (solo coordinación). */
  guardarFranjas() {
    this.guardandoFranjas = true;
    const payload = this.franjasConfig.map((f) => ({
      diaSemana: f.diaSemana,
      horaInicio: this.fmtHoraStr(f.horaInicio),
      activa: f.paraTodos ? true : f.activa,
      duracionMinutos: f.duracionMinutos || CANCHA_DURACION_SLOT_MIN,
    }));
    this.api.actualizarFranjasCancha(payload, ESPACIO).subscribe({
      next: () => {
        this.guardandoFranjas = false;
        this.franjasModificadas = false;
        this.cargarFranjas();
        this.cargarDisponibilidad();
        this.refrescarSemana();
        alert('Franjas horarias actualizadas.');
      },
      error: (e) => {
        this.guardandoFranjas = false;
        alert(e?.error?.message || 'Error al guardar franjas');
      }
    });
  }

  /** Consulta al backend los slots disponibles/ocupados para la fecha seleccionada. */
  cargarDisponibilidad() {
    if (!this.fechaSeleccionada) return;
    this.cargandoSlots = true;
    this.errorReserva = '';
    this.api.getDisponibilidadCancha(this.fechaSeleccionada, ESPACIO).subscribe({
      next: (data) => {
        this.slots = data;
        // Quitar de la selección horarios que ya no están disponibles
        const disponibles = new Set(
          this.slots.filter((s) => s.estado === 'disponible').map((s) => s.horaInicio),
        );
        this.slotsSeleccionadosKeys = new Set(
          [...this.slotsSeleccionadosKeys].filter((k) => disponibles.has(k)),
        );
        this.cargandoSlots = false;
      },
      error: () => {
        this.cargandoSlots = false;
        this.slots = [];
        this.slotsSeleccionadosKeys = new Set();
      }
    });
  }

  onFechaChange() {
    this.limpiarSeleccion();
    this.cargarDisponibilidad();
  }

  estaSeleccionado(slot: SlotCancha): boolean {
    return this.slotsSeleccionadosKeys.has(slot.horaInicio);
  }

  /** Marca o desmarca un horario disponible (sin confirmar aún). */
  toggleSlot(slot: SlotCancha) {
    if (slot.estado !== 'disponible' || this.reservando) return;
    this.errorReserva = '';
    const next = new Set(this.slotsSeleccionadosKeys);
    if (next.has(slot.horaInicio)) next.delete(slot.horaInicio);
    else next.add(slot.horaInicio);
    this.slotsSeleccionadosKeys = next;
  }

  limpiarSeleccion() {
    this.slotsSeleccionadosKeys = new Set();
    this.errorReserva = '';
  }

  resumenSeleccion(): string {
    return this.slotsSeleccionados
      .slice()
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
      .map((s) => `${s.horaInicio}–${s.horaFin}`)
      .join(', ');
  }

  /** Confirma y crea una reserva por cada horario seleccionado. */
  confirmarReservas() {
    const seleccion = this.slotsSeleccionados;
    if (!seleccion.length) return;

    const tallerId = this.tallerReservaId;
    if (!tallerId) {
      this.errorReserva = 'Debe seleccionar un taller para reservar.';
      return;
    }

    const resumen = this.resumenSeleccion();
    const n = seleccion.length;
    if (!confirm(
      `¿Confirmar ${n === 1 ? 'la reserva' : `las ${n} reservas`} del ${this.fechaSeleccionada}?\n\n${resumen}`,
    )) {
      return;
    }

    this.reservando = true;
    this.errorReserva = '';

    const peticiones = seleccion.map((slot) => {
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
      return this.api.createReserva(data);
    });

    forkJoin(peticiones).subscribe({
      next: () => {
        this.reservando = false;
        this.limpiarSeleccion();
        this.loadReservas();
        this.cargarDisponibilidad();
        this.refrescarSemana();
        alert(n === 1 ? 'Reserva creada correctamente.' : `${n} reservas creadas correctamente.`);
      },
      error: (e) => {
        this.reservando = false;
        this.errorReserva = e?.error?.message || 'No se pudo crear alguna de las reservas.';
        this.loadReservas();
        this.cargarDisponibilidad();
        this.refrescarSemana();
      }
    });
  }

  /** Recarga el listado de reservas existentes desde la API. */
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

  /** Cancela una reserva existente tras confirmación del usuario. */
  eliminarReserva(id: number) {
    if (!confirm('¿Cancelar esta reserva de cancha?')) return;
    this.api.deleteReserva(id).subscribe({
      next: () => {
        this.loadReservas();
        this.cargarDisponibilidad();
        this.refrescarSemana();
      },
      error: (e) => alert(e?.error?.message || 'Error al cancelar')
    });
  }
}
