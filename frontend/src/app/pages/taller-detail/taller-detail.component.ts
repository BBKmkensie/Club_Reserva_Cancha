import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { AlumnoPrivacidadService } from '../../shared/services/alumno-privacidad.service';
import { Taller } from '../../models/taller.model';
import { Profesor } from '../../models/profesor.model';
import { Alumno } from '../../models/alumno.model';
import { Reserva } from '../../models/reserva.model';
import { HorariosTallerComponent } from '../../shared/components/horarios-taller/horarios-taller.component';
import { FichaGraficoTallerComponent } from '../../shared/components/ficha-grafico-taller/ficha-grafico-taller.component';
import { textoHorarioTaller, tituloTablaHorarios } from '../../shared/utils/horario-taller.util';

@Component({
  selector: 'app-taller-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule, HorariosTallerComponent, FichaGraficoTallerComponent],
  template: `
    <div class="space-y-4 sm:space-y-6">
      <!-- Título del Taller -->
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h1 class="text-2xl sm:text-4xl font-bold text-gray-800 text-center uppercase break-words">{{ taller?.tipo }}</h1>
      </div>

      <!-- Descripción del Taller -->
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <!-- Foto del Profesor -->
          <div class="flex-shrink-0 mx-auto sm:mx-0">
            <div *ngIf="profesor && profesor.fotoPath" class="w-28 h-36 sm:w-32 sm:h-40 rounded-lg overflow-hidden">
              <img [src]="profesor.fotoPath" [alt]="profesor.nombre" 
                   class="w-full h-full object-cover">
            </div>
            <div *ngIf="profesor && !profesor.fotoPath" class="w-32 h-40 rounded-lg bg-gray-200 flex items-center justify-center">
              <div class="text-center">
                <div class="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-2">
                  {{ profesor.nombre.charAt(0) }}
                </div>
                <p class="text-sm text-gray-600">Foto del profesor</p>
              </div>
            </div>
            <div *ngIf="!profesor" class="w-32 h-40 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
              <p class="text-sm text-gray-500 text-center">Foto del profesor</p>
            </div>
          </div>

          <!-- Descripción y Objetivos -->
          <div class="flex-1 flex flex-col space-y-4">
            <div>
              <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h2 class="text-xl font-semibold text-gray-800">Descripción del Taller</h2>
                @if (taller && puedeEditarPresentacion()) {
                  <button type="button" (click)="abrirEditarPresentacion()"
                          class="text-sm text-primary-600 hover:text-primary-800 font-medium px-3 py-1 rounded-lg border border-primary-200 hover:bg-primary-50 transition">
                    Editar descripción y foto
                  </button>
                }
              </div>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ descripcionTexto }}</p>
            </div>

            <div *ngIf="profesor">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Profesor</h3>
              <p class="text-gray-700">{{ profesor.nombre }}</p>
            </div>

            <!-- Botón Inscribirse (solo alumno logueado) -->
            @if (auth.canInscribirseTalleres() && alumnoId && taller) {
              <div class="pt-3 mt-auto flex justify-end">
              @if (estadoSolicitud === 'PENDIENTE') {
                <p class="text-amber-600 font-medium text-right">Solicitud enviada (pendiente de respuesta)</p>
              } @else if (estadoSolicitud === 'ACEPTADO') {
                <p class="text-green-600 font-medium text-right">Estás inscrito en este taller</p>
              } @else if (estadoSolicitud === 'RECHAZADO') {
                <button (click)="abrirConfirmacion()"
                        class="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 shadow-sm font-medium">
                  Volver a solicitar inscripción
                </button>
              } @else {
                <button (click)="abrirConfirmacion()"
                        class="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 shadow-md font-semibold text-sm sm:text-base transition hover:shadow-lg">
                  Inscribirse en este taller
                </button>
              }
              </div>
            }
          </div>
        </div>

        <!-- Imagen del Taller -->
        <div class="mt-6">
          <div *ngIf="taller && taller.imagenUrl" class="w-full h-64 rounded-lg overflow-hidden">
            <img [src]="taller.imagenUrl" [alt]="'Imagen del taller ' + (taller.tipo || '')" 
                 class="w-full h-full object-cover">
          </div>
          <div *ngIf="!taller || !taller.imagenUrl" class="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p class="text-gray-500">Imagen del taller {{ taller?.tipo || '' }}</p>
          </div>
        </div>
      </div>

      <!-- Solicitudes pendientes (solo profesor/admin) -->
      @if (auth.canGestionarInscripcionesTaller() && taller && puedeGestionarEsteTaller()) {
        <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Solicitudes de inscripción</h2>
          @if (solicitudesPendientes.length > 0) {
            <ul class="space-y-2">
              @for (s of solicitudesPendientes; track s.id) {
                <li class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 px-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div class="min-w-0">
                    <span class="font-medium break-words">{{ textoAlumno(s.alumno) }}</span>
                    <p class="text-xs text-gray-600 mt-1">{{ textoFicha(s) }}</p>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    <button (click)="responderSolicitud(s.id, 'ACEPTADO')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Aceptar</button>
                    <button (click)="responderSolicitud(s.id, 'RECHAZADO')" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Rechazar</button>
                  </div>
                </li>
              }
            </ul>
          } @else {
            <p class="text-gray-500">No hay solicitudes pendientes</p>
          }
        </div>
      }

      @if (taller) {
        <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <button (click)="toggleHorarios()" type="button"
                  class="w-full flex items-center justify-between text-left py-2 rounded-lg hover:bg-gray-50 transition">
            <h2 class="text-xl sm:text-2xl font-semibold text-gray-800">{{ tituloHorariosSeccion() }}</h2>
            <svg class="w-6 h-6 text-gray-600 transition-transform flex-shrink-0"
                 [class.rotate-180]="horariosExpanded"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div *ngIf="horariosExpanded" class="mt-4 pt-4 border-t border-gray-100">
            <app-horarios-taller [taller]="taller" [mostrarTitulo]="false" />
          </div>
        </div>
      }

      <!-- Alumnos inscritos (aceptados) -->
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <button (click)="toggleAlumnos()" type="button"
                class="w-full flex items-center justify-between text-left py-2 rounded-lg hover:bg-gray-50 transition">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-800">Alumnos inscritos</h2>
          <svg class="w-6 h-6 text-gray-600 transition-transform flex-shrink-0"
               [class.rotate-180]="alumnosExpanded"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div *ngIf="alumnosExpanded" class="mt-4 pt-4 border-t border-gray-100">
          <ul class="space-y-2">
            @for (insc of listaInscritosAceptados; track insc.id) {
              <li class="py-2 px-3 bg-gray-50 rounded-lg text-gray-800">
                <span class="font-medium">{{ priv.alumno(insc.alumno).nombre }} {{ priv.alumno(insc.alumno).rut }}</span>
                <p class="text-xs text-gray-600 mt-1">{{ textoFicha(insc) }}</p>
              </li>
            }
          </ul>
          <p *ngIf="listaInscritosAceptados.length === 0" class="text-gray-500 py-4 text-center">No hay alumnos inscritos en este taller</p>
        </div>
      </div>

      <!-- Gráfico ficha física (después de alumnos inscritos) -->
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <button (click)="toggleGrafico()" type="button"
                class="w-full flex items-center justify-between text-left py-2 rounded-lg hover:bg-gray-50 transition">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-800">Gráfico ficha física</h2>
          <svg class="w-6 h-6 text-gray-600 transition-transform flex-shrink-0"
               [class.rotate-180]="graficoExpanded"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div *ngIf="graficoExpanded" class="mt-4 pt-4 border-t border-gray-100">
          <app-ficha-grafico-taller [inscripciones]="listaInscritosAceptados" [enmascararNombres]="priv.debeEnmascarar()" />
        </div>
      </div>
    </div>

    @if (editandoPresentacion && taller) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-1">Editar presentación del taller</h3>
          <p class="text-sm text-gray-600 mb-4">{{ taller.tipo }}</p>
          <div class="space-y-4">
            <label class="block text-sm">
              <span class="font-medium text-gray-700">Descripción del taller</span>
              <textarea [(ngModel)]="presentacionForm.descripcion" rows="5"
                        class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"></textarea>
            </label>
            @if (profesor) {
              <label class="block text-sm">
                <span class="font-medium text-gray-700">URL foto del profesor ({{ profesor.nombre }})</span>
                <input type="url" [(ngModel)]="presentacionForm.fotoPath" placeholder="https://..."
                       class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
              </label>
              @if (presentacionForm.fotoPath) {
                <div class="flex justify-center">
                  <img [src]="presentacionForm.fotoPath" alt="Vista previa"
                       class="w-24 h-32 object-cover rounded-lg border border-gray-200"
                       (error)="$any($event.target).style.display='none'">
                </div>
              }
            } @else {
              <p class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                Este taller aún no tiene profesor asignado; solo puedes editar la descripción.
              </p>
            }
          </div>
          @if (errorPresentacion) {
            <p class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mt-4">{{ errorPresentacion }}</p>
          }
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" (click)="cerrarEditarPresentacion()"
                    class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="button" (click)="guardarPresentacion()"
                    [disabled]="guardandoPresentacion || !presentacionValida()"
                    class="px-4 py-2 rounded-lg bg-primary-600 text-white disabled:opacity-50 hover:bg-primary-700">
              {{ guardandoPresentacion ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (mostrarConfirmacion && taller) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-2">Confirmar inscripción</h3>
          <p class="text-gray-600 mb-4">¿Deseas inscribirte en <strong>{{ taller.tipo }}</strong>?</p>
          <div class="bg-gray-50 rounded-lg p-4 text-sm space-y-2 mb-4">
            <p><strong>Horario:</strong> {{ textoHorario(taller) }}</p>
            @if (validacion) {
              <p><strong>Cupos disponibles:</strong> {{ validacion.cuposDisponibles }} de {{ validacion.capacidad }}</p>
            }
          </div>
          <div class="border border-primary-200 bg-primary-50 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-gray-800 mb-2">Ficha del alumno</h4>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <label class="block">
                <span class="text-gray-700">Altura (cm)</span>
                <input type="number" [(ngModel)]="fichaForm.altura" min="50" max="250" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-gray-700">Peso (kg)</span>
                <input type="number" [(ngModel)]="fichaForm.peso" min="20" max="300" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-gray-700">% grasa</span>
                <input type="number" [(ngModel)]="fichaForm.porcentajeGrasa" min="1" max="60" step="0.1"
                       class="mt-1 w-full border rounded-lg px-2 py-1.5">
              </label>
              <label class="block">
                <span class="text-gray-700">Sedentario</span>
                <select [(ngModel)]="fichaForm.sedentario" class="mt-1 w-full border rounded-lg px-2 py-1.5">
                  <option [ngValue]="true">Sí</option>
                  <option [ngValue]="false">No</option>
                </select>
              </label>
            </div>
          </div>
          @if (errorInscripcion) {
            <p class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{{ errorInscripcion }}</p>
          }
          <div class="flex gap-3 justify-end">
            <button (click)="cerrarConfirmacion()" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancelar</button>
            <button (click)="confirmarInscripcion()"
                    [disabled]="!validacion?.puedeInscribirse || confirmando || !fichaValida()"
                    class="px-4 py-2 rounded-lg bg-primary-600 text-white disabled:opacity-50">
              {{ confirmando ? 'Enviando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class TallerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  auth = inject(AuthRoleService);
  priv = inject(AlumnoPrivacidadService);

  taller: Taller | null = null;
  profesor: Profesor | null = null;
  alumnos: Alumno[] = [];
  reservas: Reserva[] = [];
  inscripcionesTaller: any[] = [];
  fechaSeleccionada: string = '';
  horariosDisponibles: Array<{ horaInicio: string; horaFin: string; espacio: string }> = [];
  horarioSeleccionado: { horaInicio: string; horaFin: string; espacio: string } | null = null;
  alumnosExpanded: boolean = true;
  graficoExpanded: boolean = true;
  horariosExpanded: boolean = true;
  alumnoId: number | null = null;
  misSolicitudesTaller: any[] = [];
  mostrarConfirmacion = false;
  validacion: any = null;
  errorInscripcion = '';
  confirmando = false;
  fichaForm = { altura: null as number | null, peso: null as number | null, porcentajeGrasa: null as number | null, sedentario: false };
  editandoPresentacion = false;
  guardandoPresentacion = false;
  errorPresentacion = '';
  presentacionForm = { descripcion: '', fotoPath: '' };
  presentacionInicial = { descripcion: '', fotoPath: '' };

  get descripcionTexto(): string {
    return this.taller?.descripcion || 'Descripción del taller de ' + (this.taller?.tipo || '') + ', lo que hacen, sus objetivos, una pequeña descripción.';
  }

  get listaInscritosAceptados(): any[] {
    return this.inscripcionesTaller.filter((i: any) => i.estado === 'ACEPTADO');
  }

  get solicitudesPendientes(): any[] {
    return this.inscripcionesTaller.filter((i: any) => i.estado === 'PENDIENTE');
  }

  puedeGestionarEsteTaller(): boolean {
    if (!this.taller) return false;
    if (this.auth.isCoordinacion()) return true;
    const miTallerId = this.auth.currentTallerId();
    return miTallerId != null && miTallerId === this.taller.id;
  }

  puedeEditarPresentacion(): boolean {
    return this.taller != null && this.auth.canEditarPresentacionTaller(this.taller.id);
  }

  abrirEditarPresentacion() {
    if (!this.taller) return;
    this.presentacionForm = {
      descripcion: this.taller.descripcion ?? '',
      fotoPath: this.profesor?.fotoPath ?? '',
    };
    this.presentacionInicial = { ...this.presentacionForm };
    this.errorPresentacion = '';
    this.editandoPresentacion = true;
  }

  cerrarEditarPresentacion() {
    this.editandoPresentacion = false;
    this.errorPresentacion = '';
    this.guardandoPresentacion = false;
  }

  presentacionValida(): boolean {
    const desc = this.presentacionForm.descripcion.trim();
    const foto = this.presentacionForm.fotoPath.trim();
    const descCambio = desc !== this.presentacionInicial.descripcion.trim();
    const fotoCambio = foto !== this.presentacionInicial.fotoPath.trim();
    if (!descCambio && !fotoCambio) return false;
    if (descCambio && !desc) return false;
    return descCambio || (fotoCambio && !!this.profesor);
  }

  guardarPresentacion() {
    if (!this.taller || !this.presentacionValida()) return;

    const payload: { descripcion?: string; fotoPath?: string; profesorId?: number } = {};
    const desc = this.presentacionForm.descripcion.trim();
    const foto = this.presentacionForm.fotoPath.trim();

    if (desc !== this.presentacionInicial.descripcion.trim()) {
      payload.descripcion = desc;
    }
    if (foto !== this.presentacionInicial.fotoPath.trim() && this.profesor) {
      payload.fotoPath = foto;
      payload.profesorId = this.profesor.id;
    }

    const opts: { esDirectiva?: boolean; profesorId?: number } = {};
    if (this.auth.isCoordinacion()) {
      opts.esDirectiva = true;
    } else if (this.auth.isProfesor()) {
      const pid = this.auth.currentUserId();
      if (pid != null) opts.profesorId = pid;
    }

    this.guardandoPresentacion = true;
    this.errorPresentacion = '';
    this.apiService.actualizarPresentacionTaller(this.taller.id, payload, opts).subscribe({
      next: (res) => {
        if (res.taller) {
          this.taller = { ...this.taller!, ...res.taller };
        } else if (payload.descripcion) {
          this.taller = { ...this.taller!, descripcion: payload.descripcion };
        }
        if (res.profesor) {
          this.profesor = res.profesor;
        } else if (payload.fotoPath != null && this.profesor) {
          this.profesor = { ...this.profesor, fotoPath: payload.fotoPath || undefined };
        }
        this.guardandoPresentacion = false;
        this.editandoPresentacion = false;
      },
      error: (err) => {
        this.guardandoPresentacion = false;
        this.errorPresentacion = err?.error?.message || 'No se pudo guardar los cambios.';
      },
    });
  }

  get estadoSolicitud(): 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' | null {
    if (!this.taller || !this.misSolicitudesTaller.length) return null;
    const s = this.misSolicitudesTaller.find((x: any) => x.tallerId === this.taller!.id || x.taller?.id === this.taller!.id);
    return s ? s.estado : null;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarTaller(parseInt(id, 10));
    }
  }

  cargarTaller(id: number) {
    this.apiService.getTaller(id).subscribe({
      next: (data) => {
        this.taller = data;
        if (data.profesores && data.profesores.length > 0) {
          this.profesor = data.profesores[0];
        } else {
          this.cargarProfesor();
        }
        if (data.alumnos && Array.isArray(data.alumnos)) {
          this.alumnos = data.alumnos;
        } else {
          this.cargarAlumnos();
        }
        this.cargarReservas();
        this.cargarInscripcionesTaller(id);
        this.alumnoId = this.auth.currentUserId();
        if (this.alumnoId) {
          this.cargarMisSolicitudesTaller();
        }
      },
      error: (err) => {
        console.error('Error cargando taller:', err);
        // Si el taller no existe, crear uno temporal con el ID
        // o mostrar un mensaje de error sin redirigir
        if (err.status === 404) {
          // Crear un taller temporal para mostrar la página
          this.taller = {
            id: id,
            tipo: 'Futbol',
            descripcion: 'Descripción del taller de fútbol, lo que hacen, sus objetivos, una pequeña descripción.',
            capacidad: 20
          };
        } else {
          this.volver();
        }
      }
    });
  }

  cargarProfesor() {
    if (!this.taller) return;
    
    this.apiService.getProfesores(this.taller.id).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.profesor = data[0];
        }
      }
    });
  }

  cargarAlumnos() {
    if (!this.taller) return;
    
    this.apiService.getAlumnos(this.taller.id).subscribe({
      next: (data) => {
        this.alumnos = data;
      }
    });
  }

  cargarReservas() {
    if (!this.taller) return;
    
    this.apiService.getReservas(this.taller.id).subscribe({
      next: (data) => {
        this.reservas = data;
      }
    });
  }

  cargarInscripcionesTaller(tallerId: number) {
    this.apiService.getInscripcionesTallerPorTaller(tallerId).subscribe({
      next: (data) => {
        this.inscripcionesTaller = data;
      },
      error: () => {
        this.inscripcionesTaller = [];
      }
    });
  }

  cargarMisSolicitudesTaller() {
    if (!this.alumnoId) return;
    this.apiService.getInscripcionesTallerPorAlumno(this.alumnoId).subscribe({
      next: (data) => this.misSolicitudesTaller = data,
      error: () => this.misSolicitudesTaller = []
    });
  }

  textoHorario(taller: Taller): string {
    return textoHorarioTaller(taller);
  }

  tituloHorariosSeccion(): string {
    if (!this.taller) return 'Horarios';
    return tituloTablaHorarios(this.taller.modoHorario);
  }

  toggleHorarios() {
    this.horariosExpanded = !this.horariosExpanded;
  }

  textoFicha(s: any): string {
    if (s.altura == null && s.peso == null) return 'Sin ficha';
    const sed = s.sedentario === true ? 'sedentario' : s.sedentario === false ? 'activo' : '—';
    return `${s.altura ?? '—'} cm · ${s.peso ?? '—'} kg · ${s.porcentajeGrasa ?? '—'}% grasa · ${sed}`;
  }

  textoAlumno(alumno: { nombre?: string; rut?: string } | null | undefined): string {
    const d = this.priv.alumno(alumno);
    return `${d.nombre} (${d.rut})`;
  }

  fichaValida(): boolean {
    const { altura, peso, porcentajeGrasa } = this.fichaForm;
    return altura != null && altura >= 50 && altura <= 250
      && peso != null && peso >= 20 && peso <= 300
      && porcentajeGrasa != null && porcentajeGrasa >= 1 && porcentajeGrasa <= 60;
  }

  abrirConfirmacion() {
    if (!this.taller || !this.alumnoId) return;
    this.mostrarConfirmacion = true;
    this.validacion = null;
    this.errorInscripcion = '';
    this.fichaForm = { altura: null, peso: null, porcentajeGrasa: null, sedentario: false };
    this.apiService.validarInscripcionTaller(this.alumnoId, this.taller.id).subscribe({
      next: (v) => {
        this.validacion = v;
        if (!v.puedeInscribirse) {
          this.errorInscripcion = v.motivo ?? 'No puedes inscribirte';
        }
      },
      error: (err) => {
        this.errorInscripcion = err?.error?.message || 'Error al validar';
      }
    });
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.validacion = null;
    this.errorInscripcion = '';
    this.confirmando = false;
  }

  confirmarInscripcion() {
    if (!this.taller || !this.alumnoId || !this.validacion?.puedeInscribirse || !this.fichaValida()) return;
    this.confirmando = true;
    this.apiService.solicitarInscripcionTaller(this.alumnoId, this.taller.id, {
      altura: Number(this.fichaForm.altura),
      peso: Number(this.fichaForm.peso),
      porcentajeGrasa: Number(this.fichaForm.porcentajeGrasa),
      sedentario: this.fichaForm.sedentario,
    }).subscribe({
      next: () => {
        this.confirmando = false;
        this.cerrarConfirmacion();
        this.cargarMisSolicitudesTaller();
        this.cargarInscripcionesTaller(this.taller!.id);
        alert('Solicitud registrada. El coordinador/profesor la revisará.');
      },
      error: (err) => {
        this.confirmando = false;
        this.errorInscripcion = err?.error?.message || 'No se pudo enviar la solicitud.';
      }
    });
  }

  responderSolicitud(inscripcionId: number, estado: 'ACEPTADO' | 'RECHAZADO') {
    this.apiService.responderInscripcionTaller(inscripcionId, estado).subscribe({
      next: () => {
        if (this.taller) this.cargarInscripcionesTaller(this.taller.id);
      },
      error: (err) => alert(err?.error?.message || 'Error al responder.')
    });
  }

  cargarHorariosDisponibles() {
    if (!this.fechaSeleccionada || !this.taller) return;
    
    // Filtrar reservas por fecha y generar horarios disponibles
    const reservasFecha = this.reservas.filter(r => {
      const fechaReserva = new Date(r.fecha).toISOString().split('T')[0];
      return fechaReserva === this.fechaSeleccionada;
    });

    // Generar horarios disponibles (ejemplo: cada hora de 8:00 a 20:00)
    const horarios: Array<{ horaInicio: string; horaFin: string; espacio: string }> = [];
    for (let hora = 8; hora < 20; hora++) {
      const horaInicio = `${hora.toString().padStart(2, '0')}:00`;
      const horaFin = `${(hora + 1).toString().padStart(2, '0')}:00`;
      
      // Verificar si el horario está ocupado
      const ocupado = reservasFecha.some(r => 
        r.horaInicio === horaInicio && r.horaFin === horaFin
      );

      if (!ocupado) {
        horarios.push({
          horaInicio,
          horaFin,
          espacio: 'Cancha Principal'
        });
      }
    }

    this.horariosDisponibles = horarios;
  }

  seleccionarHorario(horario: any) {
    this.horarioSeleccionado = horario;
  }

  crearReserva() {
    if (!this.horarioSeleccionado || !this.taller || !this.fechaSeleccionada) return;

    const reservaData = {
      espacio: this.horarioSeleccionado.espacio,
      fecha: this.fechaSeleccionada,
      horaInicio: this.horarioSeleccionado.horaInicio,
      horaFin: this.horarioSeleccionado.horaFin,
      tallerId: this.taller.id
    };

    this.apiService.createReserva(reservaData).subscribe({
      next: () => {
        alert('Reserva creada exitosamente');
        this.horarioSeleccionado = null;
        this.cargarReservas();
        this.cargarHorariosDisponibles();
      },
      error: (err) => {
        console.error('Error creando reserva:', err);
        alert('Error al crear la reserva');
      }
    });
  }

  volver() {
    this.router.navigate(['/talleres']);
  }

  toggleAlumnos() {
    this.alumnosExpanded = !this.alumnosExpanded;
  }

  toggleGrafico() {
    this.graficoExpanded = !this.graficoExpanded;
  }
}

