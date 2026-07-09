/**
 * Selector de hora con minutos en intervalos de 15.
 * Implementa ControlValueAccessor para integrarse con formularios reactivos o template-driven.
 */
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HORAS_SELECTOR } from '../../utils/cancha.constants';

/**
 * HoraPicker: dos desplegables (hora y minutos) con valor en formato HH:mm.
 */
@Component({
  selector: 'app-hora-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HoraPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="hora-picker w-full">
      <div class="flex items-center gap-2">
        <select
          class="flex-1 min-w-0 border border-line-strong rounded-lg px-3 py-2 bg-surface text-ink focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-muted disabled:text-ink-muted"
          [(ngModel)]="hora"
          (ngModelChange)="emitir()"
          [disabled]="disabled"
          aria-label="Hora">
          @if (opcional) {
            <option value="">Hora</option>
          }
          @for (h of horas; track h) {
            <option [value]="h">{{ h }}</option>
          }
        </select>
        <span class="text-ink-muted font-semibold select-none">:</span>
        <select
          class="flex-1 min-w-0 border border-line-strong rounded-lg px-3 py-2 bg-surface text-ink focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-muted disabled:text-ink-muted"
          [(ngModel)]="minuto"
          (ngModelChange)="emitir()"
          [disabled]="disabled || !hora"
          aria-label="Minutos">
          @for (m of minutos; track m) {
            <option [value]="m">{{ m }}</option>
          }
        </select>
      </div>
      @if (hora && minuto) {
        <p class="mt-1.5 text-xs text-ink-muted">
          {{ hora }}:{{ minuto }} hrs
        </p>
      }
    </div>
  `,
})
/**
 * Control de hora reutilizable; sincroniza el valor con el formulario padre vía CVA.
 */
export class HoraPickerComponent implements ControlValueAccessor {
  @Input() opcional = true;

  hora = '';
  minuto = '00';
  disabled = false;

  readonly horas = HORAS_SELECTOR;
  readonly minutos = ['00', '15', '30', '45'];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    if (!value) {
      this.hora = '';
      this.minuto = '00';
      return;
    }
    const partes = value.slice(0, 5).split(':');
    const h = partes[0] ?? '';
    const m = partes[1] ?? '00';
    this.hora = this.horas.includes(h) ? h : '';
    this.minuto = this.minutos.includes(m) ? m : '00';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Propaga el valor HH:mm al formulario y marca el control como tocado. */
  emitir(): void {
    if (!this.hora) {
      this.minuto = '00';
      this.onChange('');
    } else {
      if (!this.minutos.includes(this.minuto)) {
        this.minuto = '00';
      }
      this.onChange(`${this.hora}:${this.minuto}`);
    }
    this.onTouched();
  }
}
