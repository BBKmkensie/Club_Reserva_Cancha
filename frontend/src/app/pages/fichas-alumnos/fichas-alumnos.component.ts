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
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Fichas de alumnos</h1>
        <p class="text-gray-600 mb-4">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Taller</label>
              <select [(ngModel)]="tallerId" (ngModelChange)="cargarFichas()"
                      class="border border-gray-300 rounded-lg px-3 py-2 min-w-[200px]">
                <option [ngValue]="null">Selecciona un taller</option>
                @for (t of talleres; track t.id) {
                  <option [ngValue]="t.id">{{ t.tipo }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mostrar</label>
              <select [(ngModel)]="modoVista" (ngModelChange)="cargarFichas()"
                      class="border border-gray-300 rounded-lg px-3 py-2 min-w-[220px]">
                <option value="todos">Todos los estudiantes</option>
                <option value="inscritos">Solo inscritos en el taller</option>
              </select>
            </div>
          </div>
        }

        @if (tallerId && !cargando) {
          <p class="text-sm text-gray-500 mb-4">
            {{ fichas.length }} alumno(s)
            @if (auth.canVerTodasFichasAlumnos()) {
              · {{ modoVista === 'todos' ? 'todos los estudiantes del club' : 'solo inscritos aceptados' }}
            }
          </p>
        }

        @if (cargando) {
          <p class="text-gray-500">Cargando fichas…</p>
        } @else if (error) {
          <p class="text-red-600">{{ error }}</p>
        } @else if (!tallerId) {
          <p class="text-gray-500">Selecciona un taller para ver las fichas.</p>
        } @else if (fichas.length === 0) {
          <p class="text-gray-500">No hay alumnos para mostrar con este filtro.</p>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (f of fichas; track f.alumnoId) {
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50"
                   [class.ring-2]="f.inscrito"
                   [class.ring-green-300]="f.inscrito">
                <div class="flex justify-between items-start gap-2">
                  <div>
                    <p class="font-semibold text-gray-800">{{ priv.nombre(f.nombre) }}</p>
                    <p class="text-xs text-gray-500">{{ priv.rut(f.rut) }}</p>
                  </div>
                  @if (f.inscrito) {
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full shrink-0">Inscrito</span>
                  } @else if (auth.canVerTodasFichasAlumnos() && modoVista === 'todos') {
                    <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full shrink-0">No inscrito</span>
                  }
                </div>
                <ul class="text-sm text-gray-700 space-y-1 mt-3">
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
  private api = inject(ApiService);
  auth = inject(AuthRoleService);
  priv = inject(AlumnoPrivacidadService);
  private route = inject(ActivatedRoute);

  talleres: any[] = [];
  fichas: any[] = [];
  tallerId: number | null = null;
  modoVista: 'todos' | 'inscritos' = 'todos';
  cargando = false;
  error = '';

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
