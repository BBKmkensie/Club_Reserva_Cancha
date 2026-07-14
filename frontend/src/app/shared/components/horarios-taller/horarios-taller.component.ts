/**
 * =============================================================================
 * app/shared/components/horarios-taller/horarios-taller.component.ts — Tabla de horarios
 * =============================================================================
 * Presenta los bloques horarios de un taller en formato de tarjetas (móvil) o
 * tabla (escritorio). Adapta columnas según el modo: por curso, por sección o
 * horario semanal único. Se usa en detalle de taller y gestión de actividades.
 *
 * Inputs: taller (requerido), mostrarTitulo (boolean).
 * Métodos clave: etiqueta(), diaLabel(), trackHorario().
 * =============================================================================
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TallerConHorarios,
  TallerHorarioItem,
  ModoHorarioTaller,
  horariosOrdenados,
  horariosSinGrupo,
  etiquetaGrupoHorario,
  tituloTablaHorarios,
  textoHorarioTaller,
  fmtHora,
  DIAS_SEMANA,
} from '../../utils/horario-taller.util';

@Component({
  selector: 'app-horarios-taller',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (filas.length) {
      @if (mostrarTitulo) {
        <h3 class="text-base sm:text-lg font-semibold text-ink mb-2">{{ titulo }}</h3>
      }

      <!-- Móvil: lista de tarjetas -->
      <ul class="md:hidden space-y-2">
        @for (h of filas; track trackHorario(h)) {
          <li class="rounded-lg border border-line bg-page p-3">
            <div class="flex items-start justify-between gap-2">
              @if (mostrarGrupo) {
                <p class="font-semibold text-ink text-sm leading-snug">{{ etiqueta(h) }}</p>
              } @else {
                <p class="font-semibold text-ink text-sm leading-snug">{{ diaLabel(h.diaSemana) }}</p>
              }
              <span class="shrink-0 text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                {{ fmtHora(h.horaInicio) }}–{{ fmtHora(h.horaFin) }}
              </span>
            </div>
            @if (mostrarGrupo) {
              <p class="text-xs text-ink-muted mt-1">{{ diaLabel(h.diaSemana) }}</p>
            }
          </li>
        }
      </ul>

      <!-- Tablet / escritorio: tabla -->
      <div class="hidden md:block overflow-x-auto border border-line rounded-lg">
        <table class="min-w-full text-sm">
          <thead class="bg-page text-ink-muted">
            <tr>
              @if (mostrarGrupo) {
                <th class="text-left px-3 py-2 font-medium">{{ etiquetaColumna }}</th>
              }
              <th class="text-left px-3 py-2 font-medium">Día</th>
              <th class="text-left px-3 py-2 font-medium">Horario</th>
            </tr>
          </thead>
          <tbody>
            @for (h of filas; track trackHorario(h)) {
              <tr class="border-t border-line">
                @if (mostrarGrupo) {
                  <td class="px-3 py-2 font-medium text-ink">{{ etiqueta(h) }}</td>
                }
                <td class="px-3 py-2 text-ink-muted">{{ diaLabel(h.diaSemana) }}</td>
                <td class="px-3 py-2 text-ink-muted whitespace-nowrap">{{ fmtHora(h.horaInicio) }} – {{ fmtHora(h.horaFin) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else if (textoFallback) {
      <p class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{{ textoFallback }}</p>
    }
  `,
})
export class HorariosTallerComponent {
  /** Taller cuyos horarios se van a mostrar (obligatorio). */
  @Input({ required: true }) taller!: TallerConHorarios;

  /** Si es false, oculta el título encima de la tabla o lista. */
  @Input() mostrarTitulo = true;

  /** Filas de horario ordenadas según el modo del taller (curso, sección o semanal). */
  get filas(): TallerHorarioItem[] {
    return horariosOrdenados(this.taller);
  }

  /** Modo de agrupación de horarios: POR_CURSO o POR_SECCION. */
  get modo(): ModoHorarioTaller {
    return this.taller.modoHorario ?? 'POR_CURSO';
  }

  /** Indica si se debe mostrar la columna de curso/sección (false en horario semanal). */
  get mostrarGrupo(): boolean {
    return !horariosSinGrupo(this.taller);
  }

  /** Título dinámico de la sección según el tipo de horario del taller. */
  get titulo(): string {
    return tituloTablaHorarios(this.taller);
  }

  /** Encabezado de la columna de agrupación: «Curso» o «Sección». */
  get etiquetaColumna(): string {
    return this.modo === 'POR_SECCION' ? 'Sección' : 'Curso';
  }

  /** Mensaje de aviso cuando el taller aún no tiene horarios configurados. */
  get textoFallback(): string {
    return textoHorarioTaller(this.taller);
  }

  /**
   * Etiqueta legible del grupo (curso o sección) para un bloque horario.
   */
  etiqueta(h: TallerHorarioItem): string {
    return etiquetaGrupoHorario(h, this.modo);
  }

  /**
   * Nombre del día de la semana a partir de su índice numérico (1 = lunes).
   */
  diaLabel(dia: number): string {
    return DIAS_SEMANA[dia] ?? `Día ${dia}`;
  }

  /** Referencia a la utilidad de formateo de hora para usar en la plantilla. */
  fmtHora = fmtHora;

  /**
   * Clave única para el track de @for en la plantilla (evita re-render innecesario).
   */
  trackHorario(h: TallerHorarioItem): string {
    return `${h.curso ?? ''}-${h.seccion ?? ''}-${h.diaSemana}-${h.horaInicio}`;
  }
}
