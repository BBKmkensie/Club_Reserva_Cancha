import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';

@Component({
  selector: 'app-mis-salidas',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Mis salidas</h1>
        <p class="text-gray-600">Salidas en las que estás inscrito (el profesor te asigna o te inscribes tú)</p>
      </div>

      @if (!alumnoId) {
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          Debes entrar como <strong>Estudiante</strong> y seleccionar tu cuenta en la página de inicio de sesión para poder inscribirte.
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Salidas a las que estoy asignado</h2>
          @if (misInscripciones.length > 0) {
            <ul class="space-y-3 mb-6">
              @for (insc of misInscripciones; track insc.id) {
                <li class="flex justify-between items-center py-3 px-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div>
                    <span class="font-medium text-gray-800">{{ insc.salida?.destino }}</span>
                    <span class="text-gray-600 text-sm block mt-0.5">{{ insc.salida?.fecha | date:'fullDate' }}{{ insc.salida?.hora ? ' · ' + insc.salida.hora : '' }}</span>
                    @if (insc.salida?.descripcion) {
                      <p class="text-sm text-gray-500 mt-1">{{ insc.salida.descripcion }}</p>
                    }
                  </div>
                  <button (click)="desinscribir(insc.salidaId)" class="text-red-600 hover:underline text-sm flex-shrink-0">Desinscribirme</button>
                </li>
              }
            </ul>
          } @else {
            <p class="text-gray-500 mb-6">Aún no estás inscrito en ninguna salida. El profesor puede asignarte a una salida desde "Inscripción de Salidas", o puedes inscribirte tú en las salidas disponibles abajo.</p>
          }
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Salidas disponibles</h2>
          <div class="space-y-4">
            @for (salida of salidas; track salida.id) {
              <div class="border border-gray-200 rounded-lg p-4 flex justify-between items-start gap-4">
                <div>
                  <h3 class="font-semibold text-gray-800">{{ salida.destino }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ salida.descripcion || 'Sin descripción' }}</p>
                  <div class="text-sm text-gray-500 mt-2">
                    {{ salida.fecha | date:'fullDate' }}
                    @if (salida.hora) { · {{ salida.hora }} }
                  </div>
                  @if (salida.taller) {
                    <p class="text-sm text-gray-600 mt-1">Taller: {{ salida.taller.tipo }}</p>
                  }
                </div>
                @if (yaInscrito(salida.id)) {
                  <span class="text-green-600 text-sm font-medium">Inscrito</span>
                } @else {
                  <button (click)="inscribir(salida.id)"
                          class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm">
                    Inscribirme
                  </button>
                }
              </div>
            }
            @if (salidas.length === 0) {
              <p class="text-gray-500">No hay salidas disponibles para inscribirse.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class MisSalidasComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthRoleService);

  salidas: any[] = [];
  misInscripciones: any[] = [];
  alumnoId: number | null = null;

  ngOnInit(): void {
    this.alumnoId = this.auth.currentUserId();
    this.cargarSalidas();
    if (this.alumnoId) {
      this.api.getInscripcionesPorAlumno(this.alumnoId).subscribe({
        next: (data) => this.misInscripciones = data,
        error: () => this.misInscripciones = []
      });
    }
  }

  private cargarSalidas(): void {
    this.api.getSalidas().subscribe({
      next: (data) => this.salidas = data,
      error: () => this.salidas = []
    });
  }

  yaInscrito(salidaId: number): boolean {
    return this.misInscripciones.some(i => i.salidaId === salidaId || i.salida?.id === salidaId);
  }

  inscribir(salidaId: number): void {
    if (!this.alumnoId) return;
    this.api.inscribirSalida(this.alumnoId, salidaId).subscribe({
      next: () => {
        this.api.getInscripcionesPorAlumno(this.alumnoId!).subscribe({
          next: (data) => this.misInscripciones = data
        });
      },
      error: (err) => {
        alert(err?.error?.message || 'Error al inscribirse');
      }
    });
  }

  desinscribir(salidaId: number): void {
    if (!this.alumnoId) return;
    if (!confirm('¿Desinscribirse de esta salida?')) return;
    this.api.desinscribirSalida(this.alumnoId, salidaId).subscribe({
      next: () => {
        this.api.getInscripcionesPorAlumno(this.alumnoId!).subscribe({
          next: (data) => this.misInscripciones = data
        });
      },
      error: () => alert('Error al desinscribirse')
    });
  }
}
