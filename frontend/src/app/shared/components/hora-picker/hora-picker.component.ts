/**
 * =============================================================================
 * app/shared/components/hora-picker/hora-picker.component.ts — Selector de hora
 * =============================================================================
 * Dos desplegables (hora y minutos en intervalos de 15) que emiten un valor
 * en formato HH:mm. Implementa ControlValueAccessor para formularios Angular.
 * Se usa en reservas de cancha y configuración de horarios de talleres.
 *
 * Inputs: opcional (permite dejar la hora vacía).
 * Métodos clave: emitir(), writeValue() (CVA).
 * =============================================================================
 */
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HORAS_SELECTOR } from '../../utils/cancha.constants';

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
export class HoraPickerComponent implements ControlValueAccessor {
  /** Si es true, el selector de hora incluye una opción vacía. */
  @Input() opcional = true;

  /** Hora elegida «HH» (vacía si opcional y sin selección). */
  hora = '';
  /** Minutos en pasos de 15: 00 / 15 / 30 / 45. */
  minuto = '00';
  /** true cuando el FormControl padre está deshabilitado. */
  disabled = false;

  /** Lista de horas del día para el primer select. */
  readonly horas = HORAS_SELECTOR;
  /** Opciones de minutos del segundo select. */
  readonly minutos = ['00', '15', '30', '45'];

  /** Callback CVA: emite «HH:mm» al padre. */
  private onChange: (value: string) => void = () => {};
  /** Callback CVA: marca el control como tocado. */
  private onTouched: () => void = () => {};

  /**
   * Recibe el valor inicial desde el formulario padre y lo descompone en hora
   * y minuto (interfaz ControlValueAccessor).
   */
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

  /** Registra el callback que notifica cambios al formulario padre (interfaz CVA). */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /** Registra el callback que marca el control como tocado (interfaz CVA). */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** Activa o desactiva los desplegables según el estado del formulario (interfaz CVA). */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Propaga el valor HH:mm al formulario padre y marca el control como tocado.
   * Si no hay hora seleccionada, emite cadena vacía.
   */
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
