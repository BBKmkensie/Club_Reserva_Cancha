/**
 * =============================================================================
 * app/pages/profesores/profesores.component.ts — CRUD de profesores
 * =============================================================================
 * Registro y mantenimiento de docentes vinculados a talleres.
 * Rol: coordinación — canVerProfesores().
 * Endpoints ApiService: getProfesores, getTalleres, createProfesor, updateProfesor, deleteProfesor
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Profesor, CreateProfesorDto } from '../../models/profesor.model';
import { Taller } from '../../models/taller.model';

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-ink">Profesores</h1>
        @if (puedeCrearProfesor()) {
          <button type="button" (click)="openModal()"
                  class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
            + Nuevo Profesor
          </button>
        }
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-surface rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-4">{{ editingProfesor ? 'Editar' : 'Nuevo' }} Profesor</h2>
          <form [formGroup]="profesorForm" (ngSubmit)="saveProfesor()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1">Nombre</label>
                <input formControlName="nombre" type="text" 
                       class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1">RUT</label>
                <input formControlName="rut" type="text" 
                       class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1">Email</label>
                <input formControlName="email" type="email" 
                       class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1">Teléfono</label>
                <input formControlName="telefono" type="text" 
                       class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1">Taller</label>
                <select formControlName="tallerId" 
                        class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Seleccione un taller</option>
                  <option *ngFor="let taller of talleres" [value]="taller.id">
                    {{ taller.tipo }}
                  </option>
                </select>
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

      <!-- Lista de Profesores -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let profesor of profesores" 
             class="bg-surface rounded-lg shadow p-6 hover:shadow-lg transition">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold text-ink">{{ profesor.nombre }}</h3>
              <p class="text-sm text-ink-muted">{{ profesor.rut }}</p>
            </div>
            @if (puedeCrearProfesor()) {
              <div class="flex space-x-2">
                <button type="button" (click)="editProfesor(profesor)" class="text-primary-600 hover:text-primary-700">✏️</button>
                <button type="button" (click)="deleteProfesor(profesor.id)" class="text-red-600 hover:text-red-700">🗑️</button>
              </div>
            }
          </div>
          <div class="space-y-2 text-sm">
            <div><span class="font-medium">Email:</span> {{ profesor.email }}</div>
            <div *ngIf="profesor.telefono"><span class="font-medium">Teléfono:</span> {{ profesor.telefono }}</div>
            <div><span class="font-medium">Taller:</span> {{ profesor.taller?.tipo || '-' }}</div>
          </div>
        </div>
        <div *ngIf="profesores.length === 0" class="col-span-full text-center text-ink-muted py-12">
          No hay profesores registrados
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfesoresComponent implements OnInit {
  /** Permisos de gestión de profesores. */
  auth = inject(AuthRoleService);
  /** Listado de docentes. */
  profesores: Profesor[] = [];
  /** Talleres para el select de asignación. */
  talleres: Taller[] = [];
  /** true = modal crear/editar visible. */
  showModal = false;
  /** Profesor en edición; null = modo crear. */
  editingProfesor: Profesor | null = null;
  /** Formulario reactivo del modal. */
  profesorForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.profesorForm = this.fb.group({
      nombre: ['', Validators.required],
      rut: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      tallerId: ['', Validators.required]
    });
  }

  /** Carga profesores y talleres disponibles al iniciar. */
  ngOnInit() {
    this.loadProfesores();
    this.loadTalleres();
  }

  /** Super Admin solo consulta; no crea ni edita profesores. */
  puedeCrearProfesor(): boolean {
    return this.auth.currentRole() !== 'super_admin';
  }

  /** Obtiene el listado de profesores desde la API. */
  loadProfesores() {
    this.apiService.getProfesores().subscribe({
      next: (data) => this.profesores = data,
      error: (err) => console.error('Error cargando profesores:', err)
    });
  }

  /** Obtiene el catálogo de talleres para el selector del formulario. */
  loadTalleres() {
    this.apiService.getTalleres().subscribe({
      next: (data) => this.talleres = data
    });
  }

  /** Abre el modal en modo crear. */
  openModal() {
    if (!this.puedeCrearProfesor()) return;
    this.editingProfesor = null;
    this.profesorForm.reset();
    this.showModal = true;
  }

  /** Cierra el modal y limpia el estado de edición. */
  closeModal() {
    this.showModal = false;
    this.editingProfesor = null;
    this.profesorForm.reset();
  }

  /** Abre el modal en modo editar con los datos del profesor. */
  editProfesor(profesor: Profesor) {
    this.editingProfesor = profesor;
    this.profesorForm.patchValue({
      nombre: profesor.nombre,
      rut: profesor.rut,
      email: profesor.email,
      telefono: profesor.telefono || '',
      tallerId: profesor.tallerId
    });
    this.showModal = true;
  }

  /** Crea o actualiza un profesor según el modo del modal. */
  saveProfesor() {
    if (this.profesorForm.valid) {
      const data: CreateProfesorDto = this.profesorForm.value;
      if (this.editingProfesor) {
        this.apiService.updateProfesor(this.editingProfesor.id, data).subscribe({
          next: () => {
            this.loadProfesores();
            this.closeModal();
          }
        });
      } else {
        this.apiService.createProfesor(data).subscribe({
          next: () => {
            this.loadProfesores();
            this.closeModal();
          }
        });
      }
    }
  }

  /** Elimina un profesor tras confirmación del usuario. */
  deleteProfesor(id: number) {
    if (confirm('¿Estás seguro de eliminar este profesor?')) {
      this.apiService.deleteProfesor(id).subscribe({
        next: () => this.loadProfesores()
      });
    }
  }
}

