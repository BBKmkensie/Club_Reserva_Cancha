/**
 * =============================================================================
 * app/pages/fichas-alumnos/fichas-alumnos.component.ts — Fichas físicas por taller
 * =============================================================================
 * Consulta de fichas (altura, peso, grasa, sedentario) de alumnos por taller.
 * Rol: coordinación (todos o solo inscritos) o profesor (su taller) — canVerFichasAlumnos().
 * Endpoints ApiService: getTalleres, getFichasAlumnosPorTaller
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { AlumnoPrivacidadService } from '../../shared/services/alumno-privacidad.service';

@Component({
  selector: 'app-fichas-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-surface rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-ink mb-2">Fichas de alumnos</h1>
        <p class="text-ink-muted mb-4">
          @if (auth.canVerTodasFichasAlumnos()) {
            Como directiva puedes ver <strong>todos los estudiantes</strong> o filtrar solo los
            <strong>inscritos (aceptados)</strong> en cada taller.
          } @else {
            Ficha física de los alumnos <strong>inscritos en tu taller</strong>.
          }
        </p>

        @if (auth.canVerTodasFichasAlumnos()) {
          <div class="flex flex-wrap gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1">Taller</label>
              <select [(ngModel)]="tallerId" (ngModelChange)="cargarFichas()"
                      class="border border-line-strong rounded-lg px-3 py-2 min-w-[200px]">
                <option [ngValue]="null">Selecciona un taller</option>
                @for (t of talleres; track t.id) {
                  <option [ngValue]="t.id">{{ t.tipo }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1">Mostrar</label>
              <select [(ngModel)]="modoVista" (ngModelChange)="cargarFichas()"
                      class="border border-line-strong rounded-lg px-3 py-2 min-w-[220px]">
                <option value="todos">Todos los estudiantes</option>
                <option value="inscritos">Solo inscritos en el taller</option>
              </select>
            </div>
          </div>
        }

        @if (tallerId && !cargando) {
          <p class="text-sm text-ink-muted mb-4">
            {{ fichas.length }} alumno(s)
            @if (auth.canVerTodasFichasAlumnos()) {
              · {{ modoVista === 'todos' ? 'todos los estudiantes del club' : 'solo inscritos aceptados' }}
            }
          </p>
        }

        @if (cargando) {
          <p class="text-ink-muted">Cargando fichas…</p>
        } @else if (error) {
          <p class="text-red-600">{{ error }}</p>
        } @else if (!tallerId) {
          <p class="text-ink-muted">Selecciona un taller para ver las fichas.</p>
        } @else if (fichas.length === 0) {
          <p class="text-ink-muted">No hay alumnos para mostrar con este filtro.</p>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (f of fichas; track f.alumnoId) {
              <div class="border border-line rounded-lg p-4 bg-page"
                   [class.ring-2]="f.inscrito"
                   [class.ring-green-300]="f.inscrito">
                <div class="flex justify-between items-start gap-2">
                  <div>
                    <p class="font-semibold text-ink">{{ priv.nombre(f.nombre) }}</p>
                    <p class="text-xs text-ink-muted">{{ priv.rut(f.rut) }}</p>
                  </div>
                  @if (f.inscrito) {
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full shrink-0">Inscrito</span>
                  } @else if (auth.canVerTodasFichasAlumnos() && modoVista === 'todos') {
                    <span class="text-xs bg-gray-200 text-ink-muted px-2 py-0.5 rounded-full shrink-0">No inscrito</span>
                  }
                </div>
                <ul class="text-sm text-ink-secondary space-y-1 mt-3">
                  <li>Altura: {{ f.altura ?? '—' }} cm</li>
                  <li>Peso: {{ f.peso ?? '—' }} kg</li>
                  <li>% grasa: {{ f.porcentajeGrasa ?? '—' }}</li>
                  <li>Sedentario: {{ f.sedentario == null ? '—' : (f.sedentario ? 'Sí' : 'No') }}</li>
                </ul>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class FichasAlumnosComponent implements OnInit {
  /** Cliente HTTP: talleres y fichas por taller. */
  private api = inject(ApiService);
  /** Permisos: ver todas las fichas (directiva) vs solo el taller del profesor. */
  auth = inject(AuthRoleService);
  /** Enmascara nombre/RUT según política de privacidad. */
  priv = inject(AlumnoPrivacidadService);
  /** Lee query param ?tallerId= para preseleccionar taller. */
  private route = inject(ActivatedRoute);

  /** Catálogo de talleres (solo coordinación elige en el select). */
  talleres: any[] = [];
  /** Filas de ficha física mostradas en la grilla. */
  fichas: any[] = [];
  /** Taller activo del filtro; null = aún no hay selección. */
  tallerId: number | null = null;
  /** Filtro coordinación: todos los alumnos del club o solo inscritos aceptados. */
  modoVista: 'todos' | 'inscritos' = 'todos';
  /** true mientras getFichasAlumnosPorTaller está en curso. */
  cargando = false;
  /** Mensaje de error si falla la carga. */
  error = '';

  /** Inicializa taller desde query param o sesión y carga fichas según permisos. */
  ngOnInit() {
    const qTaller = this.route.snapshot.queryParamMap.get('tallerId');
    if (qTaller) this.tallerId = Number(qTaller);

    if (this.auth.canVerTodasFichasAlumnos()) {
      this.api.getTalleres().subscribe({
        next: (data) => {
          this.talleres = Array.isArray(data) ? data : [];
          if (!this.tallerId && this.talleres.length) {
            this.tallerId = this.talleres[0].id;
          }
          this.cargarFichas();
        },
      });
    } else if (this.auth.currentTallerId()) {
      this.tallerId = this.auth.currentTallerId();
      this.modoVista = 'inscritos';
      this.cargarFichas();
    }
  }

  /** Obtiene fichas de alumnos del taller con filtro de inscritos o todos. */
  cargarFichas() {
    if (!this.tallerId) return;
    this.cargando = true;
    this.error = '';

    const esCoord = this.auth.canVerTodasFichasAlumnos();
    const soloInscritos = esCoord ? this.modoVista === 'inscritos' : true;

    this.api.getFichasAlumnosPorTaller(this.tallerId, {
      soloInscritos,
      esCoordinacion: esCoord,
      profesorId: this.auth.isProfesor() ? this.auth.currentUserId() ?? undefined : undefined,
    }).subscribe({
      next: (data) => {
        this.fichas = Array.isArray(data) ? data : data?.fichas ?? [];
        this.cargando = false;
      },
      error: (e) => {
        this.fichas = [];
        this.cargando = false;
        this.error = e?.error?.message || 'No se pudieron cargar las fichas.';
      },
    });
  }
}
