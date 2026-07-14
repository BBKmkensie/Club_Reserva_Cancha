/**
 * =============================================================================
 * app/pages/alumnos/alumnos.component.ts — CRUD de alumnos
 * =============================================================================
 * Registro y mantenimiento de estudiantes del club.
 * Rol: coordinación — canVerAlumnos().
 * Enmascara datos sensibles vía AlumnoPrivacidadService (super admin).
 * Endpoints ApiService: getAlumnos, createAlumno, updateAlumno, deleteAlumno
 * =============================================================================
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AlumnoPrivacidadService } from '../../shared/services/alumno-privacidad.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Alumno, CreateAlumnoDto } from '../../models/alumno.model';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 min-w-0 max-w-full">
      <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between sm:items-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink">Alumnos</h1>
        @if (puedeCrearAlumno()) {
          <button type="button" (click)="openModal()"
                  class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition self-start sm:self-auto shrink-0">
            + Nuevo Alumno
          </button>
        }
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
        <div class="bg-surface rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl sm:text-2xl font-bold mb-4">{{ editingAlumno ? 'Editar' : 'Nuevo' }} Alumno</h2>
          <form [formGroup]="alumnoForm" (ngSubmit)="saveAlumno()">
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
                <label class="block text-sm font-medium text-ink-secondary mb-1">Edad (18–60)</label>
                <input formControlName="edad" type="number" min="18" max="60"
                       class="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                <p *ngIf="alumnoForm.get('edad')?.invalid && alumnoForm.get('edad')?.touched"
                   class="text-red-600 text-xs mt-1">La edad debe estar entre 18 y 60 años</p>
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

      <!-- Móvil / tablet estrecha: una tarjeta por alumno con todos los datos -->
      <div class="alumnos-cards space-y-3">
        <p *ngIf="alumnos.length === 0" class="text-center text-ink-muted py-6 bg-surface rounded-lg border border-line">
          No hay alumnos registrados
        </p>
        <article *ngFor="let alumno of alumnos"
                 class="bg-surface rounded-xl border border-line shadow-sm p-4 space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h2 class="font-semibold text-ink text-base break-words">{{ priv.nombre(alumno.nombre) }}</h2>
              <p class="text-sm text-ink-muted mt-0.5 break-all">RUT {{ priv.rut(alumno.rut) }}</p>
            </div>
            @if (puedeCrearAlumno()) {
              <div class="flex shrink-0 gap-1">
                <button type="button" (click)="editAlumno(alumno)"
                        class="text-primary-600 hover:text-primary-700 p-2 touch-manipulation" aria-label="Editar">✏️</button>
                <button type="button" (click)="deleteAlumno(alumno.id)"
                        class="text-red-600 hover:text-red-700 p-2 touch-manipulation" aria-label="Eliminar">🗑️</button>
              </div>
            }
          </div>
          <dl class="space-y-2 text-sm border-t border-line pt-3">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-ink-muted">Email</dt>
              <dd class="text-ink break-all mt-0.5">{{ priv.email(alumno.email) || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-ink-muted">Teléfono</dt>
              <dd class="text-ink break-all mt-0.5">{{ priv.telefono(alumno.telefono) || '—' }}</dd>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-ink-muted">Edad</dt>
                <dd class="text-ink mt-0.5">{{ alumno.edad ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-ink-muted">Taller</dt>
                <dd class="text-ink break-words mt-0.5">{{ alumno.taller?.tipo || '—' }}</dd>
              </div>
            </div>
          </dl>
        </article>
      </div>

      <!-- Desktop: tabla completa -->
      <div class="alumnos-table bg-surface rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-line">
          <thead class="bg-page">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Nombre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">RUT</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Email</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Teléfono</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Edad</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Taller</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-surface divide-y divide-line">
            <tr *ngFor="let alumno of alumnos">
              <td class="px-4 py-3">{{ priv.nombre(alumno.nombre) }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ priv.rut(alumno.rut) }}</td>
              <td class="px-4 py-3 break-all">{{ priv.email(alumno.email) || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ priv.telefono(alumno.telefono) || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ alumno.edad ?? '—' }}</td>
              <td class="px-4 py-3">{{ alumno.taller?.tipo || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                @if (puedeCrearAlumno()) {
                  <button (click)="editAlumno(alumno)" class="text-primary-600 hover:text-primary-700 mr-3">✏️</button>
                  <button (click)="deleteAlumno(alumno.id)" class="text-red-600 hover:text-red-700">🗑️</button>
                }
              </td>
            </tr>
            <tr *ngIf="alumnos.length === 0">
              <td colspan="7" class="px-4 py-4 text-center text-ink-muted">No hay alumnos registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    /* iPhone SE / móvil: tarjetas con todos los datos; oculta tabla */
    .alumnos-table {
      display: none;
    }
    .alumnos-cards {
      display: block;
    }
    @media (min-width: 768px) {
      .alumnos-cards {
        display: none;
      }
      .alumnos-table {
        display: block;
      }
    }
  `],
})
export class AlumnosComponent implements OnInit {
  /** Enmascara datos personales en la tabla según rol. */
  priv = inject(AlumnoPrivacidadService);
  /** Permisos de CRUD de alumnos. */
  auth = inject(AuthRoleService);
  /** Listado cargado desde la API. */
  alumnos: Alumno[] = [];
  /** true = modal crear/editar visible. */
  showModal = false;
  /** Alumno en edición; null = modo crear. */
  editingAlumno: Alumno | null = null;
  /** Formulario reactivo del modal. */
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
      edad: ['', [Validators.min(18), Validators.max(60)]]
    });
  }

  /** Carga el listado de alumnos al iniciar la página. */
  ngOnInit() {
    this.loadAlumnos();
  }

  /** Super Admin solo consulta; no crea ni edita alumnos. */
  puedeCrearAlumno(): boolean {
    return this.auth.currentRole() !== 'super_admin';
  }

  /** Obtiene todos los alumnos desde la API. */
  loadAlumnos() {
    this.apiService.getAlumnos().subscribe({
      next: (data) => this.alumnos = data,
      error: (err) => console.error('Error cargando alumnos:', err)
    });
  }

  /** Abre el modal en modo crear (formulario vacío). */
  openModal() {
    if (!this.puedeCrearAlumno()) return;
    this.editingAlumno = null;
    this.alumnoForm.reset();
    this.showModal = true;
  }

  /** Cierra el modal y limpia el estado de edición. */
  closeModal() {
    this.showModal = false;
    this.editingAlumno = null;
    this.alumnoForm.reset();
  }

  /** Abre el modal en modo editar con los datos del alumno. */
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

  /** Arma el DTO de creación/actualización desde el FormGroup. */
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

  /** Crea o actualiza un alumno según el modo del modal. */
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

  /** Elimina un alumno tras confirmación del usuario. */
  deleteAlumno(id: number) {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.apiService.deleteAlumno(id).subscribe({
        next: () => this.loadAlumnos()
      });
    }
  }
}

