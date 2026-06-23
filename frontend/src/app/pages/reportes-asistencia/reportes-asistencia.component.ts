import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';

@Component({
  selector: 'app-reportes-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Reportes de Asistencia</h1>
        <p class="text-gray-600">
          Revisa estadísticas, recibe alertas, contacta apoderados y toma medidas correctivas.
        </p>
      </div>

      @if (auth.isCoordinacion() || auth.isProfesor()) {
        <div class="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-end">
          @if (auth.isCoordinacion()) {
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Taller</label>
              <select [(ngModel)]="tallerIdSeleccionado" (ngModelChange)="cargarTodo()"
                      class="border rounded-lg px-3 py-2 max-w-md w-full">
                <option [ngValue]="null">— Seleccionar —</option>
                @for (t of talleres; track t.id) {
                  <option [ngValue]="t.id">{{ t.tipo }}</option>
                }
              </select>
            </div>
          }
          @if (tallerIdSeleccionado && auth.isCoordinacion()) {
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Umbral de ausencias</label>
              <div class="flex gap-2">
                <input type="number" [(ngModel)]="umbralEdit" min="1" max="20"
                       class="border rounded-lg px-3 py-2 w-20">
                <button (click)="guardarUmbral()" class="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm">
                  Guardar
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (alertasGestion.length > 0) {
        <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h2 class="text-xl font-bold text-red-800 mb-3">Alertas pendientes — Contactar apoderado</h2>
          <div class="space-y-4">
            @for (a of alertasGestion; track a.id) {
              <div class="bg-white p-4 rounded-lg border border-red-200">
                <div class="flex flex-wrap justify-between gap-2 mb-2">
                  <div>
                    <strong>{{ a.nombre }}</strong> ({{ a.rut }}) — {{ a.taller }}
                    <span class="ml-2 text-red-600 font-bold">{{ a.cantidadAusencias }} ausencias</span>
                    <span class="ml-2 text-xs px-2 py-0.5 rounded-full"
                          [class.bg-amber-200]="a.estado === 'PENDIENTE'"
                          [class.bg-blue-200]="a.estado === 'APODERADO_CONTACTADO'">
                      {{ a.estado === 'PENDIENTE' ? 'Pendiente' : 'Apoderado contactado' }}
                    </span>
                  </div>
                </div>
                @if (a.apoderado?.nombre || a.apoderado?.telefono) {
                  <p class="text-sm text-gray-600 mb-2">
                    Apoderado: <strong>{{ a.apoderado?.nombre ?? '—' }}</strong>
                    @if (a.apoderado?.telefono) { · Tel: {{ a.apoderado.telefono }} }
                    @if (a.apoderado?.email) { · {{ a.apoderado.email }} }
                  </p>
                } @else {
                  <p class="text-sm text-amber-600 mb-2">Sin datos de apoderado registrados</p>
                }
                <textarea [(ngModel)]="notasAlerta[a.id]" rows="2" placeholder="Notas de contacto o medidas..."
                          class="w-full border rounded-lg px-3 py-2 text-sm mb-2"></textarea>
                <div class="flex gap-2">
                  @if (a.estado === 'PENDIENTE') {
                    <button (click)="contactar(a.id)"
                            class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                      Marcar apoderado contactado
                    </button>
                  }
                  <button (click)="resolver(a.id)"
                          class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700">
                    Tomar medida / Resolver
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (reporte) {
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
            <div class="text-2xl font-bold text-blue-700">{{ reporte.resumen.totalSesiones }}</div>
            <div class="text-sm text-gray-600">Sesiones</div>
          </div>
          <div class="bg-green-50 rounded-xl p-4 text-center border border-green-200">
            <div class="text-2xl font-bold text-green-700">{{ reporte.resumen.totalAlumnos }}</div>
            <div class="text-sm text-gray-600">Alumnos</div>
          </div>
          <div class="bg-red-50 rounded-xl p-4 text-center border border-red-200">
            <div class="text-2xl font-bold text-red-700">{{ reporte.resumen.alertasPendientes }}</div>
            <div class="text-sm text-gray-600">Alertas activas</div>
          </div>
          <div class="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
            <div class="text-2xl font-bold text-amber-700">{{ reporte.resumen.umbralAusencias }}</div>
            <div class="text-sm text-gray-600">Umbral ausencias</div>
          </div>
          <div class="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
            <div class="text-2xl font-bold text-purple-700">{{ reporte.taller.tipo }}</div>
            <div class="text-sm text-gray-600">Taller</div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">Reporte final por alumno</h2>
            <button (click)="exportar()" class="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
              Generar reporte final
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm border border-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th class="text-left p-3">Alumno</th>
                  <th class="text-left p-3">Apoderado</th>
                  <th class="text-center p-3">Presentes</th>
                  <th class="text-center p-3">Ausentes</th>
                  <th class="text-center p-3">%</th>
                  <th class="text-center p-3">Alerta</th>
                </tr>
              </thead>
              <tbody>
                @for (e of reporte.estadisticasAlumnos; track e.alumnoId) {
                  <tr class="border-t" [class.bg-red-50]="e.alertaAusencia">
                    <td class="p-3 font-medium">{{ e.nombre }}</td>
                    <td class="p-3 text-gray-600">{{ e.apoderadoNombre ?? '—' }}</td>
                    <td class="p-3 text-center text-green-700">{{ e.presentes }}</td>
                    <td class="p-3 text-center text-red-700">{{ e.ausentes }}</td>
                    <td class="p-3 text-center font-bold">{{ e.porcentajeAsistencia }}%</td>
                    <td class="p-3 text-center">{{ e.alertaAusencia ? '⚠' : '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class ReportesAsistenciaComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthRoleService);

  talleres: any[] = [];
  tallerIdSeleccionado: number | null = null;
  reporte: any = null;
  alertasGestion: any[] = [];
  umbralEdit = 3;
  notasAlerta: Record<number, string> = {};

  ngOnInit() {
    if (this.auth.isAdmin() && this.auth.currentTallerId()) {
      this.tallerIdSeleccionado = this.auth.currentTallerId();
      this.cargarTodo();
    }
    if (this.auth.isCoordinacion()) {
      this.api.getTalleres().subscribe({
        next: (data) => this.talleres = data,
        error: () => this.talleres = []
      });
    }
  }

  cargarTodo() {
    this.cargarReporte();
    this.cargarAlertas();
  }

  cargarReporte() {
    if (!this.tallerIdSeleccionado) return;
    this.api.getReporteAsistencia(this.tallerIdSeleccionado).subscribe({
      next: (data) => {
        this.reporte = data;
        this.umbralEdit = data.taller?.umbralAusencias ?? 3;
      },
      error: () => this.reporte = null
    });
  }

  cargarAlertas() {
    const tallerId = this.tallerIdSeleccionado ?? undefined;
    this.api.getAlertasGestion(tallerId).subscribe({
      next: (data) => this.alertasGestion = data ?? [],
      error: () => this.alertasGestion = []
    });
  }

  guardarUmbral() {
    if (!this.tallerIdSeleccionado) return;
    this.api.actualizarUmbralAusencias(this.tallerIdSeleccionado, this.umbralEdit).subscribe({
      next: () => {
        alert('Umbral actualizado');
        this.cargarTodo();
      },
      error: (err) => alert(err?.error?.message || 'Error al guardar umbral')
    });
  }

  contactar(id: number) {
    this.api.contactarApoderado(id, this.notasAlerta[id] || '').subscribe({
      next: () => {
        alert('Apoderado marcado como contactado');
        this.cargarTodo();
      },
      error: (err) => alert(err?.error?.message || 'Error')
    });
  }

  resolver(id: number) {
    this.api.resolverAlerta(id, this.notasAlerta[id] || '').subscribe({
      next: () => {
        alert('Alerta resuelta — medida correctiva registrada');
        this.cargarTodo();
      },
      error: (err) => alert(err?.error?.message || 'Error')
    });
  }

  exportar() {
    if (!this.reporte) return;
    const lineas = [
      `REPORTE FINAL DE ASISTENCIA - ${this.reporte.taller.tipo}`,
      `Umbral ausencias: ${this.reporte.resumen.umbralAusencias}`,
      `Sesiones: ${this.reporte.resumen.totalSesiones}`,
      `Alertas activas: ${this.reporte.resumen.alertasPendientes}`,
      '',
      'Alumno\tRUT\tApoderado\tTeléfono\tPresentes\tAusentes\t% Asistencia\tAlerta',
      ...this.reporte.estadisticasAlumnos.map((e: any) =>
        `${e.nombre}\t${e.rut}\t${e.apoderadoNombre ?? ''}\t${e.apoderadoTelefono ?? ''}\t${e.presentes}\t${e.ausentes}\t${e.porcentajeAsistencia}%\t${e.alertaAusencia ? 'SI' : 'NO'}`
      ),
    ];
    const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-final-${this.reporte.taller.tipo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
