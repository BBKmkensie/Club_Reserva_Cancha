import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Taller } from '../../models/taller.model';

interface InscripcionTaller {
  id: number;
  alumnoId: number;
  tallerId: number;
  estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  taller?: { id: number; tipo: string; descripcion: string };
}

@Component({
  selector: 'app-inscripcion-talleres',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Inscripción de Talleres</h1>
        <p class="text-gray-600">Solicita tu inscripción en los talleres disponibles. El profesor del taller aceptará o rechazará tu solicitud.</p>
      </div>

      <!-- Estado de solicitudes: siempre visible para estudiante -->
      @if (auth.canInscribirseTalleres()) {
        <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-primary-200">
          <h2 class="text-2xl font-bold text-gray-800 mb-1">Estado de tus solicitudes</h2>
          <p class="text-gray-600 text-sm mb-4">Aquí ves si fuiste <strong>aceptado</strong> o <strong>rechazado</strong> en cada taller.</p>
          @if (!alumnoId) {
            <p class="text-amber-700 bg-amber-50 py-3 px-4 rounded-lg">No se detectó tu usuario. Cierra sesión y entra de nuevo eligiendo tu nombre en la lista de estudiantes.</p>
          } @else if (misSolicitudes.length === 0) {
            <p class="text-gray-500 py-2">Aún no has enviado solicitudes. Elige un taller abajo y haz clic en "Inscribirse".</p>
          } @else {
            <ul class="space-y-3">
              @for (s of misSolicitudes; track s.id) {
                <li class="flex items-center justify-between py-3 px-4 rounded-lg border-2"
                    [class.bg-amber-50]="s.estado === 'PENDIENTE'"
                    [class.border-amber-300]="s.estado === 'PENDIENTE'"
                    [class.bg-green-50]="s.estado === 'ACEPTADO'"
                    [class.border-green-300]="s.estado === 'ACEPTADO'"
                    [class.bg-red-50]="s.estado === 'RECHAZADO'"
                    [class.border-red-300]="s.estado === 'RECHAZADO'">
                  <span class="font-semibold text-gray-800">{{ nombreTaller(s) }}</span>
                  <span class="text-base font-bold px-3 py-1 rounded-full"
                        [class.text-amber-800]="s.estado === 'PENDIENTE'"
                        [class.bg-amber-200]="s.estado === 'PENDIENTE'"
                        [class.text-green-800]="s.estado === 'ACEPTADO'"
                        [class.bg-green-200]="s.estado === 'ACEPTADO'"
                        [class.text-red-800]="s.estado === 'RECHAZADO'"
                        [class.bg-red-200]="s.estado === 'RECHAZADO'">
                    {{ s.estado === 'PENDIENTE' ? '⏳ Pendiente' : s.estado === 'ACEPTADO' ? '✓ Aceptado' : '✗ Rechazado' }}
                  </span>
                </li>
              }
            </ul>
          }
        </div>
      }

      <!-- Talleres disponibles con botón Inscribirse -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Talleres disponibles</h2>
        <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          @for (taller of talleres; track taller.id) {
            <div class="border rounded-lg p-4 flex flex-col">
              <h3 class="font-semibold text-gray-800 text-lg">{{ taller.tipo }}</h3>
              <p class="text-sm text-gray-600 mt-1 flex-1">{{ taller.descripcion }}</p>
              <div class="flex items-center justify-between mt-3">
                <span class="text-sm text-gray-500">Capacidad: {{ taller.capacidad }}</span>
                @if (auth.canInscribirseTalleres() && alumnoId) {
                  <div class="flex items-center gap-2">
                    @if (estadoSolicitud(taller.id) === 'PENDIENTE') {
                      <span class="text-sm text-amber-600 font-medium">Solicitud enviada</span>
                    } @else if (estadoSolicitud(taller.id) === 'ACEPTADO') {
                      <span class="text-sm text-green-600 font-medium">Inscrito</span>
                    } @else if (estadoSolicitud(taller.id) === 'RECHAZADO') {
                      <button (click)="inscribirse(taller)"
                              class="text-sm text-primary-600 hover:underline">Volver a solicitar</button>
                    } @else {
                      <a [routerLink]="['/taller', taller.id]" class="text-sm text-primary-600 hover:underline mr-2">Ver detalle</a>
                      <button (click)="inscribirse(taller)"
                              class="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-700">
                        Inscribirse
                      </button>
                    }
                  </div>
                } @else {
                  <a [routerLink]="['/taller', taller.id]" class="text-primary-600 text-sm hover:underline">Ver detalle</a>
                }
              </div>
            </div>
          }
        </div>
        @if (talleres.length === 0) {
          <p class="text-gray-500 py-6 text-center">No hay talleres disponibles</p>
        }
      </div>
    </div>
  `,
  styles: []
})
export class InscripcionTalleresComponent implements OnInit {
  private apiService = inject(ApiService);
  auth = inject(AuthRoleService);

  talleres: Taller[] = [];
  misSolicitudes: InscripcionTaller[] = [];
  alumnoId: number | null = null;
  enviando: number | null = null;

  ngOnInit() {
    this.cargarTalleres();
    this.alumnoId = this.auth.currentUserId();
    if (this.alumnoId) {
      this.cargarMisSolicitudes();
    }
  }

  cargarTalleres() {
    this.apiService.getTalleres().subscribe({
      next: (data) => this.talleres = data,
      error: (err) => console.error('Error cargando talleres:', err)
    });
  }

  cargarMisSolicitudes() {
    if (!this.alumnoId) return;
    this.apiService.getInscripcionesTallerPorAlumno(this.alumnoId).subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.misSolicitudes = list.map((s: any) => ({
          ...s,
          estado: String(s.estado || '').toUpperCase() as 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'
        }));
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
        this.misSolicitudes = [];
      }
    });
  }

  estadoSolicitud(tallerId: number): 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' | null {
    const s = this.misSolicitudes.find(x => x.tallerId === tallerId || x.taller?.id === tallerId);
    return s ? (s.estado as 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO') : null;
  }

  nombreTaller(s: InscripcionTaller): string {
    return s.taller?.tipo ?? (typeof s.tallerId === 'number' ? `Taller #${s.tallerId}` : 'Taller');
  }

  inscribirse(taller: Taller) {
    if (!this.alumnoId) {
      alert('Inicia sesión como estudiante para inscribirte.');
      return;
    }
    this.enviando = taller.id;
    this.apiService.solicitarInscripcionTaller(this.alumnoId, taller.id).subscribe({
      next: () => {
        this.enviando = null;
        this.cargarMisSolicitudes();
        alert('Solicitud enviada. El profesor del taller la revisará.');
      },
      error: (err) => {
        this.enviando = null;
        const msg = err?.error?.message || err?.message || 'No se pudo enviar la solicitud.';
        alert(msg);
      }
    });
  }
}
