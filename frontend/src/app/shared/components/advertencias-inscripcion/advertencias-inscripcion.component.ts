/**
 * =============================================================================
 * app/shared/components/advertencias-inscripcion/advertencias-inscripcion.component.ts — Avisos de inscripción
 * =============================================================================
 * Bloque de alertas visuales mostradas durante el flujo de inscripción a talleres.
 * Lista mensajes de validación o conflictos detectados antes de confirmar.
 * Se usa en inscripcion-talleres y gestion-inscripciones.
 *
 * Inputs: advertencias (arreglo de mensajes de texto).
 * Función exportada: tallerSinProfesor() — valida si un taller carece de docente.
 * =============================================================================
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class AdvertenciasInscripcionComponent {
  /**
   * Lista de mensajes de advertencia a mostrar. Si está vacía o es null,
   * el componente no renderiza nada.
   */
  @Input() advertencias: string[] | null | undefined = [];
}

/**
 * Indica si un taller no tiene profesores asignados.
 * Útil para mostrar una advertencia antes de permitir la inscripción.
 */
export function tallerSinProfesor(taller: { profesores?: unknown[] | null } | null | undefined): boolean {
  return !taller?.profesores?.length;
}
