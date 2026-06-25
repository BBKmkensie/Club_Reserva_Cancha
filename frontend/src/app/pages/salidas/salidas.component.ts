import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Salida, etiquetaFlujoSalida, etiquetaEstadoSalida } from '../../models/salida.model';

@Component({
  selector: 'app-salidas',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Salidas programadas</h1>
        <p class="text-gray-600 mt-1">Historial con profesor responsable, origen y resultado al cerrar.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (salida of salidas; track salida.id) {
          <div class="bg-white rounded-xl shadow p-6 border-l-4"
               [class.border-purple-500]="salida.estado === 'PUBLICADA'"
               [class.border-blue-500]="salida.estado === 'EN_CURSO'"
               [class.border-green-500]="salida.estado === 'CERRADA' && salida.resultado === 'EXITO'"
               [class.border-red-500]="salida.estado === 'CERRADA' && salida.resultado === 'FRACASO'"
               [class.border-amber-500]="salida.estado === 'PENDIENTE_PROFESOR' || salida.estado === 'PENDIENTE_DIRECTIVA'">
            <h3 class="text-xl font-semibold text-gray-800">{{ salida.destino }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ salida.fecha | date:'fullDate' }} @if (salida.hora) { · {{ salida.hora }} }</p>
            <p class="text-sm text-gray-600 mt-2">Profesor: <strong>{{ salida.profesor?.nombre || '—' }}</strong></p>
            <p class="text-sm text-gray-600">Taller: {{ salida.taller?.tipo || '—' }}</p>
            @if (salida.descripcion) {
              <p class="text-sm text-gray-500 mt-2">{{ salida.descripcion }}</p>
            }
            <p class="text-xs text-primary-700 mt-2">{{ etiqueta(salida) }}</p>
            <span class="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {{ estadoLabel(salida) }}
            </span>
            @if (salida.estado === 'CERRADA') {
              <div class="mt-3 p-2 rounded text-sm"
                   [class.bg-green-50]="salida.resultado === 'EXITO'"
                   [class.text-green-800]="salida.resultado === 'EXITO'"
                   [class.bg-red-50]="salida.resultado === 'FRACASO'"
                   [class.text-red-800]="salida.resultado === 'FRACASO'">
                {{ salida.resultado === 'EXITO' ? '✓ Salida exitosa' : '✗ Salida con dificultades' }}
                @if (salida.comentarioCierre) {
                  <p class="mt-1 italic">"{{ salida.comentarioCierre }}"</p>
                }
              </div>
            }
          </div>
        }
        @if (salidas.length === 0) {
          <div class="col-span-full text-center text-gray-500 py-12">No hay salidas registradas</div>
        }
      </div>
    </div>
  `,
})
export class SalidasComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthRoleService);

  salidas: Salida[] = [];

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.api.getSalidas().subscribe({
      next: (d) => (this.salidas = d),
      error: () => (this.salidas = []),
    });
  }

  etiqueta(s: Salida) { return etiquetaFlujoSalida(s); }
  estadoLabel(s: Salida) { return etiquetaEstadoSalida(s); }
}
