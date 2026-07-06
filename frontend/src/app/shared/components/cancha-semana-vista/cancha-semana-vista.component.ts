import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import {
  CANCHA_HORA_INICIO,
  CANCHA_HORA_FIN,
} from '../../utils/cancha.constants';
import {
  DIAS_CORTO,
  MESES,
  esHoy,
  etiquetaDiaCorto,
  lunesDeSemana,
  parseFechaIso,
  sumarDias,
  diaSemanaDesdeFecha,
} from '../../utils/fecha-semana.util';

type EstadoSlot = 'disponible' | 'ocupada' | 'no_habilitada';

interface SlotDia {
  horaInicio: string;
  horaFin: string;
  estado: EstadoSlot;
  paraTodos?: boolean;
  tallerNombre?: string;
  profesorNombre?: string;
}

interface DiaSemana {
  fecha: string;
  num: number;
  slots: SlotDia[];
}

@Component({
  selector: 'app-cancha-semana-vista',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cal-wrap bg-surface rounded-xl shadow-lg overflow-hidden border border-line">
      <!-- Selector semanal (estilo referencia) -->
      <div class="px-4 sm:px-5 pt-5 pb-0">
        <div class="cal-header flex items-center justify-between mb-4">
          <span class="cal-mes text-[17px] font-semibold">{{ mesVisible }} {{ anioVisible }}</span>
          <div class="cal-nav flex items-center gap-3 text-[15px] font-semibold">
            <button type="button" (click)="cambiarSemana(-1)" aria-label="Semana anterior">‹</button>
            <button type="button" (click)="irHoy()">Hoy</button>
            <button type="button" (click)="cambiarSemana(1)" aria-label="Semana siguiente">›</button>
          </div>
        </div>

        <div class="cal-grid-7 grid grid-cols-7 min-w-0">
          @for (d of dias; track d.fecha) {
            <button type="button"
                    (click)="seleccionarDia(d.fecha)"
                    class="cal-celda flex flex-col items-center border-0 bg-transparent p-0 cursor-pointer">
              <span class="cal-letra text-[13px] font-medium text-ink mb-2">{{ letraDia(d.fecha) }}</span>
              <span class="cal-num w-[34px] h-[34px] flex items-center justify-center rounded-full text-[15px] font-semibold leading-none"
                    [class.cal-num--sel]="fechaSeleccionada === d.fecha"
                    [class.cal-num--hoy]="esHoy(d.fecha) && fechaSeleccionada !== d.fecha"
                    [class.cal-num--normal]="fechaSeleccionada !== d.fecha && !esHoy(d.fecha)">
                {{ d.num }}
              </span>
              <span class="h-[10px] mt-1 flex items-end justify-center">
                @if (tieneOcupados(d)) {
                  <span class="cal-dot w-[5px] h-[5px] rounded-full"
                        [class.bg-surface]="fechaSeleccionada === d.fecha"
                        [class.bg-gray-400]="fechaSeleccionada !== d.fecha"></span>
                }
              </span>
            </button>
          }
        </div>

        <div class="cal-barra-fecha mt-3 -mx-4 sm:-mx-5 px-4 py-3 bg-muted text-center">
          <p class="text-[15px] font-bold text-ink">{{ etiquetaDiaSeleccionado }}</p>
        </div>
      </div>

      <!-- Detalle del día seleccionado -->
      @if (diaVisible) {
        <div class="px-4 sm:px-6 pb-6 pt-4 anim-dia">
          @if (cargando) {
            <p class="text-ink-muted text-center py-16 text-sm">Cargando...</p>
          } @else if (!slotsSeleccionados.length) {
            <p class="text-ink-muted text-center py-16 text-base">Sin horarios este día</p>
          } @else {
            @if (slotsOcupados.length) {
              <div class="space-y-3 mb-4">
                <h3 class="text-xs font-semibold text-ink-muted uppercase tracking-wide">Reservas del día</h3>
                @for (slot of slotsOcupados; track slot.horaInicio) {
                  <article class="rounded-xl border border-red-100 bg-red-50/60 shadow-sm px-4 py-3">
                    <p class="font-bold text-ink">{{ slot.tallerNombre || 'Reservado' }}</p>
                    <p class="text-sm text-red-800 mt-0.5">{{ slot.horaInicio }} – {{ slot.horaFin }}</p>
                    @if (slot.profesorNombre) {
                      <p class="text-xs text-ink-muted mt-1">Prof. {{ slot.profesorNombre }}</p>
                    }
                  </article>
                }
              </div>
            } @else {
              <p class="text-xs text-emerald-600 mb-3">{{ resumenDia }}</p>
            }

            <h3 class="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
              Horarios (09:00 – 20:00)
            </h3>
            <ng-container *ngTemplateOutlet="listaHorarios" />
          }
        </div>
      }

      <ng-template #listaHorarios>
        <ul class="space-y-2 max-h-[24rem] overflow-y-auto">
          @for (slot of slotsSeleccionados; track slot.horaInicio) {
            <li class="rounded-lg border px-3 py-2.5 flex items-center justify-between gap-2 text-sm"
                [class.bg-emerald-50]="slot.estado === 'disponible'"
                [class.border-emerald-200]="slot.estado === 'disponible'"
                [class.bg-red-50]="slot.estado === 'ocupada'"
                [class.border-red-200]="slot.estado === 'ocupada'"
                [class.bg-page]="slot.estado === 'no_habilitada'"
                [class.border-line]="slot.estado === 'no_habilitada'">
              <div class="min-w-0">
                <span class="font-semibold text-ink">{{ slot.horaInicio }} – {{ slot.horaFin }}</span>
                @if (slot.estado === 'ocupada') {
                  <span class="block text-red-800 truncate">{{ slot.tallerNombre }}</span>
                } @else if (slot.estado === 'disponible') {
                  <span class="block text-emerald-700 text-xs">Disponible</span>
                } @else {
                  <span class="block text-ink-muted text-xs">No habilitada</span>
                }
              </div>
              <span class="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                    [class.bg-emerald-100]="slot.estado === 'disponible'"
                    [class.text-emerald-800]="slot.estado === 'disponible'"
                    [class.bg-red-100]="slot.estado === 'ocupada'"
                    [class.text-red-800]="slot.estado === 'ocupada'"
                    [class.bg-gray-200]="slot.estado === 'no_habilitada'"
                    [class.text-ink-muted]="slot.estado === 'no_habilitada'">
                {{ etiquetaEstado(slot.estado) }}
              </span>
            </li>
          }
        </ul>
        <p class="mt-3 text-xs text-ink-muted text-center">{{ resumenDia }}</p>
      </ng-template>
    </section>
  `,
  styles: [`
    .cal-mes,
    .cal-nav {
      color: rgb(var(--color-accent));
    }
    .cal-nav button {
      color: rgb(var(--color-accent));
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      line-height: 1;
    }
    .cal-nav button:hover {
      color: rgb(var(--color-accent-hover));
    }
    .cal-num--sel {
      background-color: rgb(var(--color-accent));
      color: #fff;
    }
    .cal-num--hoy {
      color: rgb(var(--color-accent));
    }
    .cal-num--normal {
      color: rgb(var(--color-ink));
    }
    .cal-barra-fecha {
      border-top: 1px solid rgb(var(--color-border));
      border-bottom: 1px solid rgb(var(--color-border));
      @apply bg-muted;
    }
    .cal-grid-7 {
      width: 100%;
    }
    .cal-celda {
      min-width: 0;
    }
    .anim-dia {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class CanchaSemanaVistaComponent implements OnInit, OnChanges {
  @Input() espacio = 'Cancha Principal';
  @Input() version = 0;

  private api = inject(ApiService);

  readonly CANCHA_HORA_INICIO = CANCHA_HORA_INICIO;
  readonly CANCHA_HORA_FIN = CANCHA_HORA_FIN;
  readonly esHoy = esHoy;

  dias: DiaSemana[] = [];
  fechaSeleccionada = parseFechaIso(new Date());
  inicioSemana = lunesDeSemana();
  cargando = false;

  get mesVisible(): string {
    const ref = this.diaVisible ?? this.dias[0];
    if (!ref) return MESES[new Date().getMonth()];
    const d = new Date(`${ref.fecha}T12:00:00`);
    return MESES[d.getMonth()];
  }

  get anioVisible(): number {
    const ref = this.diaVisible ?? this.dias[0];
    if (!ref) return new Date().getFullYear();
    return new Date(`${ref.fecha}T12:00:00`).getFullYear();
  }

  get etiquetaDiaSeleccionado(): string {
    return etiquetaDiaCorto(this.fechaSeleccionada);
  }

  get diaVisible(): DiaSemana | undefined {
    return this.dias.find((d) => d.fecha === this.fechaSeleccionada);
  }

  get slotsSeleccionados(): SlotDia[] {
    return this.diaVisible?.slots ?? [];
  }

  get slotsOcupados(): SlotDia[] {
    return this.slotsSeleccionados.filter((s) => s.estado === 'ocupada');
  }

  get resumenDia(): string {
    const s = this.slotsSeleccionados;
    const disp = s.filter((x) => x.estado === 'disponible').length;
    const occ = s.filter((x) => x.estado === 'ocupada').length;
    const off = s.filter((x) => x.estado === 'no_habilitada').length;
    return `${disp} disponibles · ${occ} ocupadas · ${off} no habilitadas`;
  }

  ngOnInit(): void {
    this.inicioSemana = lunesDeSemana(this.fechaSeleccionada);
    this.dias = this.armarEstructuraSemana();
    this.cargarSemana();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['version'] && !changes['version'].firstChange) {
      this.cargarSemana();
    }
  }

  letraDia(fecha: string): string {
    return DIAS_CORTO[diaSemanaDesdeFecha(fecha)];
  }

  fmtHora(h: number): string {
    return `${String(h).padStart(2, '0')}:00`;
  }

  etiquetaEstado(estado: EstadoSlot): string {
    if (estado === 'disponible') return 'Libre';
    if (estado === 'ocupada') return 'Ocupada';
    return 'Cerrada';
  }

  tieneOcupados(d: DiaSemana): boolean {
    return d.slots.some((s) => s.estado === 'ocupada');
  }

  seleccionarDia(fecha: string): void {
    this.fechaSeleccionada = fecha;
  }

  irHoy(): void {
    const hoy = parseFechaIso(new Date());
    this.inicioSemana = lunesDeSemana(hoy);
    this.fechaSeleccionada = hoy;
    this.dias = this.armarEstructuraSemana();
    this.cargarSemana();
  }

  cambiarSemana(delta: number): void {
    this.inicioSemana = sumarDias(this.inicioSemana, delta * 7);
    this.fechaSeleccionada = this.inicioSemana;
    this.dias = this.armarEstructuraSemana();
    this.cargarSemana();
  }

  private armarEstructuraSemana(dataApi: any[] = []): DiaSemana[] {
    const dias: DiaSemana[] = [];
    for (let i = 0; i < 7; i++) {
      const fecha = sumarDias(this.inicioSemana, i);
      const apiDia = dataApi.find((d) => parseFechaIso(d.fecha) === fecha);
      dias.push({
        fecha,
        num: new Date(`${fecha}T12:00:00`).getDate(),
        slots: apiDia ? this.mapearSlots(apiDia.slots) : [],
      });
    }
    return dias;
  }

  private mapearSlots(slots: any[] = []): SlotDia[] {
    return slots.map((s) => ({
      horaInicio: (s.horaInicio ?? '').slice(0, 5),
      horaFin: (s.horaFin ?? '').slice(0, 5),
      estado: s.estado as EstadoSlot,
      paraTodos: s.paraTodos,
      tallerNombre: s.tallerNombre,
      profesorNombre: s.profesorNombre,
    }));
  }

  cargarSemana(): void {
    this.cargando = true;
    this.api.getDisponibilidadSemanaCancha(this.inicioSemana, this.espacio).subscribe({
      next: (data) => {
        this.dias = this.armarEstructuraSemana(data ?? []);
        if (!this.dias.some((d) => d.fecha === this.fechaSeleccionada)) {
          this.fechaSeleccionada = this.dias[0]?.fecha ?? this.fechaSeleccionada;
        }
        this.cargando = false;
      },
      error: () => {
        this.dias = this.armarEstructuraSemana();
        this.cargarSemanaPorDia();
      },
    });
  }

  /** Respaldo si el endpoint semanal no está disponible */
  private cargarSemanaPorDia(): void {
    let pendientes = 7;
    const actualizados = this.armarEstructuraSemana();

    const finalizar = () => {
      pendientes--;
      if (pendientes <= 0) {
        this.dias = [...actualizados];
        this.cargando = false;
      }
    };

    for (let i = 0; i < 7; i++) {
      const fecha = actualizados[i].fecha;
      this.api.getDisponibilidadCancha(fecha, this.espacio).subscribe({
        next: (slots) => {
          actualizados[i].slots = this.mapearSlots(slots);
          finalizar();
        },
        error: () => {
          actualizados[i].slots = [];
          finalizar();
        },
      });
    }
  }
}
