/**
 * Panel reutilizable: pasar lista en una salida + subir imagen de evidencia.
 * Modo edición (profesor) o solo lectura (directiva).
 */
import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AlumnoPrivacidadService } from '../../services/alumno-privacidad.service';
import { environment } from '../../../../environments/environment';
import { prepararImagenEvidencia } from '../../utils/imagen-evidencia.util';

interface RegistroUI {
  alumnoId: number;
  nombre: string;
  rut: string;
  estado: 'PRESENTE' | 'AUSENTE';
  observacion: string;
}

@Component({
  selector: 'app-asistencia-salida-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mt-4 border-t border-line pt-4 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="font-semibold text-ink">Asistencia de la salida</h3>
        @if (datos?.resumen) {
          <p class="text-sm text-ink-muted">
            <span class="text-green-700 font-semibold">{{ datos.resumen.presentes }} presentes</span>
            ·
            <span class="text-red-700 font-semibold">{{ datos.resumen.ausentes }} ausentes</span>
          </p>
        }
      </div>

      @if (error) {
        <p class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2">{{ error }}</p>
      }

      @if (cargando) {
        <p class="text-sm text-ink-muted">Cargando asistencia…</p>
      }

      @if (!cargando && registros.length === 0 && modoEdicion && !cerrada) {
        @if (!profesorId) {
          <p class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
            Esta salida no tiene profesor responsable. Solo el profesor asignado puede pasar lista.
          </p>
        } @else {
          @if (datos?.resumen?.inscritos > 0) {
            <p class="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
              Hay {{ datos.resumen.inscritos }} alumno(s) inscrito(s) en esta salida.
            </p>
          } @else if (datos) {
            <p class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
              Aún no hay alumnos inscritos en esta salida. Los estudiantes deben inscribirse desde «Mis salidas».
            </p>
          } @else {
            <p class="text-sm text-ink-muted bg-page border border-line rounded-lg p-2 mb-2">
              Pulsa «Iniciar lista» para cargar a los alumnos inscritos en esta salida.
            </p>
          }
          <button type="button" (click)="iniciar()" [disabled]="cargando"
                  class="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
            Iniciar lista de asistencia
          </button>
          <p class="text-xs text-ink-muted mt-2">Carga a los alumnos inscritos para marcar presentes o ausentes.</p>
        }
      }

      @if (!cargando && registros.length === 0 && !modoEdicion) {
        <p class="text-sm text-ink-muted">Aún no hay lista de asistencia registrada.</p>
        @if (datos?.salida?.profesor?.nombre) {
          <p class="text-xs text-ink-muted mt-1">Profesor responsable: {{ datos.salida.profesor.nombre }}</p>
        }
      }

      @if (registros.length) {
        @if (modoEdicion && !cerrada) {
          <ul class="space-y-2 max-h-80 overflow-y-auto border border-line rounded-lg divide-y">
            @for (r of registros; track r.alumnoId) {
              <li class="flex items-center gap-3 px-3 py-2"
                  [class.bg-emerald-50]="r.estado === 'PRESENTE'"
                  [class.bg-red-50]="r.estado === 'AUSENTE'">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate">{{ priv.nombre(r.nombre) }}</p>
                  <p class="text-xs text-ink-muted">{{ priv.rut(r.rut) }}</p>
                </div>
                <button type="button" (click)="toggleEstado(r)"
                        class="w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0"
                        [class.bg-emerald-500]="r.estado === 'PRESENTE'"
                        [class.border-emerald-600]="r.estado === 'PRESENTE'"
                        [class.text-white]="r.estado === 'PRESENTE'"
                        [class.border-red-400]="r.estado === 'AUSENTE'">
                  @if (r.estado === 'PRESENTE') { ✓ }
                </button>
              </li>
            }
          </ul>

          <div>
            <label class="block text-sm font-medium text-ink-secondary mb-1">Imagen de evidencia (lista con nombres)</label>
            <input type="file" accept="image/*" (change)="onArchivoImagen($event)"
                   class="text-sm text-ink-muted" />
            <p class="text-xs text-ink-muted mt-1">JPG, PNG, WebP o AVIF. Se comprime automáticamente al guardar.</p>
            @if (previewImagen) {
              <img [src]="previewImagen" alt="Vista previa" class="mt-2 max-h-48 rounded-lg border border-line" />
            }
          </div>

          <textarea [(ngModel)]="observaciones" rows="2" placeholder="Observaciones (opcional)"
                    class="w-full border border-line rounded-lg px-3 py-2 text-sm"></textarea>

          <div class="flex flex-wrap gap-2">
            <button type="button" (click)="guardar()" [disabled]="cargando"
                    class="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              Guardar lista
            </button>
            <button type="button" (click)="cerrar()" [disabled]="cargando || !datos?.salida?.asistenciaListaGuardada"
                    class="text-sm bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50">
              Cerrar asistencia
            </button>
          </div>
        } @else {
          <ul class="space-y-1 text-sm">
            @for (r of registros; track r.alumnoId) {
              <li class="flex justify-between py-1.5 px-2 rounded"
                  [class.bg-emerald-50]="r.estado === 'PRESENTE'"
                  [class.bg-red-50]="r.estado === 'AUSENTE'">
                <span>{{ priv.nombre(r.nombre) }}</span>
                <span [class.text-green-700]="r.estado === 'PRESENTE'" [class.text-red-700]="r.estado === 'AUSENTE'">
                  {{ r.estado === 'PRESENTE' ? 'Presente' : 'Ausente' }}
                </span>
              </li>
            }
          </ul>
          @if (datos.salida?.asistenciaObservaciones) {
            <p class="text-sm text-ink-muted bg-page p-2 rounded">{{ datos.salida.asistenciaObservaciones }}</p>
          }
        }

        @if (urlImagenServidor) {
          <div>
            <p class="text-sm font-medium text-ink mb-2">Imagen de evidencia</p>
            <a [href]="urlImagenServidor" target="_blank" rel="noopener">
              <img [src]="urlImagenServidor" alt="Evidencia asistencia salida"
                   class="max-w-full max-h-96 rounded-lg border border-line shadow-sm" />
            </a>
          </div>
        }
      }
    </div>
  `,
})
export class AsistenciaSalidaPanelComponent implements OnInit, OnChanges {
  @Input({ required: true }) salidaId!: number;
  @Input() profesorId: number | null = null;
  @Input() modoEdicion = false;

  private api = inject(ApiService);
  priv = inject(AlumnoPrivacidadService);

  datos: any = null;
  registros: RegistroUI[] = [];
  observaciones = '';
  error = '';
  cargando = false;
  previewImagen: string | null = null;
  archivoImagen: { base64: string; mimeType: string } | null = null;

  get cerrada(): boolean {
    return !!this.datos?.salida?.asistenciaCerradaAt;
  }

  get urlImagenServidor(): string | null {
    const path = this.datos?.salida?.imagenEvidenciaUrl;
    if (!path) return null;
    const base = environment.apiUrl.replace(/\/$/, '');
    return `${base}${path}`;
  }

  ngOnInit(): void {
    if (this.salidaId) this.cargar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salidaId'] && this.salidaId) {
      this.cargar();
    }
  }

  cargar(): void {
    if (!this.salidaId) return;
    this.cargando = true;
    this.error = '';
    this.api.getAsistenciaSalida(this.salidaId).subscribe({
      next: (d) => {
        this.datos = d;
        this.registros = (d?.registros ?? []).map((r: any) => ({
          alumnoId: r.alumnoId,
          nombre: r.nombre,
          rut: r.rut,
          estado: r.estado === 'AUSENTE' ? 'AUSENTE' : 'PRESENTE',
          observacion: r.observacion ?? '',
        }));
        this.observaciones = d?.salida?.asistenciaObservaciones ?? '';
        this.cargando = false;
      },
      error: (err) => {
        this.datos = null;
        this.registros = [];
        this.cargando = false;
        if (err?.status !== 404) {
          this.error = err?.error?.message || 'No se pudo cargar la asistencia';
        }
      },
    });
  }

  iniciar(): void {
    if (!this.profesorId) return;
    this.cargando = true;
    this.api.iniciarAsistenciaSalida(this.salidaId, this.profesorId).subscribe({
      next: (d) => {
        this.datos = d;
        this.registros = (d?.registros ?? []).map((r: any) => ({
          alumnoId: r.alumnoId,
          nombre: r.nombre,
          rut: r.rut,
          estado: r.estado === 'AUSENTE' ? 'AUSENTE' : 'PRESENTE',
          observacion: r.observacion ?? '',
        }));
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'No se pudo iniciar la lista';
      },
    });
  }

  toggleEstado(r: RegistroUI): void {
    r.estado = r.estado === 'PRESENTE' ? 'AUSENTE' : 'PRESENTE';
  }

  onArchivoImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error = '';
    this.cargando = true;
    prepararImagenEvidencia(file)
      .then((payload) => {
        this.previewImagen = `data:${payload.mimeType};base64,${payload.base64}`;
        this.archivoImagen = payload;
        this.cargando = false;
      })
      .catch((err: Error) => {
        this.archivoImagen = null;
        this.previewImagen = null;
        this.cargando = false;
        this.error = err.message || 'No se pudo procesar la imagen';
        input.value = '';
      });
  }

  guardar(): void {
    if (!this.profesorId) return;
    this.cargando = true;
    this.error = '';

    const subirImagen = this.archivoImagen
      ? this.api.subirImagenAsistenciaSalida(this.salidaId, this.profesorId, this.archivoImagen)
      : null;

    const guardarRegistros = () =>
      this.api.actualizarAsistenciaSalida(
        this.salidaId,
        this.profesorId!,
        this.registros.map((r) => ({
          alumnoId: r.alumnoId,
          estado: r.estado,
          observacion: r.observacion || undefined,
        })),
      );

    const finalizar = () => {
      guardarRegistros().subscribe({
        next: (d) => {
          this.datos = d;
          this.cargando = false;
          this.archivoImagen = null;
        },
        error: (err) => {
          this.cargando = false;
          this.error = err?.error?.message || 'No se pudo guardar';
        },
      });
    };

    if (subirImagen) {
      subirImagen.subscribe({
        next: () => finalizar(),
        error: (err) => {
          this.cargando = false;
          this.error = this.mensajeErrorImagen(err) || 'No se pudo subir la imagen';
        },
      });
    } else {
      finalizar();
    }
  }

  cerrar(): void {
    if (!this.profesorId) return;
    this.cargando = true;
    this.api.cerrarAsistenciaSalida(this.salidaId, this.profesorId, this.observaciones).subscribe({
      next: (d) => {
        this.datos = d;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'No se pudo cerrar la asistencia';
      },
    });
  }

  private mensajeErrorImagen(err: any): string {
    if (err?.status === 413) {
      return 'La imagen es demasiado pesada. Selecciónala de nuevo; se comprimirá automáticamente.';
    }
    const msg = err?.error?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    return typeof msg === 'string' ? msg : '';
  }
}
