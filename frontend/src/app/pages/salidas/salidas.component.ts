import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Salida, CreateSalidaDto } from '../../models/salida.model';
import { Taller } from '../../models/taller.model';

@Component({
  selector: 'app-salidas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Salidas</h1>
        <button (click)="openModal()" 
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
          + Nueva Salida
        </button>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-4">{{ editingSalida ? 'Editar' : 'Nueva' }} Salida</h2>
          <form [formGroup]="salidaForm" (ngSubmit)="saveSalida()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <input formControlName="destino" type="text" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input formControlName="fecha" type="date" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <input formControlName="hora" type="time" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea formControlName="descripcion" rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
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

      <!-- Lista de Salidas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let salida of salidas" 
             class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">{{ salida.destino }}</h3>
              <p class="text-sm text-gray-500">{{ salida.fecha | date:'short' }}</p>
            </div>
            <div class="flex space-x-2">
              <button (click)="editSalida(salida)" class="text-primary-600 hover:text-primary-700">✏️</button>
              <button (click)="deleteSalida(salida.id)" class="text-red-600 hover:text-red-700">🗑️</button>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <div *ngIf="salida.hora"><span class="font-medium">Hora:</span> {{ salida.hora }}</div>
            <div><span class="font-medium">Taller:</span> {{ salida.taller?.tipo || '-' }}</div>
            <div *ngIf="salida.descripcion" class="text-gray-600">{{ salida.descripcion }}</div>
          </div>
        </div>
        <div *ngIf="salidas.length === 0" class="col-span-full text-center text-gray-500 py-12">
          No hay salidas registradas
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SalidasComponent implements OnInit {
  salidas: Salida[] = [];
  talleres: Taller[] = [];
  showModal = false;
  editingSalida: Salida | null = null;
  salidaForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.salidaForm = this.fb.group({
      destino: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: [''],
      descripcion: [''],
      tallerId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSalidas();
    this.loadTalleres();
  }

  loadSalidas() {
    this.apiService.getSalidas().subscribe({
      next: (data) => this.salidas = data,
      error: (err) => console.error('Error cargando salidas:', err)
    });
  }

  loadTalleres() {
    this.apiService.getTalleres().subscribe({
      next: (data) => this.talleres = data
    });
  }

  openModal() {
    this.editingSalida = null;
    this.salidaForm.reset();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingSalida = null;
    this.salidaForm.reset();
  }

  editSalida(salida: Salida) {
    this.editingSalida = salida;
    const fecha = new Date(salida.fecha);
    this.salidaForm.patchValue({
      destino: salida.destino,
      fecha: fecha.toISOString().split('T')[0],
      hora: salida.hora || '',
      descripcion: salida.descripcion || '',
      tallerId: salida.tallerId
    });
    this.showModal = true;
  }

  saveSalida() {
    if (this.salidaForm.valid) {
      const data: CreateSalidaDto = this.salidaForm.value;
      if (this.editingSalida) {
        this.apiService.updateSalida(this.editingSalida.id, data).subscribe({
          next: () => {
            this.loadSalidas();
            this.closeModal();
          }
        });
      } else {
        this.apiService.createSalida(data).subscribe({
          next: () => {
            this.loadSalidas();
            this.closeModal();
          }
        });
      }
    }
  }

  deleteSalida(id: number) {
    if (confirm('¿Estás seguro de eliminar esta salida?')) {
      this.apiService.deleteSalida(id).subscribe({
        next: () => this.loadSalidas()
      });
    }
  }
}

