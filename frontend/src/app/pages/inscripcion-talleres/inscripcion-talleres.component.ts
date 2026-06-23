import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

interface ValidacionInscripcion {
  puedeInscribirse: boolean;
  cuposOcupados: number;
  cuposDisponibles: number;
  capacidad: number;
  conflictoHorario: boolean;
  sinCupo?: boolean;
  tallerConflicto?: string;
  motivo?: string;
}

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

@Component({
  selector: 'app-inscripcion-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Inscripción en Talleres</h1>
        <p class="text-gray-600">
          Explora el catálogo, selecciona un taller y confirma tu inscripción.
          El sistema valida cupos y conflictos de horario antes de registrar tu solicitud.
        </p>
        @if (auth.canProponerActividad()) {
          <div class="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-teal-900">
              @if (auth.isAlumno()) {
                ¿No encuentras el taller que buscas (Zumba, Cocina, etc.)? Propón una nueva actividad al coordinador.
              } @else {
                ¿Te gustaría otro taller? Envía una propuesta al coordinador.
              }
            </p>
            <a routerLink="/propuestas-actividad"
               class="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 whitespace-nowrap">
              Proponer actividad →
            </a>
          </div>
        }
      </div>

      @if (auth.canInscribirseTalleres()) {
        <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-primary-200">
          <h2 class="text-2xl font-bold text-gray-800 mb-1">Estado de tus solicitudes</h2>
          <p class="text-gray-600 text-sm mb-4">Aquí ves si fuiste <strong>aceptado</strong> o <strong>rechazado</strong> en cada taller.</p>
          @if (!alumnoId) {
            <p class="text-amber-700 bg-amber-50 py-3 px-4 rounded-lg">
              Inicia sesión como estudiante eligiendo tu nombre en /login.
            </p>
          } @else if (misSolicitudes.length === 0) {
            <p class="text-gray-500 py-2">Aún no has enviado solicitudes. Elige un taller abajo.</p>
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
                    {{ s.estado === 'PENDIENTE' ? 'Pendiente' : s.estado === 'ACEPTADO' ? 'Aceptado' : 'Rechazado' }}
                  </span>
                </li>
              }
            </ul>
          }
        </div>
      }

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Catálogo de actividades publicadas</h2>
        <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          @for (taller of talleres; track taller.id) {
            <div class="border rounded-lg p-4 flex flex-col hover:shadow-md transition">
              <h3 class="font-semibold text-gray-800 text-lg">{{ taller.tipo }}</h3>
              <p class="text-sm text-gray-600 mt-1 flex-1">{{ taller.descripcion }}</p>
              <p class="text-sm text-gray-500 mt-2">{{ textoHorario(taller) }}</p>
              <div class="flex items-center justify-between mt-3">
                <span class="text-sm text-gray-500">
                  Cupos: {{ cuposPorTaller[taller.id]?.cuposDisponibles ?? '—' }} / {{ taller.capacidad }}
                </span>
                @if (auth.canInscribirseTalleres() && alumnoId) {
                  <div class="flex items-center gap-2">
                    @if (estadoSolicitud(taller.id) === 'PENDIENTE') {
                      <span class="text-sm text-amber-600 font-medium">Solicitud enviada</span>
                    } @else if (estadoSolicitud(taller.id) === 'ACEPTADO') {
                      <span class="text-sm text-green-600 font-medium">Inscrito</span>
                    } @else if (estadoSolicitud(taller.id) === 'RECHAZADO') {
                      <button (click)="abrirConfirmacion(taller)"
                              class="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700">
                        Volver a solicitar
                      </button>
                    } @else {
                      <a [routerLink]="['/taller', taller.id]" class="text-sm text-primary-600 hover:underline mr-2">Ver detalle</a>
                      <button (click)="abrirConfirmacion(taller)"
                              [disabled]="enviando === taller.id"
                              class="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
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
          <p class="text-gray-500 py-6 text-center">No hay actividades publicadas en el catálogo</p>
        }
      </div>
    </div>

    @if (tallerConfirmando) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-2">Confirmar inscripción</h3>
          <p class="text-gray-600 mb-4">¿Deseas inscribirte en <strong>{{ tallerConfirmando.tipo }}</strong>?</p>

          <div class="bg-gray-50 rounded-lg p-4 text-sm space-y-2 mb-4">
            <p><strong>Horario:</strong> {{ textoHorario(tallerConfirmando) }}</p>
            @if (validacionActual) {
              <p><strong>Cupos disponibles:</strong> {{ validacionActual.cuposDisponibles }} de {{ validacionActual.capacidad }}</p>
            }
          </div>

          <div class="border border-primary-200 bg-primary-50 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-gray-800 mb-2">Ficha del alumno (por taller)</h4>
            <p class="text-xs text-gray-600 mb-3">Completa tus datos físicos. El profesor los verá al revisar tu solicitud.</p>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <label class="block">
                <span class="text-gray-700">Altura (cm)</span>
                <input type="number" [(ngModel)]="fichaForm.altura" min="50" max="250" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-gray-700">Peso (kg)</span>
                <input type="number" [(ngModel)]="fichaForm.peso" min="20" max="300" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-gray-700">% grasa corporal</span>
                <input type="number" [(ngModel)]="fichaForm.porcentajeGrasa" min="1" max="60" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-gray-700">¿Sedentario?</span>
                <select [(ngModel)]="fichaForm.sedentario" class="mt-1 w-full border rounded-lg px-2 py-1.5">
                  <option [ngValue]="true">Sí</option>
                  <option [ngValue]="false">No</option>
                </select>
              </label>
            </div>
          </div>

          @if (errorConfirmacion) {
            <p class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{{ errorConfirmacion }}</p>
          }

          <div class="flex gap-3 justify-end">
            <button (click)="cerrarConfirmacion()" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button (click)="confirmarInscripcion()"
                    [disabled]="!validacionActual?.puedeInscribirse || confirmando || !fichaValida()"
                    class="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
              {{ confirmando ? 'Enviando...' : 'Confirmar inscripción' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class InscripcionTalleresComponent implements OnInit {
  private apiService = inject(ApiService);
  auth = inject(AuthRoleService);

  talleres: Taller[] = [];
  misSolicitudes: InscripcionTaller[] = [];
  cuposPorTaller: Record<number, ValidacionInscripcion> = {};
  alumnoId: number | null = null;
  enviando: number | null = null;

  tallerConfirmando: Taller | null = null;
  validacionActual: ValidacionInscripcion | null = null;
  errorConfirmacion = '';
  confirmando = false;
  fichaForm = { altura: null as number | null, peso: null as number | null, porcentajeGrasa: null as number | null, sedentario: false };

  ngOnInit() {
    this.cargarTalleres();
    this.alumnoId = this.auth.currentUserId();
    if (this.alumnoId) {
      this.cargarMisSolicitudes();
    }
  }

  cargarTalleres() {
    this.apiService.getCatalogoTalleres().subscribe({
      next: (data) => {
        this.talleres = data;
        this.cargarCupos();
      },
      error: (err) => console.error('Error cargando catálogo:', err)
    });
  }

  cargarCupos() {
    if (!this.alumnoId) return;
    for (const taller of this.talleres) {
      this.apiService.validarInscripcionTaller(this.alumnoId, taller.id).subscribe({
        next: (v) => this.cuposPorTaller[taller.id] = v,
        error: () => {}
      });
    }
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
        this.cargarCupos();
      },
      error: () => this.misSolicitudes = []
    });
  }

  estadoSolicitud(tallerId: number): 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' | null {
    const s = this.misSolicitudes.find(x => x.tallerId === tallerId || x.taller?.id === tallerId);
    return s ? s.estado : null;
  }

  nombreTaller(s: InscripcionTaller): string {
    return s.taller?.tipo ?? `Taller #${s.tallerId}`;
  }

  textoHorario(taller: Taller): string {
    if (!taller.diaSemana || !taller.horaInicio || !taller.horaFin) {
      return 'Horario por confirmar';
    }
    const dia = DIAS_SEMANA[taller.diaSemana] ?? `Día ${taller.diaSemana}`;
    const inicio = taller.horaInicio.slice(0, 5);
    const fin = taller.horaFin.slice(0, 5);
    return `${dia} ${inicio} - ${fin}`;
  }

  abrirConfirmacion(taller: Taller) {
    if (!this.alumnoId) {
      alert('Inicia sesión como estudiante para inscribirte.');
      return;
    }
    this.tallerConfirmando = taller;
    this.validacionActual = null;
    this.errorConfirmacion = '';
    this.fichaForm = { altura: null, peso: null, porcentajeGrasa: null, sedentario: false };
    this.apiService.validarInscripcionTaller(this.alumnoId, taller.id, true).subscribe({
      next: (v) => {
        this.validacionActual = v;
        if (!v.puedeInscribirse) {
          const avisoNotificacion = v.conflictoHorario || v.sinCupo
            ? ' Revisa tu bandeja de notificaciones en el Dashboard.'
            : '';
          this.errorConfirmacion = (v.motivo ?? 'No puedes inscribirte en este taller') + avisoNotificacion;
        }
      },
      error: (err) => {
        this.errorConfirmacion = err?.error?.message || 'No se pudo validar la inscripción';
      }
    });
  }

  cerrarConfirmacion() {
    this.tallerConfirmando = null;
    this.validacionActual = null;
    this.errorConfirmacion = '';
    this.confirmando = false;
  }

  fichaValida(): boolean {
    const { altura, peso, porcentajeGrasa } = this.fichaForm;
    return altura != null && altura >= 50 && altura <= 250
      && peso != null && peso >= 20 && peso <= 300
      && porcentajeGrasa != null && porcentajeGrasa >= 1 && porcentajeGrasa <= 60;
  }

  confirmarInscripcion() {
    if (!this.tallerConfirmando || !this.alumnoId || !this.validacionActual?.puedeInscribirse || !this.fichaValida()) return;
    this.confirmando = true;
    this.apiService.solicitarInscripcionTaller(this.alumnoId, this.tallerConfirmando.id, {
      altura: Number(this.fichaForm.altura),
      peso: Number(this.fichaForm.peso),
      porcentajeGrasa: Number(this.fichaForm.porcentajeGrasa),
      sedentario: this.fichaForm.sedentario,
    }).subscribe({
      next: () => {
        this.confirmando = false;
        this.cerrarConfirmacion();
        this.cargarMisSolicitudes();
        alert('Solicitud registrada. Revisa tus notificaciones en el Dashboard.');
      },
      error: (err) => {
        this.confirmando = false;
        this.errorConfirmacion = err?.error?.message || 'No se pudo enviar la solicitud.';
      }
    });
  }
}
