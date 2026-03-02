import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Profesor, CreateProfesorDto } from '../../models/profesor.model';
import { Taller } from '../../models/taller.model';

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Profesores</h1>
        <button (click)="openModal()" 
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
          + Nuevo Profesor
        </button>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-4">{{ editingProfesor ? 'Editar' : 'Nuevo' }} Profesor</h2>
          <form [formGroup]="profesorForm" (ngSubmit)="saveProfesor()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input formControlName="nombre" type="text" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                <input formControlName="rut" type="text" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input formControlName="email" type="email" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input formControlName="telefono" type="text" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Taller</label>
                <select formControlName="tallerId" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Seleccione un taller</option>
                  <option *ngFor="let taller of talleres" [value]="taller.id">
                    {{ taller.tipo }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" (click)="closeModal()" 
                      class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
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
             class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">{{ profesor.nombre }}</h3>
              <p class="text-sm text-gray-500">{{ profesor.rut }}</p>
            </div>
            <div class="flex space-x-2">
              <button (click)="editProfesor(profesor)" class="text-primary-600 hover:text-primary-700">✏️</button>
              <button (click)="deleteProfesor(profesor.id)" class="text-red-600 hover:text-red-700">🗑️</button>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <div><span class="font-medium">Email:</span> {{ profesor.email }}</div>
            <div *ngIf="profesor.telefono"><span class="font-medium">Teléfono:</span> {{ profesor.telefono }}</div>
            <div><span class="font-medium">Taller:</span> {{ profesor.taller?.tipo || '-' }}</div>
          </div>
        </div>
        <div *ngIf="profesores.length === 0" class="col-span-full text-center text-gray-500 py-12">
          No hay profesores registrados
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfesoresComponent implements OnInit {
  profesores: Profesor[] = [];
  talleres: Taller[] = [];
  showModal = false;
  editingProfesor: Profesor | null = null;
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

  ngOnInit() {
    this.loadProfesores();
    this.loadTalleres();
  }

  loadProfesores() {
    this.apiService.getProfesores().subscribe({
      next: (data) => this.profesores = data,
      error: (err) => console.error('Error cargando profesores:', err)
    });
  }

  loadTalleres() {
    this.apiService.getTalleres().subscribe({
      next: (data) => this.talleres = data
    });
  }

  openModal() {
    this.editingProfesor = null;
    this.profesorForm.reset();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProfesor = null;
    this.profesorForm.reset();
  }

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

  deleteProfesor(id: number) {
    if (confirm('¿Estás seguro de eliminar este profesor?')) {
      this.apiService.deleteProfesor(id).subscribe({
        next: () => this.loadProfesores()
      });
    }
  }
}

