import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';

@Component({
  selector: 'app-portal-apoderado',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink">Portal del apoderado</h1>
          <p class="text-ink-muted text-sm mt-1">Asistencia e inscripción de su hijo/a</p>
        </div>
        <a routerLink="/dashboard" class="text-sm text-primary-500 hover:underline">← Volver</a>
      </div>

      @if (cargando) {
        <p class="text-ink-muted">Cargando información...</p>
      } @else if (error) {
        <p class="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">{{ error }}</p>
      } @else if (data) {
        <div class="grid gap-4 sm:grid-cols-2">
          <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
            <h2 class="font-bold text-ink mb-3">Su hijo/a</h2>
            <p class="text-lg font-semibold">{{ data.hijo.nombre }}</p>
            <p class="text-sm text-ink-muted">RUT: {{ data.hijo.rut }}</p>
          </section>

          <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
            <h2 class="font-bold text-ink mb-3">Taller inscrito</h2>
            @if (data.tallerInscrito) {
              <p class="text-lg font-semibold text-primary-600">{{ data.tallerInscrito.nombre }}</p>
              @if (data.tallerInscrito.horario) {
                <p class="text-sm text-ink-muted mt-1">{{ data.tallerInscrito.horario }}</p>
              }
            } @else {
              <p class="text-ink-muted">Sin taller activo inscrito.</p>
            }
          </section>
        </div>

        @if (data.asistencia) {
          <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
            <h2 class="font-bold text-ink mb-4">Resumen de asistencia</h2>
            <div class="flex flex-wrap gap-3 mb-4">
              <span class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Presente: {{ data.asistencia.resumen.presentes }}
              </span>
              <span class="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                Ausente: {{ data.asistencia.resumen.ausentes }}
              </span>
              <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                Tarde: {{ data.asistencia.resumen.tardes }}
              </span>
              <span class="px-3 py-1 rounded-full bg-muted text-ink-secondary text-sm font-medium">
                Asistencia: {{ data.asistencia.resumen.porcentaje }}%
              </span>
            </div>

            @if (data.asistencia.registros.length === 0) {
              <p class="text-ink-muted text-sm">Aún no hay sesiones cerradas registradas.</p>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-line text-left text-ink-muted">
                      <th class="py-2 pr-4">Fecha</th>
                      <th class="py-2 pr-4">Estado</th>
                      <th class="py-2">Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (r of data.asistencia.registros; track r.fecha) {
                      <tr class="border-b border-line/60">
                        <td class="py-2 pr-4">{{ r.fecha }}</td>
                        <td class="py-2 pr-4">
                          <span [class]="estadoClass(r.estado)">{{ estadoLabel(r.estado) }}</span>
                        </td>
                        <td class="py-2 text-ink-muted">{{ r.observacion || '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>
        }

        <section class="bg-surface rounded-xl border border-line p-5 shadow-sm">
          <h2 class="font-bold text-ink mb-3">Proponer inscripción a la directiva</h2>
          <p class="text-sm text-ink-muted mb-4">
            Si desea que su hijo/a participe en otra actividad, envíe una propuesta. La directiva la revisará y aceptará o rechazará.
          </p>
          @if (catalogo.length === 0) {
            <p class="text-ink-muted text-sm">No hay actividades publicadas disponibles.</p>
          } @else {
            <ul class="space-y-2">
              @for (t of catalogo; track t.id) {
                <li class="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-line/60 last:border-0">
                  <div>
                    <p class="font-medium text-ink">{{ t.tipo }}</p>
                    <p class="text-xs text-ink-muted line-clamp-1">{{ t.descripcion }}</p>
                  </div>
                  <button (click)="proponer(t.id)" [disabled]="proponiendo === t.id"
                          class="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                    {{ proponiendo === t.id ? 'Enviando…' : 'Proponer' }}
                  </button>
                </li>
              }
            </ul>
          }
        </section>

        <section class="bg-surface rounded-xl border border-line p-5 shadow-sm text-sm text-ink-muted">
          <p><strong class="text-ink">Apoderado:</strong> {{ data.apoderado.nombre }} · RUT {{ data.apoderado.rut }}</p>
          <p class="mt-1"><strong class="text-ink">Correo:</strong> {{ data.apoderado.email || '—' }}</p>
        </section>
      }
    </div>
  `,
})
export class PortalApoderadoComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthRoleService);

  cargando = true;
  error = '';
  data: any = null;
  catalogo: any[] = [];
  proponiendo: number | null = null;

  ngOnInit(): void {
    if (!this.auth.isApoderado()) {
      this.error = 'Acceso solo para apoderados.';
      this.cargando = false;
      return;
    }
    this.api.getCatalogoTalleres().subscribe({
      next: (t) => (this.catalogo = t ?? []),
      error: () => (this.catalogo = []),
    });
    this.api.getApoderadoResumen().subscribe({
      next: (res) => {
        this.data = res;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cargar la información.';
        this.cargando = false;
      },
    });
  }

  estadoLabel(estado: string): string {
    if (estado === 'PRESENTE') return 'Presente';
    if (estado === 'AUSENTE') return 'Ausente';
    if (estado === 'TARDE') return 'Tarde';
    return 'Sin registro';
  }

  estadoClass(estado: string): string {
    if (estado === 'PRESENTE') return 'text-green-700 font-medium';
    if (estado === 'AUSENTE') return 'text-red-700 font-medium';
    if (estado === 'TARDE') return 'text-amber-700 font-medium';
    return 'text-ink-muted';
  }

  proponer(tallerId: number): void {
    this.proponiendo = tallerId;
    this.api.proponerInscripcionApoderado(tallerId).subscribe({
      next: () => {
        this.proponiendo = null;
        alert('Propuesta enviada a la directiva. Recibirás respuesta cuando la revisen.');
      },
      error: (err) => {
        this.proponiendo = null;
        alert(err?.error?.message || 'No se pudo enviar la propuesta');
      },
    });
  }
}
