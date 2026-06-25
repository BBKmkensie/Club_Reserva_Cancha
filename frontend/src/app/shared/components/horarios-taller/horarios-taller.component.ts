import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TallerConHorarios,
  TallerHorarioItem,
  ModoHorarioTaller,
  horariosOrdenados,
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
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-2">{{ titulo }}</h3>
      }

      <!-- Móvil: lista de tarjetas -->
      <ul class="md:hidden space-y-2">
        @for (h of filas; track trackHorario(h)) {
          <li class="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div class="flex items-start justify-between gap-2">
              <p class="font-semibold text-gray-800 text-sm leading-snug">{{ etiqueta(h) }}</p>
              <span class="shrink-0 text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                {{ fmtHora(h.horaInicio) }}–{{ fmtHora(h.horaFin) }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ diaLabel(h.diaSemana) }}</p>
          </li>
        }
      </ul>

      <!-- Tablet / escritorio: tabla -->
      <div class="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="text-left px-3 py-2 font-medium">{{ etiquetaColumna }}</th>
              <th class="text-left px-3 py-2 font-medium">Día</th>
              <th class="text-left px-3 py-2 font-medium">Horario</th>
            </tr>
          </thead>
          <tbody>
            @for (h of filas; track trackHorario(h)) {
              <tr class="border-t border-gray-100">
                <td class="px-3 py-2 font-medium text-gray-800">{{ etiqueta(h) }}</td>
                <td class="px-3 py-2 text-gray-600">{{ diaLabel(h.diaSemana) }}</td>
                <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ fmtHora(h.horaInicio) }} – {{ fmtHora(h.horaFin) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else if (textoFallback) {
      <p class="text-sm text-gray-500">{{ textoFallback }}</p>
    }
  `,
})
export class HorariosTallerComponent {
  @Input({ required: true }) taller!: TallerConHorarios;
  @Input() mostrarTitulo = true;

  get filas(): TallerHorarioItem[] {
    return horariosOrdenados(this.taller);
  }

  get modo(): ModoHorarioTaller {
    return this.taller.modoHorario ?? 'POR_CURSO';
  }

  get titulo(): string {
    return tituloTablaHorarios(this.modo);
  }

  get etiquetaColumna(): string {
    return this.modo === 'POR_SECCION' ? 'Sección' : 'Curso';
  }

  get textoFallback(): string {
    return textoHorarioTaller(this.taller);
  }

  etiqueta(h: TallerHorarioItem): string {
    return etiquetaGrupoHorario(h, this.modo);
  }

  diaLabel(dia: number): string {
    return DIAS_SEMANA[dia] ?? `Día ${dia}`;
  }

  fmtHora = fmtHora;

  trackHorario(h: TallerHorarioItem): string {
    return `${h.curso ?? ''}-${h.seccion ?? ''}-${h.diaSemana}-${h.horaInicio}`;
  }
}
