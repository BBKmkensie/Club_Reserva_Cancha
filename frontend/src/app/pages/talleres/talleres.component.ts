/**
 * =============================================================================
 * app/pages/talleres/talleres.component.ts — CRUD de talleres
 * =============================================================================
 * Catálogo administrativo con listado, filtro por tipo (query ?tipo=) y modal CRUD.
 * Rol: coordinación para crear/editar — canAccessTalleresCRUD().
 * Endpoints ApiService: getTalleres, createTaller, updateTaller, deleteTaller
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Taller, CreateTallerDto } from '../../models/taller.model';
import { FechaPickerComponent } from '../../shared/components/fecha-picker/fecha-picker.component';

@Component({
  selector: 'app-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, RouterLink, FechaPickerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-ink">Talleres</h1>
        @if (auth.canAccessTalleresCRUD()) {
          <button (click)="openModal()" 
                  class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
            + Nuevo Taller
          </button>
        }
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-surface rounded-lg p-6 w-full max-w-md">
          <h2 class="text-2xl font-bold mb-4">{{ editingTaller ? 'Editar' : 'Nuevo' }} Taller</h2>
          <form [formGroup]="tallerForm" (ngSubmit)="saveTaller()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1">Tipo</label>
                <input formControlName="tipo" type="text" 
                       class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1">Descripción</label>
                <textarea formControlName="descripcion" rows="3"
                          class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1">Capacidad</label>
                <input formControlName="capacidad" type="number" 
                       class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-2">Fecha de Inicio</label>
                <app-fecha-picker formControlName="fechaInicio" [anchoCompleto]="true" />
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1">URL de imagen</label>
                <input formControlName="imagenUrl" type="url" placeholder="https://..."
                       class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" (click)="closeModal()" 
                      class="px-4 py-2 border border-line-strong rounded-md hover:bg-page">
                Cancelar
              </button>
              <button type="submit" 
                      class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Filtro activo -->
      <div *ngIf="tipoFiltro" class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-blue-800 font-semibold">Mostrando: {{ tipoFiltro }}</p>
            <p class="text-blue-600 text-sm">{{ talleresFiltrados.length }} taller(es) encontrado(s)</p>
          </div>
          <button (click)="limpiarFiltro()" 
                  class="text-blue-600 hover:text-blue-800 underline text-sm">
            Ver todos los talleres
          </button>
        </div>
      </div>

      <!-- Lista de Talleres -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let taller of talleresFiltrados" 
             class="bg-surface rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
             [routerLink]="['/taller', taller.id]">
          <img *ngIf="taller.imagenUrl" [src]="taller.imagenUrl" alt="{{ taller.tipo }}" 
               class="w-full h-32 object-cover rounded-lg mb-3">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-ink">{{ taller.tipo }}</h3>
            @if (auth.canAccessTalleresCRUD()) {
              <div class="flex space-x-2" (click)="$event.stopPropagation()">
                <button (click)="editTaller(taller)" 
                        class="text-primary-600 hover:text-primary-700">
                  ✏️
                </button>
                <button (click)="deleteTaller(taller.id)" 
                        class="text-red-600 hover:text-red-700">
                  🗑️
                </button>
              </div>
            }
          </div>
          <p class="text-ink-muted mb-3">{{ taller.descripcion }}</p>
          <div class="flex justify-between text-sm text-ink-muted mb-3">
            <span>Capacidad: {{ taller.capacidad }}</span>
            <span *ngIf="taller.fechaInicio">{{ taller.fechaInicio | date:'short' }}</span>
          </div>
          <button class="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                  (click)="$event.stopPropagation()"
                  [routerLink]="['/taller', taller.id]">
            Ver Detalles
          </button>
        </div>
        <div *ngIf="talleresFiltrados.length === 0" class="col-span-full text-center text-ink-muted py-12">
          <div *ngIf="tipoFiltro">
            No hay talleres de tipo "{{ tipoFiltro }}" registrados
          </div>
          <div *ngIf="!tipoFiltro">
            No hay talleres registrados
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TalleresComponent implements OnInit {
  /** Permisos CRUD de talleres. */
  auth = inject(AuthRoleService);
  /** Catálogo completo desde la API. */
  talleres: Taller[] = [];
  /** Subconjunto tras aplicarFiltro() (tipo desde query params). */
  talleresFiltrados: Taller[] = [];
  /** true = modal crear/editar visible. */
  showModal = false;
  /** Taller en edición; null = modo crear. */
  editingTaller: Taller | null = null;
  /** Formulario reactivo del modal. */
  tallerForm: FormGroup;
  /** Filtro por tipo leído de ?tipo= en la URL (null = todos). */
  tipoFiltro: string | null = null;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.tallerForm = this.fb.group({
      tipo: ['', Validators.required],
      descripcion: ['', Validators.required],
      capacidad: [20, Validators.required],
      fechaInicio: [''],
      imagenUrl: ['']
    });
  }

  /** Lee query params de filtro y carga el catálogo de talleres. */
  ngOnInit() {
    // Leer queryParams para filtrar por tipo
    this.route.queryParams.subscribe(params => {
      this.tipoFiltro = params['tipo'] || null;
      this.loadTalleres();
    });
  }

  /** Obtiene todos los talleres desde la API y aplica el filtro activo. */
  loadTalleres() {
    this.apiService.getTalleres().subscribe({
      next: (data) => {
        this.talleres = data;
        this.aplicarFiltro();
      },
      error: (err) => console.error('Error cargando talleres:', err)
    });
  }

  /** Aplica el filtro por tipo de taller leído desde query params. */
  aplicarFiltro() {
    if (this.tipoFiltro) {
      this.talleresFiltrados = this.talleres.filter(t => 
        t.tipo.toLowerCase() === this.tipoFiltro!.toLowerCase()
      );
    } else {
      this.talleresFiltrados = this.talleres;
    }
  }

  /** Abre el modal en modo crear (capacidad por defecto 20). */
  openModal() {
    this.editingTaller = null;
    this.tallerForm.reset({ capacidad: 20 });
    this.showModal = true;
  }

  /** Cierra el modal y limpia el estado de edición. */
  closeModal() {
    this.showModal = false;
    this.editingTaller = null;
    this.tallerForm.reset();
  }

  /** Abre el modal en modo editar con los datos del taller. */
  editTaller(taller: Taller) {
    this.editingTaller = taller;
    this.tallerForm.patchValue({
      tipo: taller.tipo,
      descripcion: taller.descripcion,
      capacidad: taller.capacidad,
      fechaInicio: taller.fechaInicio ? new Date(taller.fechaInicio).toISOString().split('T')[0] : '',
      imagenUrl: taller.imagenUrl || ''
    });
    this.showModal = true;
  }

  /** Crea o actualiza un taller según el modo del modal (nuevo o edición). */
  saveTaller() {
    if (this.tallerForm.valid) {
      const data: CreateTallerDto = this.tallerForm.value;
      if (this.editingTaller) {
        this.apiService.updateTaller(this.editingTaller.id, data).subscribe({
          next: () => {
            this.loadTalleres();
            this.closeModal();
          }
        });
      } else {
        this.apiService.createTaller(data).subscribe({
          next: () => {
            this.loadTalleres();
            this.closeModal();
          }
        });
      }
    }
  }

  /** Elimina un taller tras confirmación del usuario. */
  deleteTaller(id: number) {
    if (confirm('¿Estás seguro de eliminar este taller?')) {
      this.apiService.deleteTaller(id).subscribe({
        next: () => this.loadTalleres()
      });
    }
  }

  /** Quita el filtro por tipo y limpia los query params de la URL. */
  limpiarFiltro() {
    this.tipoFiltro = null;
    this.router.navigate(['/talleres'], { queryParams: {} });
    this.aplicarFiltro();
  }
}

