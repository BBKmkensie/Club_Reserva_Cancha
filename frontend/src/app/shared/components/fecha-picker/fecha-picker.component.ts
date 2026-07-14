/**
 * =============================================================================
 * app/shared/components/fecha-picker/fecha-picker.component.ts — Selector de fecha
 * =============================================================================
 * Campo con calendario desplegable mensual. Implementa ControlValueAccessor para
 * integrarse con formularios reactivos o template-driven. Emite fechas en formato
 * ISO (YYYY-MM-DD). Se usa en reservas, asistencia y filtros de fechas.
 *
 * Inputs: anchoCompleto (boolean).
 * Métodos clave: toggle(), elegir(), irHoy(), mesAnterior(), mesSiguiente().
 * =============================================================================
 */
import { Component, ElementRef, HostListener, Input, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  MESES,
  CeldaMes,
  celdasDelMes,
  esHoy,
  etiquetaDiaCorto,
  parseFechaIso,
} from '../../utils/fecha-semana.util';

@Component({
  selector: 'app-fecha-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FechaPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="fp-wrap relative w-full" [class.max-w-md]="!anchoCompleto">
      <div class="flex rounded-xl border border-line-strong bg-surface shadow-sm overflow-hidden">
        <div class="flex-1 min-w-0 px-4 py-3 text-sm font-semibold text-ink truncate">
          @if (valor) {
            {{ etiquetaDiaCorto(valor) }}
          } @else {
            <span class="text-ink-muted font-normal">Seleccione una fecha</span>
          }
        </div>
        <button type="button"
                (click)="toggle($event)"
                class="fp-trigger shrink-0 px-4 border-l border-line bg-page transition"
                [class.fp-trigger--open]="abierto"
                [attr.aria-expanded]="abierto"
                aria-label="Abrir calendario">
          <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </button>
      </div>

      @if (abierto) {
        <div class="fp-panel absolute z-50 top-full left-0 mt-2 w-full min-w-[20rem] border border-line rounded-xl bg-surface shadow-xl overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-line">
            <button type="button" (click)="mesAnterior()" class="fp-nav" aria-label="Mes anterior">‹</button>
            <span class="text-base font-bold text-primary-500">{{ MESES[mesVisible] }} {{ anioVisible }}</span>
            <button type="button" (click)="mesSiguiente()" class="fp-nav" aria-label="Mes siguiente">›</button>
          </div>

          <div class="px-3 pt-3 pb-2">
            <div class="grid grid-cols-7 mb-2">
              @for (letra of letrasSemana; track letra) {
                <span class="text-center text-xs font-semibold text-ink-muted uppercase py-1">{{ letra }}</span>
              }
            </div>
            <div class="grid grid-cols-7 gap-1">
              @for (c of celdas; track c.fecha) {
                <button type="button"
                        (click)="elegir(c.fecha)"
                        class="fp-dia aspect-square flex items-center justify-center rounded-full text-sm font-semibold transition"
                        [class.fp-dia--sel]="valor === c.fecha"
                        [class.fp-dia--hoy]="esHoy(c.fecha) && valor !== c.fecha"
                        [class.fp-dia--otro]="!c.mesActual"
                        [class.fp-dia--normal]="c.mesActual && valor !== c.fecha && !esHoy(c.fecha)">
                  {{ c.num }}
                </button>
              }
            </div>
          </div>

          <div class="flex items-center justify-end px-4 py-3 bg-page border-t border-line">
            <button type="button" (click)="irHoy()" class="text-sm font-semibold text-primary-500 hover:text-primary-600">
              Ir a hoy
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .fp-trigger {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fp-trigger:hover,
    .fp-trigger--open {
      background: rgb(var(--color-accent-soft));
    }
    .fp-nav {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.5rem;
      color: rgb(var(--color-accent));
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    .fp-nav:hover {
      background: rgb(var(--color-accent-soft));
    }
    .fp-dia {
      border: none;
      background: transparent;
      cursor: pointer;
      min-height: 2.5rem;
    }
    .fp-dia--sel {
      background-color: rgb(var(--color-accent));
      color: #fff;
      box-shadow: 0 2px 8px rgba(var(--color-accent), 0.35);
    }
    .fp-dia--hoy {
      color: rgb(var(--color-accent));
      box-shadow: inset 0 0 0 2px rgb(var(--palette-sky));
    }
    .fp-dia--otro {
      color: rgb(var(--color-ink-muted));
      opacity: 0.5;
    }
    .fp-dia--normal {
      color: rgb(var(--color-ink));
    }
    .fp-dia--normal:hover,
    .fp-dia--hoy:hover {
      background-color: rgb(var(--color-muted));
    }
    .fp-dia--sel:hover {
      background-color: rgb(var(--color-accent-hover));
    }
  `],
})
export class FechaPickerComponent implements ControlValueAccessor {
  /** Si es true, el picker ocupa todo el ancho del contenedor padre. */
  @Input() anchoCompleto = false;

  private host = inject(ElementRef<HTMLElement>);

  readonly MESES = MESES;
  readonly esHoy = esHoy;
  readonly etiquetaDiaCorto = etiquetaDiaCorto;
  readonly letrasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  /** Fecha ISO seleccionada (YYYY-MM-DD) o '' si aún no hay valor. */
  valor = '';
  /** Mes mostrado en la grilla (0 = enero). */
  mesVisible = new Date().getMonth();
  /** Año mostrado en la grilla. */
  anioVisible = new Date().getFullYear();
  /** 42 celdas (6 semanas) del mes visible. */
  celdas: CeldaMes[] = [];
  /** true = panel del calendario abierto. */
  abierto = false;

  /** Callback CVA: notifica al FormControl padre el YYYY-MM-DD elegido. */
  private onChange: (value: string) => void = () => {};
  /** Callback CVA: marca el control como «touched». */
  private onTouched: () => void = () => {};

  constructor() {
    this.actualizarGrilla();
  }

  /** Cierra el panel del calendario si el usuario hace clic fuera del componente. */
  @HostListener('document:click', ['$event'])
  cerrarSiClickFuera(event: MouseEvent): void {
    if (!this.abierto) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.abierto = false;
    }
  }

  /** Recibe el valor inicial desde el formulario padre (interfaz CVA). */
  writeValue(value: string | null): void {
    if (!value) {
      this.valor = '';
      return;
    }
    this.valor = parseFechaIso(value);
    this.sincronizarMesConValor();
    this.actualizarGrilla();
  }

  /** Registra el callback que notifica cambios al formulario padre (interfaz CVA). */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /** Registra el callback que marca el control como tocado (interfaz CVA). */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {}

  /**
   * Abre o cierra el panel del calendario. Al abrir, centra el mes en la fecha
   * seleccionada o en el día actual si no hay valor.
   */
  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.abierto = !this.abierto;
    if (this.abierto) {
      if (!this.valor) {
        const hoy = new Date();
        this.mesVisible = hoy.getMonth();
        this.anioVisible = hoy.getFullYear();
      } else {
        this.sincronizarMesConValor();
      }
      this.actualizarGrilla();
    }
  }

  /**
   * Confirma la fecha seleccionada, notifica al formulario padre y cierra el panel.
   */
  elegir(fecha: string): void {
    this.valor = fecha;
    this.sincronizarMesConValor();
    this.onChange(fecha);
    this.onTouched();
    this.abierto = false;
  }

  /**
   * Selecciona el día de hoy y cierra el panel del calendario.
   */
  irHoy(): void {
    this.elegir(parseFechaIso(new Date()));
  }

  /**
   * Retrocede un mes en la grilla del calendario.
   */
  mesAnterior(): void {
    if (this.mesVisible === 0) {
      this.mesVisible = 11;
      this.anioVisible--;
    } else {
      this.mesVisible--;
    }
    this.actualizarGrilla();
  }

  /**
   * Avanza un mes en la grilla del calendario.
   */
  mesSiguiente(): void {
    if (this.mesVisible === 11) {
      this.mesVisible = 0;
      this.anioVisible++;
    } else {
      this.mesVisible++;
    }
    this.actualizarGrilla();
  }

  /** Ajusta mesVisible/anioVisible para que la grilla muestre el mes de `valor`. */
  private sincronizarMesConValor(): void {
    if (!this.valor) return;
    const d = new Date(`${this.valor}T12:00:00`);
    this.mesVisible = d.getMonth();
    this.anioVisible = d.getFullYear();
  }

  /** Regenera las 42 celdas del mes/año visibles. */
  private actualizarGrilla(): void {
    this.celdas = celdasDelMes(this.anioVisible, this.mesVisible);
  }
}
