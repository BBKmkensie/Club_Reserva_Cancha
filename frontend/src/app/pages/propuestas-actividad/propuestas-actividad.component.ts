import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { AlumnoPrivacidadService } from '../../shared/services/alumno-privacidad.service';

@Component({
  selector: 'app-propuestas-actividad',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="bg-surface rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Bandeja de propuestas</h1>
        <p class="text-ink-muted text-sm">
          La directiva revisa propuestas de apoderados y decide si el estudiante puede inscribirse en la actividad.
        </p>
      </div>

      @if (!auth.canGestionarPropuestas()) {
        <p class="text-amber-700 bg-amber-50 p-4 rounded-lg">Acceso solo para directiva o super admin.</p>
      } @else if (cargando) {
        <p class="text-ink-muted">Cargando propuestas…</p>
      } @else if (propuestas.length === 0) {
        <p class="text-ink-muted bg-surface rounded-lg p-6 text-center">No hay propuestas pendientes.</p>
      } @else {
        <div class="space-y-4">
          @for (p of propuestas; track p.id) {
            <div class="bg-surface rounded-xl border p-5 shadow-sm transition-colors"
                 [class.border-primary-400]="p.id === destacarId"
                 [class.ring-2]="p.id === destacarId"
                 [class.ring-primary-200]="p.id === destacarId">
              <div class="flex flex-wrap justify-between gap-3 mb-2">
                <div>
                  <h2 class="text-lg font-bold text-ink">{{ p.tallerNombre }}</h2>
                  <p class="text-sm text-ink-muted">
                    Estudiante: <strong>{{ priv.nombre(p.alumnoNombre) }}</strong> ({{ priv.rut(p.alumnoRut) }})
                  </p>
                  @if (p.apoderadoNombre) {
                    <p class="text-sm text-ink-muted">Apoderado: {{ p.apoderadoNombre }}</p>
                  }
                </div>
                <span class="text-xs text-ink-muted">{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="flex flex-wrap gap-2 mt-3">
                <button (click)="responder(p.id, true)"
                        class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                  Aceptar propuesta
                </button>
                <button (click)="responder(p.id, false)"
                        class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                  Rechazar
                </button>
              </div>
            </div>
          }
        </div>
      }

      <a routerLink="/dashboard" class="text-sm text-primary-500 hover:underline inline-block">← Volver al dashboard</a>
    </div>
  `,
})
export class PropuestasActividadComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthRoleService);
  priv = inject(AlumnoPrivacidadService);

  propuestas: any[] = [];
  cargando = true;
  destacarId: number | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    this.destacarId = id ? Number(id) : null;
    this.cargar();
  }

  cargar(): void {
    if (!this.auth.canGestionarPropuestas()) {
      this.cargando = false;
      return;
    }
    this.api.getPropuestasPendientes().subscribe({
      next: (data) => {
        this.propuestas = data ?? [];
        this.cargando = false;
      },
      error: () => {
        this.propuestas = [];
        this.cargando = false;
      },
    });
  }

  responder(id: number, acepta: boolean): void {
    let motivo: string | undefined;
    if (!acepta) {
      motivo = prompt('Motivo del rechazo (opcional):') ?? undefined;
    }
    this.api.responderPropuestaInscripcion(id, acepta, motivo).subscribe({
      next: () => {
        alert(acepta ? 'Propuesta aceptada. La solicitud quedó pendiente para el profesor.' : 'Propuesta rechazada.');
        this.cargar();
      },
      error: (e) => alert(e?.error?.message || 'No se pudo responder la propuesta'),
    });
  }
}
