import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Reserva, CreateReservaDto } from '../../models/reserva.model';
import { Taller } from '../../models/taller.model';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Reservas</h1>
        <button (click)="openModal()" 
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
          + Nueva Reserva
        </button>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-4">{{ editingReserva ? 'Editar' : 'Nueva' }} Reserva</h2>
          <form [formGroup]="reservaForm" (ngSubmit)="saveReserva()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Espacio</label>
                <input formControlName="espacio" type="text" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input formControlName="fecha" type="date" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                <input formControlName="horaInicio" type="time" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                <input formControlName="horaFin" type="time" 
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
              @if (auth.isAdmin() || auth.isSuperAdmin()) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Reservado por (profesor)</label>
                  <select formControlName="profesorId" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Ninguno / Super Admin</option>
                    <option *ngFor="let p of profesores" [value]="p.id">{{ p.nombre }} ({{ p.taller?.tipo }})</option>
                  </select>
                </div>
              }
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

      <!-- Lista de Reservas -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Espacio</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taller</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let reserva of reservas">
              <td class="px-6 py-4 whitespace-nowrap">{{ reserva.espacio }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ reserva.fecha | date:'short' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ reserva.horaInicio }} - {{ reserva.horaFin }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ reserva.taller?.tipo || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button (click)="editReserva(reserva)" class="text-primary-600 hover:text-primary-700 mr-3">✏️</button>
                <button (click)="deleteReserva(reserva.id)" class="text-red-600 hover:text-red-700">🗑️</button>
              </td>
            </tr>
            <tr *ngIf="reservas.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay reservas registradas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class ReservasComponent implements OnInit {
  auth = inject(AuthRoleService);
  reservas: Reserva[] = [];
  talleres: Taller[] = [];
  profesores: any[] = [];
  showModal = false;
  editingReserva: Reserva | null = null;
  reservaForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.reservaForm = this.fb.group({
      espacio: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: [''],
      horaFin: [''],
      tallerId: ['', Validators.required],
      profesorId: [null as number | null]
    });
  }

  ngOnInit() {
    this.loadReservas();
    this.loadTalleres();
    this.apiService.getProfesores().subscribe({
      next: (data) => this.profesores = data,
      error: () => this.profesores = []
    });
  }

  loadReservas() {
    this.apiService.getReservas().subscribe({
      next: (data) => this.reservas = data,
      error: (err) => console.error('Error cargando reservas:', err)
    });
  }

  loadTalleres() {
    this.apiService.getTalleres().subscribe({
      next: (data) => this.talleres = data
    });
  }

  openModal() {
    this.editingReserva = null;
    this.reservaForm.reset();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingReserva = null;
    this.reservaForm.reset();
  }

  editReserva(reserva: Reserva) {
    this.editingReserva = reserva;
    const fecha = new Date(reserva.fecha);
    this.reservaForm.patchValue({
      espacio: reserva.espacio,
      fecha: fecha.toISOString().split('T')[0],
      horaInicio: reserva.horaInicio || '',
      horaFin: reserva.horaFin || '',
      tallerId: reserva.tallerId,
      profesorId: (reserva as any).profesorId ?? null
    });
    this.showModal = true;
  }

  saveReserva() {
    if (this.reservaForm.valid) {
      const raw = this.reservaForm.value;
      const data: CreateReservaDto = {
        espacio: raw.espacio,
        fecha: raw.fecha,
        horaInicio: raw.horaInicio || undefined,
        horaFin: raw.horaFin || undefined,
        tallerId: Number(raw.tallerId),
        profesorId: raw.profesorId ? Number(raw.profesorId) : undefined
      };
      if (this.editingReserva) {
        this.apiService.updateReserva(this.editingReserva.id, data).subscribe({
          next: () => {
            this.loadReservas();
            this.closeModal();
          }
        });
      } else {
        this.apiService.createReserva(data).subscribe({
          next: () => {
            this.loadReservas();
            this.closeModal();
          }
        });
      }
    }
  }

  deleteReserva(id: number) {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      this.apiService.deleteReserva(id).subscribe({
        next: () => this.loadReservas()
      });
    }
  }
}

