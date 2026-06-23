import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';

interface RegistroUI {
  alumnoId: number;
  nombre: string;
  rut: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDE';
  observacion: string;
}

@Component({
  selector: 'app-control-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Control de Asistencia</h1>
        <p class="text-gray-600">
          Abre una sesión de clase, pasa lista de alumnos inscritos y cierra la sesión al terminar.
        </p>
      </div>

      @if (!tallerId) {
        <p class="text-amber-700 bg-amber-50 p-4 rounded-lg">
          Entra como profesor para gestionar la asistencia de tu taller.
        </p>
      } @else {
        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-800">{{ nombreTaller }}</h2>
              <p class="text-sm text-gray-500">Fecha: {{ fechaHoy | date:'dd/MM/yyyy' }}</p>
            </div>
            @if (!sesion) {
              <button (click)="abrirSesion()" [disabled]="cargando"
                      class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                Abrir sesión de hoy
              </button>
            } @else if (sesion.estado === 'ABIERTA') {
              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">Sesión abierta</span>
            } @else {
              <span class="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">Sesión cerrada</span>
            }
          </div>

          @if (error) {
            <p class="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{{ error }}</p>
          }

          @if (sesion && sesion.estado === 'ABIERTA') {
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Pasar lista</h3>
            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm border border-gray-200 rounded-lg">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="text-left p-3">Alumno</th>
                    <th class="text-left p-3">RUT</th>
                    <th class="text-left p-3">Estado</th>
                    <th class="text-left p-3">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of registros; track r.alumnoId) {
                    <tr class="border-t border-gray-100">
                      <td class="p-3 font-medium">{{ r.nombre }}</td>
                      <td class="p-3">{{ r.rut }}</td>
                      <td class="p-3">
                        <select [(ngModel)]="r.estado" class="border rounded px-2 py-1">
                          <option value="PRESENTE">Presente</option>
                          <option value="AUSENTE">Ausente</option>
                          <option value="TARDE">Tarde</option>
                        </select>
                      </td>
                      <td class="p-3">
                        <input [(ngModel)]="r.observacion" type="text" placeholder="Opcional"
                               class="border rounded px-2 py-1 w-full max-w-xs">
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones de la sesión</label>
              <textarea [(ngModel)]="observacionesSesion" rows="2"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Notas generales de la clase..."></textarea>
            </div>

            <div class="flex gap-3">
              <button (click)="guardarAsistencia()" [disabled]="cargando"
                      class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                Guardar lista
              </button>
              <button (click)="cerrarSesion()" [disabled]="cargando"
                      class="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50">
                Cerrar sesión
              </button>
            </div>
          }

          @if (sesion && sesion.estado === 'CERRADA') {
            <p class="text-green-700 bg-green-50 p-4 rounded-lg">
              Sesión cerrada correctamente. Las estadísticas fueron actualizadas.
            </p>
          }
        </div>

        <div class="bg-white rounded-xl shadow p-6 border-2 border-indigo-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Reporte final (docente)</h3>
          <p class="text-sm text-gray-600 mb-3">
            Genera el reporte de participación, inscripciones y asistencia de tu actividad.
          </p>
          <button (click)="generarReporteFinal()"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
            Generar reporte final
          </button>
        </div>

        @if (historial.length > 0) {
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Historial de sesiones</h3>
            <ul class="space-y-2 text-sm">
              @for (h of historial; track h.id) {
                <li class="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span>{{ h.fecha | date:'dd/MM/yyyy' }} — {{ h.estado }}</span>
                  <span class="text-gray-500">
                    {{ contarEstado(h, 'PRESENTE') }} presentes,
                    {{ contarEstado(h, 'AUSENTE') }} ausentes
                  </span>
                </li>
              }
            </ul>
          </div>
        }
      }
    </div>
  `,
})
export class ControlAsistenciaComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthRoleService);

  tallerId: number | null = null;
  profesorId: number | null = null;
  nombreTaller = '';
  sesion: any = null;
  registros: RegistroUI[] = [];
  historial: any[] = [];
  observacionesSesion = '';
  error = '';
  cargando = false;
  fechaHoy = new Date();

  ngOnInit() {
    this.tallerId = this.auth.currentTallerId();
    this.profesorId = this.auth.currentUserId();
    if (this.tallerId) {
      this.api.getTaller(this.tallerId).subscribe({
        next: (t) => this.nombreTaller = t.tipo,
        error: () => this.nombreTaller = `Taller #${this.tallerId}`
      });
      this.cargarSesionActiva();
      this.cargarHistorial();
    }
  }

  cargarSesionActiva() {
    if (!this.tallerId) return;
    this.api.getSesionActiva(this.tallerId).subscribe({
      next: (s) => {
        this.sesion = s;
        if (s) this.mapearRegistros(s);
      },
      error: () => this.sesion = null
    });
  }

  cargarHistorial() {
    if (!this.tallerId) return;
    this.api.getHistorialSesiones(this.tallerId).subscribe({
      next: (data) => this.historial = data ?? [],
      error: () => this.historial = []
    });
  }

  mapearRegistros(sesion: any) {
    this.registros = (sesion.registros ?? []).map((r: any) => ({
      alumnoId: r.alumnoId,
      nombre: r.alumno?.nombre ?? 'Alumno',
      rut: r.alumno?.rut ?? '',
      estado: r.estado ?? 'AUSENTE',
      observacion: r.observacion ?? '',
    }));
    this.observacionesSesion = sesion.observaciones ?? '';
  }

  abrirSesion() {
    if (!this.tallerId || !this.profesorId) return;
    this.cargando = true;
    this.error = '';
    this.api.abrirSesionAsistencia(this.tallerId, this.profesorId).subscribe({
      next: (s) => {
        this.cargando = false;
        this.sesion = s;
        this.mapearRegistros(s);
        this.cargarHistorial();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'No se pudo abrir la sesión';
      }
    });
  }

  guardarAsistencia() {
    if (!this.sesion) return;
    this.cargando = true;
    this.api.actualizarAsistencia(this.sesion.id, this.registros.map((r) => ({
      alumnoId: r.alumnoId,
      estado: r.estado,
      observacion: r.observacion || undefined,
    }))).subscribe({
      next: (s) => {
        this.cargando = false;
        this.sesion = s;
        this.mapearRegistros(s);
        alert('Lista guardada');
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'Error al guardar';
      }
    });
  }

  cerrarSesion() {
    if (!this.sesion) return;
    if (!this.sesion.listaGuardada) {
      alert('Primero debes guardar la lista de asistencia antes de cerrar la sesión.');
      return;
    }
    if (!confirm('¿Cerrar la sesión? No podrás editar la asistencia después.')) return;
    this.cargando = true;
    this.api.cerrarSesionAsistencia(this.sesion.id, this.observacionesSesion).subscribe({
      next: (s) => {
        this.cargando = false;
        this.sesion = s;
        this.cargarHistorial();
        alert('Sesión cerrada. Se evaluaron alertas de ausencias recurrentes.');
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'Error al cerrar sesión';
      }
    });
  }

  contarEstado(sesion: any, estado: string): number {
    return sesion.registros?.filter((r: any) => r.estado === estado).length ?? 0;
  }

  generarReporteFinal() {
    if (!this.tallerId) return;
    this.api.getReporteActividad(this.tallerId).subscribe({
      next: (r) => {
        const txt =
          `REPORTE FINAL DEL DOCENTE — ${r.actividad.tipo}\n` +
          `Generado por: ${r.docente?.nombre ?? 'Docente'}\n` +
          `Estado actividad: ${r.actividad.estado}\n` +
          (r.periodoAcademico
            ? `Período académico: ${r.periodoAcademico.nombre}\n`
            : '') +
          `\nINSCRIPCIONES\n` +
          `Total: ${r.inscripciones.total} | Aceptados: ${r.inscripciones.aceptados} | Pendientes: ${r.inscripciones.pendientes}\n` +
          `\nASISTENCIA\n` +
          `Sesiones: ${r.asistencia?.sesionesRealizadas ?? 0} | Presentes: ${r.asistencia?.registrosPresentes ?? 0} | Ausentes: ${r.asistencia?.registrosAusentes ?? 0}\n` +
          `\nALUMNOS:\n` +
          (r.alumnos ?? []).map((a: any) => {
            const f = a.ficha;
            const fichaTxt = f
              ? ` | ${f.altura ?? '—'}cm ${f.peso ?? '—'}kg ${f.porcentajeGrasa ?? '—'}% grasa ${f.sedentario ? 'sedentario' : 'activo'}`
              : '';
            return `- ${a.nombre} (${a.rut}): ${a.estado}${fichaTxt}`;
          }).join('\n');
        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `reporte-docente-${r.actividad.tipo}.txt`;
        a.click();
      },
      error: (e) => alert(e?.error?.message || 'No se pudo generar el reporte'),
    });
  }
}
