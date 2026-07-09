/**
 * Bloque de advertencias mostradas durante el flujo de inscripción a talleres.
 * Lista mensajes de validación o conflictos detectados antes de confirmar.
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * AdvertenciasInscripcion: alertas visuales con los avisos del proceso de inscripción.
 */
@Component({
  selector: 'app-advertencias-inscripcion',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (advertencias?.length) {
      <div class="space-y-2 mb-4">
        @for (msg of advertencias; track msg) {
          <p class="text-sm text-amber-900 bg-amber-50 border border-amber-300 rounded-lg p-3">
            <span class="font-semibold">Advertencia:</span> {{ msg }}
          </p>
        }
      </div>
    }
  `,
})
/**
 * Renderiza una lista de mensajes de advertencia sin lógica adicional de negocio.
 */
export class AdvertenciasInscripcionComponent {
  @Input() advertencias: string[] | null | undefined = [];
}

export function tallerSinProfesor(taller: { profesores?: unknown[] | null } | null | undefined): boolean {
  return !taller?.profesores?.length;
}
