import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Admin, CreateAdminDto } from '../../models/admin.model';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Administradores</h1>
        <button (click)="openModal()" 
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
          + Nuevo Admin
        </button>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-2xl font-bold mb-4">{{ editingAdmin ? 'Editar' : 'Nuevo' }} Administrador</h2>
          <form [formGroup]="adminForm" (ngSubmit)="saveAdmin()">
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
              <div *ngIf="!editingAdmin">
                <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input formControlName="password" type="password" 
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

      <!-- Lista de Admins -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let admin of admins">
              <td class="px-6 py-4 whitespace-nowrap">{{ admin.nombre }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ admin.rut }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ admin.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button (click)="deleteAdmin(admin.id)" class="text-red-600 hover:text-red-700">🗑️</button>
              </td>
            </tr>
            <tr *ngIf="admins.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-gray-500">No hay administradores registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class AdminsComponent implements OnInit {
  admins: Admin[] = [];
  showModal = false;
  editingAdmin: Admin | null = null;
  adminForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.adminForm = this.fb.group({
      nombre: ['', Validators.required],
      rut: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });
  }

  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins() {
    this.apiService.getAdmins().subscribe({
      next: (data) => this.admins = data,
      error: (err) => console.error('Error cargando admins:', err)
    });
  }

  openModal() {
    this.editingAdmin = null;
    this.adminForm.reset();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingAdmin = null;
    this.adminForm.reset();
  }

  saveAdmin() {
    if (this.adminForm.valid) {
      const data: CreateAdminDto = this.adminForm.value;
      this.apiService.createAdmin(data).subscribe({
        next: () => {
          this.loadAdmins();
          this.closeModal();
        }
      });
    }
  }

  deleteAdmin(id: number) {
    if (confirm('¿Estás seguro de eliminar este administrador?')) {
      this.apiService.deleteAdmin(id).subscribe({
        next: () => this.loadAdmins()
      });
    }
  }
}

