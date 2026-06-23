import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';

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
            Altura, peso, porcentaje de grasa y nivel de actividad por taller.
          } @else {
            Ficha física de los alumnos inscritos en tu taller.
          }
        </p>

        @if (auth.canVerTodasFichasAlumnos()) {
          <label class="block text-sm font-medium text-gray-700 mb-1">Taller</label>
          <select [(ngModel)]="tallerId" (ngModelChange)="cargarFichas()"
                  class="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full max-w-md">
            <option [ngValue]="null">Selecciona un taller</option>
            @for (t of talleres; track t.id) {
              <option [ngValue]="t.id">{{ t.tipo }}</option>
            }
          </select>
        }

        @if (cargando) {
          <p class="text-gray-500">Cargando fichas…</p>
        } @else if (error) {
          <p class="text-red-600">{{ error }}</p>
        } @else if (!tallerId) {
          <p class="text-gray-500">Selecciona un taller para ver las fichas.</p>
        } @else if (fichas.length === 0) {
          <p class="text-gray-500">No hay fichas registradas para este taller.</p>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (f of fichas; track f.alumnoId) {
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p class="font-semibold text-gray-800">{{ f.nombre }}</p>
                <p class="text-xs text-gray-500 mb-2">{{ f.rut }}</p>
                <ul class="text-sm text-gray-700 space-y-1">
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
  private route = inject(ActivatedRoute);

  talleres: any[] = [];
  fichas: any[] = [];
  tallerId: number | null = null;
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
      this.cargarFichas();
    }
  }

  cargarFichas() {
    if (!this.tallerId) return;
    this.cargando = true;
    this.error = '';
    this.api.getFichasAlumnosPorTaller(this.tallerId).subscribe({
      next: (data) => {
        this.fichas = Array.isArray(data) ? data : data?.fichas ?? [];
        this.cargando = false;
      },
      error: (e) => {
        this.fichas = [];
        this.cargando = false;
        this.error = e?.error?.message || 'No se pudieron cargar las fichas. Verifica que el módulo esté activo en el servidor.';
      },
    });
  }
}
