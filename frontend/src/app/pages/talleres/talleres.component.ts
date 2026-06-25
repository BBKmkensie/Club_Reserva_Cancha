import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Taller, CreateTallerDto } from '../../models/taller.model';

@Component({
  selector: 'app-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Talleres</h1>
        @if (auth.canAccessTalleresCRUD()) {
          <button (click)="openModal()" 
                  class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
            + Nuevo Taller
          </button>
        }
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-2xl font-bold mb-4">{{ editingTaller ? 'Editar' : 'Nuevo' }} Taller</h2>
          <form [formGroup]="tallerForm" (ngSubmit)="saveTaller()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <input formControlName="tipo" type="text" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea formControlName="descripcion" rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                <input formControlName="capacidad" type="number" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input formControlName="fechaInicio" type="date" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
                <input formControlName="imagenUrl" type="url" placeholder="https://..."
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
             class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
             [routerLink]="['/taller', taller.id]">
          <img *ngIf="taller.imagenUrl" [src]="taller.imagenUrl" alt="{{ taller.tipo }}" 
               class="w-full h-32 object-cover rounded-lg mb-3">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-gray-800">{{ taller.tipo }}</h3>
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
          <p class="text-gray-600 mb-3">{{ taller.descripcion }}</p>
          <div class="flex justify-between text-sm text-gray-500 mb-3">
            <span>Capacidad: {{ taller.capacidad }}</span>
            <span *ngIf="taller.fechaInicio">{{ taller.fechaInicio | date:'short' }}</span>
          </div>
          <button class="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                  (click)="$event.stopPropagation()"
                  [routerLink]="['/taller', taller.id]">
            Ver Detalles
          </button>
        </div>
        <div *ngIf="talleresFiltrados.length === 0" class="col-span-full text-center text-gray-500 py-12">
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
  auth = inject(AuthRoleService);
  talleres: Taller[] = [];
  talleresFiltrados: Taller[] = [];
  showModal = false;
  editingTaller: Taller | null = null;
  tallerForm: FormGroup;
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

  ngOnInit() {
    // Leer queryParams para filtrar por tipo
    this.route.queryParams.subscribe(params => {
      this.tipoFiltro = params['tipo'] || null;
      this.loadTalleres();
    });
  }

  loadTalleres() {
    this.apiService.getTalleres().subscribe({
      next: (data) => {
        this.talleres = data;
        this.aplicarFiltro();
      },
      error: (err) => console.error('Error cargando talleres:', err)
    });
  }

  aplicarFiltro() {
    if (this.tipoFiltro) {
      this.talleresFiltrados = this.talleres.filter(t => 
        t.tipo.toLowerCase() === this.tipoFiltro!.toLowerCase()
      );
    } else {
      this.talleresFiltrados = this.talleres;
    }
  }

  openModal() {
    this.editingTaller = null;
    this.tallerForm.reset({ capacidad: 20 });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingTaller = null;
    this.tallerForm.reset();
  }

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

  deleteTaller(id: number) {
    if (confirm('¿Estás seguro de eliminar este taller?')) {
      this.apiService.deleteTaller(id).subscribe({
        next: () => this.loadTalleres()
      });
    }
  }

  limpiarFiltro() {
    this.tipoFiltro = null;
    this.router.navigate(['/talleres'], { queryParams: {} });
    this.aplicarFiltro();
  }
}

