import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AlumnoPrivacidadService } from '../../shared/services/alumno-privacidad.service';
import { Alumno, CreateAlumnoDto } from '../../models/alumno.model';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Alumnos</h1>
        <button (click)="openModal()" 
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
          + Nuevo Alumno
        </button>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-4">{{ editingAlumno ? 'Editar' : 'Nuevo' }} Alumno</h2>
          <form [formGroup]="alumnoForm" (ngSubmit)="saveAlumno()">
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <input formControlName="edad" type="number" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
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

      <!-- Lista de Alumnos -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taller</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let alumno of alumnos">
              <td class="px-6 py-4 whitespace-nowrap">{{ priv.nombre(alumno.nombre) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ priv.rut(alumno.rut) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ priv.email(alumno.email) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ alumno.taller?.tipo || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button (click)="editAlumno(alumno)" class="text-primary-600 hover:text-primary-700 mr-3">✏️</button>
                <button (click)="deleteAlumno(alumno.id)" class="text-red-600 hover:text-red-700">🗑️</button>
              </td>
            </tr>
            <tr *ngIf="alumnos.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay alumnos registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class AlumnosComponent implements OnInit {
  priv = inject(AlumnoPrivacidadService);
  alumnos: Alumno[] = [];
  showModal = false;
  editingAlumno: Alumno | null = null;
  alumnoForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.alumnoForm = this.fb.group({
      nombre: ['', Validators.required],
      rut: ['', Validators.required],
      email: [''],
      telefono: [''],
      edad: ['']
    });
  }

  ngOnInit() {
    this.loadAlumnos();
  }

  loadAlumnos() {
    this.apiService.getAlumnos().subscribe({
      next: (data) => this.alumnos = data,
      error: (err) => console.error('Error cargando alumnos:', err)
    });
  }

  openModal() {
    this.editingAlumno = null;
    this.alumnoForm.reset();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingAlumno = null;
    this.alumnoForm.reset();
  }

  editAlumno(alumno: Alumno) {
    this.editingAlumno = alumno;
    this.alumnoForm.patchValue({
      nombre: alumno.nombre,
      rut: alumno.rut,
      email: alumno.email || '',
      telefono: alumno.telefono || '',
      edad: alumno.edad ?? ''
    });
    this.showModal = true;
  }

  private buildAlumnoPayload(): CreateAlumnoDto {
    const v = this.alumnoForm.value;
    return {
      nombre: v.nombre?.trim() ?? '',
      rut: v.rut?.trim() ?? '',
      email: v.email?.trim() || undefined,
      telefono: v.telefono?.trim() || undefined,
      edad: v.edad !== '' && v.edad != null ? Number(v.edad) : undefined,
    };
  }

  saveAlumno() {
    if (this.alumnoForm.valid) {
      const data = this.buildAlumnoPayload();
      if (this.editingAlumno) {
        this.apiService.updateAlumno(this.editingAlumno.id, data).subscribe({
          next: () => {
            this.loadAlumnos();
            this.closeModal();
          },
          error: (err) => {
            const msg = err?.error?.message || err?.message || 'Revisa los datos.';
            alert('Error al actualizar: ' + msg);
          }
        });
      } else {
        this.apiService.createAlumno(data).subscribe({
          next: () => {
            this.loadAlumnos();
            this.closeModal();
          },
          error: (err) => {
            const msg = err?.error?.message || err?.message || 'Revisa los datos (RUT único, email válido).';
            alert('Error al crear alumno: ' + msg);
          }
        });
      }
    }
  }

  deleteAlumno(id: number) {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.apiService.deleteAlumno(id).subscribe({
        next: () => this.loadAlumnos()
      });
    }
  }
}

