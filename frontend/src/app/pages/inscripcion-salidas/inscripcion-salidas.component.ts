import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Taller } from '../../models/taller.model';
import { CreateSalidaDto } from '../../models/salida.model';

@Component({
  selector: 'app-inscripcion-salidas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Inscripción de Salidas</h1>
        <p class="text-gray-600">Registra nuevas salidas para los talleres</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Formulario de Inscripción de Salida -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Nueva Salida</h2>
          
          <form [formGroup]="salidaForm" (ngSubmit)="registrarSalida()">
            <div class="space-y-4">
              <!-- Seleccionar Taller -->
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

              <!-- Destino -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <input formControlName="destino" type="text" 
                       placeholder="Ej: Parque Nacional, Museo, etc."
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>

              <!-- Fecha -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input formControlName="fecha" type="date" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>

              <!-- Hora -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <input formControlName="hora" type="time" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea formControlName="descripcion" rows="4"
                          placeholder="Detalles de la salida..."
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
              </div>

              <!-- Alumnos inscritos en el taller: el profesor selecciona quiénes van a la salida -->
              <div *ngIf="alumnosDelTaller.length > 0">
                <label class="block text-sm font-medium text-gray-700 mb-2">Alumnos del taller (selecciona los que van a esta salida)</label>
                <div class="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50 space-y-2">
                  <label *ngFor="let alumno of alumnosDelTaller" class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                    <input type="checkbox" [checked]="estaSeleccionado(alumno.id)" (change)="toggleAlumno(alumno.id)"
                           class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                    <span class="text-gray-800">{{ alumno.nombre }} ({{ alumno.rut }})</span>
                  </label>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ alumnosSeleccionados.length }} de {{ alumnosDelTaller.length }} seleccionados</p>
              </div>
              <div *ngIf="tallerIdSeleccionado && alumnosDelTaller.length === 0" class="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                No hay alumnos aceptados en este taller. Los alumnos deben inscribirse en el taller y ser aceptados por el profesor.
              </div>
            </div>

            <button type="submit" 
                    [disabled]="salidaForm.invalid"
                    class="w-full mt-6 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
              Registrar Salida
            </button>
          </form>
        </div>

        <!-- Lista de Salidas Programadas -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Salidas Programadas</h2>
          
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div *ngFor="let salida of salidas" 
                 class="border-l-4 border-purple-500 pl-4 py-3 bg-gray-50 rounded">
              <h3 class="font-semibold text-gray-800">{{ salida.destino }}</h3>
              <p class="text-sm text-gray-600">{{ salida.descripcion || 'Sin descripción' }}</p>
              <div class="flex justify-between text-sm text-gray-500 mt-2">
                <span>{{ salida.fecha | date:'short' }}</span>
                <span *ngIf="salida.hora">{{ salida.hora }}</span>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                Taller: {{ salida.taller?.tipo || '-' }}
              </div>
            </div>
            <div *ngIf="salidas.length === 0" class="text-center text-gray-500 py-8">
              No hay salidas programadas
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class InscripcionSalidasComponent implements OnInit {
  talleres: Taller[] = [];
  salidas: any[] = [];
  salidaForm: FormGroup;

  alumnosDelTaller: any[] = [];
  alumnosSeleccionados: number[] = [];

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.salidaForm = this.fb.group({
      tallerId: ['', Validators.required],
      destino: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: [''],
      descripcion: ['']
    });
  }

  ngOnInit() {
    this.cargarTalleres();
    this.cargarSalidas();
    this.salidaForm.get('tallerId')?.valueChanges.subscribe((id) => {
      this.cargarAlumnosDelTaller(id ? Number(id) : null);
    });
    const idInicial = this.salidaForm.get('tallerId')?.value;
    if (idInicial) this.cargarAlumnosDelTaller(Number(idInicial));
  }

  cargarAlumnosDelTaller(tallerId: number | null): void {
    this.alumnosSeleccionados = [];
    if (!tallerId) {
      this.alumnosDelTaller = [];
      return;
    }
    // Alumnos inscritos (aceptados) en el taller, para que el profesor los seleccione para la salida
    this.apiService.getInscripcionesTallerPorTaller(tallerId).subscribe({
      next: (inscripciones) => {
        const aceptados = (inscripciones || []).filter((i: any) => (i.estado || '').toUpperCase() === 'ACEPTADO');
        const alumnos = aceptados
          .map((i: any) => i.alumno)
          .filter((a: any) => a && a.id);
        const seen = new Set<number>();
        this.alumnosDelTaller = alumnos.filter((a: any) => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });
      },
      error: () => this.alumnosDelTaller = []
    });
  }

  estaSeleccionado(alumnoId: number): boolean {
    return this.alumnosSeleccionados.includes(alumnoId);
  }

  toggleAlumno(alumnoId: number): void {
    const i = this.alumnosSeleccionados.indexOf(alumnoId);
    if (i >= 0) {
      this.alumnosSeleccionados = this.alumnosSeleccionados.filter(id => id !== alumnoId);
    } else {
      this.alumnosSeleccionados = [...this.alumnosSeleccionados, alumnoId];
    }
  }

  get tallerIdSeleccionado(): number | null {
    const v = this.salidaForm.get('tallerId')?.value;
    return v !== '' && v != null ? Number(v) : null;
  }

  cargarTalleres() {
    this.apiService.getTalleres().subscribe({
      next: (data) => this.talleres = data,
      error: (err) => console.error('Error cargando talleres:', err)
    });
  }

  cargarSalidas() {
    this.apiService.getSalidas().subscribe({
      next: (data) => this.salidas = data,
      error: (err) => console.error('Error cargando salidas:', err)
    });
  }

  registrarSalida() {
    if (this.salidaForm.valid) {
      const raw = this.salidaForm.value;
      const data: CreateSalidaDto = {
        tallerId: Number(raw.tallerId),
        destino: raw.destino,
        fecha: raw.fecha,
        hora: raw.hora || undefined,
        descripcion: raw.descripcion || undefined
      };
      this.apiService.createSalida(data).subscribe({
        next: (salidaCreada) => {
          const salidaId = salidaCreada?.id;
          if (salidaId && this.alumnosSeleccionados.length > 0) {
            let pendientes = this.alumnosSeleccionados.length;
            this.alumnosSeleccionados.forEach(alumnoId => {
              this.apiService.inscribirSalida(alumnoId, salidaId).subscribe({
                next: () => {
                  pendientes--;
                  if (pendientes === 0) {
                    this.finalizarRegistro();
                  }
                },
                error: () => {
                  pendientes--;
                  if (pendientes === 0) this.finalizarRegistro();
                }
              });
            });
          } else {
            this.finalizarRegistro();
          }
        },
        error: (err) => {
          console.error('Error registrando salida:', err);
          alert('Error al registrar la salida');
        }
      });
    }
  }

  private finalizarRegistro(): void {
    alert('Salida registrada exitosamente');
    this.salidaForm.reset();
    this.alumnosSeleccionados = [];
    this.alumnosDelTaller = [];
    this.cargarSalidas();
  }
}

