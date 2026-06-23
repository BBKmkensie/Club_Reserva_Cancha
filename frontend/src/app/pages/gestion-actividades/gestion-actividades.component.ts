import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { Taller, EstadoActividad } from '../../models/taller.model';

const DIAS = [
  { v: 1, l: 'Lunes' },
  { v: 2, l: 'Martes' },
  { v: 3, l: 'Miércoles' },
  { v: 4, l: 'Jueves' },
  { v: 5, l: 'Viernes' },
  { v: 6, l: 'Sábado' },
  { v: 7, l: 'Domingo' },
];

const ESTADO_LABEL: Record<EstadoActividad, string> = {
  BORRADOR: 'Borrador',
  ESPERA_DOCENTE: 'Esperando docente',
  ESPERA_HORARIO: 'Definir horario',
  PUBLICADO: 'Publicado',
  CERRADO: 'Cerrado',
};

@Component({
  selector: 'app-gestion-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Gestión de Actividades</h1>
          <p class="text-gray-600 text-sm mt-1">Cocina, Zumba, deportes y más — flujo del coordinador (BPMN 3)</p>
        </div>
        <button (click)="abrirCrear()"
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          + Nueva actividad
        </button>
      </div>

      <div class="bg-white rounded-xl shadow p-5 border-2 border-violet-200">
        <h2 class="text-lg font-bold text-gray-800 mb-1">Configuración de período académico</h2>
        <p class="text-sm text-gray-600 mb-3">Define las fechas globales de apertura y cierre de inscripciones (subproceso BPMN).</p>
        @if (periodoActivo) {
          <p class="text-sm text-violet-800 mb-3">
            Período activo: <strong>{{ periodoActivo.nombre }}</strong>
            ({{ periodoActivo.fechaApertura | date:'dd/MM/yyyy' }} — {{ periodoActivo.fechaCierre | date:'dd/MM/yyyy' }})
          </p>
        }
        <div class="flex flex-wrap gap-2 items-end">
          <div>
            <label class="text-xs text-gray-600">Nombre</label>
            <input [(ngModel)]="periodoForm.nombre" class="border rounded px-2 py-1.5 text-sm block mt-1" placeholder="Período 2026">
          </div>
          <div>
            <label class="text-xs text-gray-600">Apertura inscripciones</label>
            <input type="date" [(ngModel)]="periodoForm.apertura" class="border rounded px-2 py-1.5 text-sm block mt-1">
          </div>
          <div>
            <label class="text-xs text-gray-600">Cierre inscripciones</label>
            <input type="date" [(ngModel)]="periodoForm.cierre" class="border rounded px-2 py-1.5 text-sm block mt-1">
          </div>
          <button (click)="guardarPeriodo()" class="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700">
            Guardar período
          </button>
        </div>
      </div>

      @if (showModal) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Nueva actividad extracurricular</h2>
            <form [formGroup]="form" (ngSubmit)="guardar()">
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-gray-700">Nombre (tipo)</label>
                  <input formControlName="tipo" class="w-full border rounded-lg px-3 py-2"
                         placeholder="Ej: Cocina, Zumba, Fútbol">
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">Descripción</label>
                  <textarea formControlName="descripcion" rows="3" class="w-full border rounded-lg px-3 py-2"></textarea>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">Capacidad</label>
                  <input formControlName="capacidad" type="number" class="w-full border rounded-lg px-3 py-2">
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">URL imagen (opcional)</label>
                  <input formControlName="imagenUrl" type="url" class="w-full border rounded-lg px-3 py-2">
                </div>
              </div>
              <div class="flex justify-end gap-2 mt-5">
                <button type="button" (click)="cerrarModal()" class="px-4 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg">Crear</button>
              </div>
            </form>
          </div>
        </div>
      }

      <div class="grid gap-4">
        @for (t of actividades; track t.id) {
          <div class="bg-white rounded-xl shadow p-5 border-l-4"
               [class.border-gray-300]="t.estado === 'BORRADOR'"
               [class.border-amber-400]="t.estado === 'ESPERA_DOCENTE'"
               [class.border-blue-400]="t.estado === 'ESPERA_HORARIO'"
               [class.border-green-500]="t.estado === 'PUBLICADO'"
               [class.border-red-400]="t.estado === 'CERRADO'">
            <div class="flex flex-wrap justify-between gap-2 mb-2">
              <div>
                <h3 class="text-xl font-semibold text-gray-800">{{ t.tipo }}</h3>
                <p class="text-sm text-gray-600">{{ t.descripcion }}</p>
              </div>
              <span class="text-xs font-bold px-3 py-1 rounded-full h-fit"
                    [class.bg-gray-100]="t.estado === 'BORRADOR'"
                    [class.bg-amber-100]="t.estado === 'ESPERA_DOCENTE'"
                    [class.bg-blue-100]="t.estado === 'ESPERA_HORARIO'"
                    [class.bg-green-100]="t.estado === 'PUBLICADO'"
                    [class.bg-red-100]="t.estado === 'CERRADO'">
                {{ etiquetaEstado(t.estado) }}
              </span>
            </div>

            <p class="text-sm text-gray-500 mb-3">
              Capacidad: {{ t.capacidad }}
              @if (t.diaSemana && t.horaInicio) {
                · {{ textoHorario(t) }}
              }
            </p>

            @if (t.estado === 'BORRADOR') {
              <div class="flex flex-wrap items-end gap-2 bg-gray-50 p-3 rounded-lg">
                <div>
                  <label class="text-xs text-gray-600">Asignar docente</label>
                  <select [(ngModel)]="profesorPorActividad[t.id]" class="border rounded px-2 py-1.5 text-sm block mt-1">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (p of profesores; track p.id) {
                      <option [ngValue]="p.id">{{ p.nombre }}</option>
                    }
                  </select>
                </div>
                <button (click)="asignar(t.id)"
                        [disabled]="!profesorPorActividad[t.id]"
                        class="text-sm bg-amber-600 text-white px-3 py-2 rounded-lg disabled:opacity-50">
                  Enviar asignación
                </button>
              </div>
            }

            @if (t.estado === 'ESPERA_DOCENTE') {
              <p class="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                Esperando que el docente confirme disponibilidad.
              </p>
            }

            @if (t.estado === 'ESPERA_HORARIO') {
              <div class="bg-blue-50 p-3 rounded-lg space-y-2">
                <p class="text-sm text-blue-800 font-medium">Docente confirmó. Define horario y publica el catálogo.</p>
                <div class="flex flex-wrap gap-2 items-end">
                  <select [(ngModel)]="horarioDraft[t.id].diaSemana" class="border rounded px-2 py-1.5 text-sm">
                    @for (d of dias; track d.v) {
                      <option [ngValue]="d.v">{{ d.l }}</option>
                    }
                  </select>
                  <input type="time" [(ngModel)]="horarioDraft[t.id].horaInicio" class="border rounded px-2 py-1.5 text-sm">
                  <input type="time" [(ngModel)]="horarioDraft[t.id].horaFin" class="border rounded px-2 py-1.5 text-sm">
                  <button (click)="guardarHorario(t.id)" class="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg">
                    Guardar horario
                  </button>
                </div>
                @if (t.diaSemana) {
                  <div class="flex flex-wrap gap-2 items-end pt-2 border-t border-blue-200">
                    <input type="date" [(ngModel)]="publicarDraft[t.id].apertura" placeholder="Apertura"
                           class="border rounded px-2 py-1.5 text-sm" title="Apertura inscripciones">
                    <input type="date" [(ngModel)]="publicarDraft[t.id].cierre" placeholder="Cierre"
                           class="border rounded px-2 py-1.5 text-sm" title="Cierre inscripciones">
                    <button (click)="publicar(t.id)" class="text-sm bg-green-600 text-white px-3 py-2 rounded-lg">
                      Publicar catálogo
                    </button>
                  </div>
                }
              </div>
            }

            @if (t.estado === 'PUBLICADO') {
              <div class="flex flex-wrap gap-2">
                <a routerLink="/gestion-inscripciones" class="text-sm text-amber-700 underline">Monitorear inscripciones →</a>
                <button (click)="cerrar(t.id)" class="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg">
                  Cerrar período
                </button>
                <button (click)="descargarReporte(t.id)" class="text-sm border px-3 py-1.5 rounded-lg">
                  Reporte final
                </button>
              </div>
            }

            @if (t.estado === 'CERRADO') {
              <button (click)="descargarReporte(t.id)" class="text-sm border px-3 py-1.5 rounded-lg">
                Ver reporte final
              </button>
            }
          </div>
        }
        @if (actividades.length === 0) {
          <p class="text-center text-gray-500 py-12">No hay actividades. Crea la primera (Cocina, Zumba, etc.)</p>
        }
      </div>
    </div>
  `,
})
export class GestionActividadesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthRoleService);
  private fb = inject(FormBuilder);

  actividades: Taller[] = [];
  profesores: any[] = [];
  profesorPorActividad: Record<number, number | null> = {};
  horarioDraft: Record<number, { diaSemana: number; horaInicio: string; horaFin: string }> = {};
  publicarDraft: Record<number, { apertura: string; cierre: string }> = {};
  dias = DIAS;
  showModal = false;
  form: FormGroup;
  periodoActivo: any = null;
  periodoForm = { nombre: 'Período actual', apertura: '', cierre: '' };

  constructor() {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      descripcion: ['', Validators.required],
      capacidad: [20, Validators.required],
      imagenUrl: [''],
    });
  }

  ngOnInit() {
    this.cargar();
    this.cargarPeriodo();
    this.api.getProfesores().subscribe({ next: (d) => (this.profesores = d) });
  }

  cargarPeriodo() {
    this.api.getPeriodoActivo().subscribe({
      next: (p) => {
        this.periodoActivo = p;
        if (p) {
          this.periodoForm.nombre = p.nombre ?? 'Período actual';
          this.periodoForm.apertura = p.fechaApertura?.slice?.(0, 10) ?? p.fechaApertura;
          this.periodoForm.cierre = p.fechaCierre?.slice?.(0, 10) ?? p.fechaCierre;
        }
      },
    });
  }

  guardarPeriodo() {
    if (!this.periodoForm.apertura || !this.periodoForm.cierre) {
      alert('Indica fecha de apertura y cierre');
      return;
    }
    this.api.configurarPeriodo({
      nombre: this.periodoForm.nombre,
      fechaApertura: this.periodoForm.apertura,
      fechaCierre: this.periodoForm.cierre,
    }).subscribe({
      next: () => {
        alert('Período académico configurado');
        this.cargarPeriodo();
      },
      error: (e) => alert(e?.error?.message || 'Error al guardar período'),
    });
  }

  cargar() {
    this.api.getTalleres().subscribe({
      next: (data) => {
        this.actividades = data;
        for (const t of data) {
          this.horarioDraft[t.id] = {
            diaSemana: t.diaSemana ?? 1,
            horaInicio: t.horaInicio?.slice(0, 5) ?? '16:00',
            horaFin: t.horaFin?.slice(0, 5) ?? '18:00',
          };
          this.publicarDraft[t.id] = { apertura: '', cierre: '' };
        }
      },
    });
  }

  etiquetaEstado(e?: string) {
    return ESTADO_LABEL[(e as EstadoActividad) ?? 'BORRADOR'] ?? e;
  }

  textoHorario(t: Taller) {
    const d = DIAS.find((x) => x.v === t.diaSemana)?.l ?? '';
    return `${d} ${t.horaInicio?.slice(0, 5)} - ${t.horaFin?.slice(0, 5)}`;
  }

  abrirCrear() {
    this.form.reset({ capacidad: 20 });
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardar() {
    if (!this.form.valid) return;
    this.api.createTaller(this.form.value).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargar();
      },
      error: (e) => alert(e?.error?.message || 'Error al crear'),
    });
  }

  asignar(tallerId: number) {
    const pid = this.profesorPorActividad[tallerId];
    if (!pid) return;
    this.api.asignarDocenteActividad(tallerId, pid).subscribe({
      next: () => {
        alert('Asignación enviada. El docente recibirá una notificación.');
        this.cargar();
      },
      error: (e) => alert(e?.error?.message || 'No se pudo asignar'),
    });
  }

  guardarHorario(tallerId: number) {
    const h = this.horarioDraft[tallerId];
    this.api.definirHorarioActividad(tallerId, h).subscribe({
      next: () => {
        alert('Horario guardado. Ya puedes publicar el catálogo.');
        this.cargar();
      },
      error: (e) => alert(e?.error?.message || 'Error de horario'),
    });
  }

  publicar(tallerId: number) {
    const p = this.publicarDraft[tallerId];
    const body: { fechaAperturaInscripcion?: string; fechaCierreInscripcion?: string } = {};
    if (p.apertura) body.fechaAperturaInscripcion = p.apertura;
    if (p.cierre) body.fechaCierreInscripcion = p.cierre;
    this.api.publicarActividad(tallerId, body).subscribe({
      next: () => {
        alert('Actividad publicada en el catálogo. Los estudiantes ya pueden inscribirse.');
        this.cargar();
      },
      error: (e) => alert(e?.error?.message || 'No se pudo publicar'),
    });
  }

  cerrar(tallerId: number) {
    if (!confirm('¿Cerrar el período de esta actividad?')) return;
    this.api.cerrarActividad(tallerId).subscribe({
      next: () => this.cargar(),
      error: (e) => alert(e?.error?.message || 'Error'),
    });
  }

  descargarReporte(tallerId: number) {
    this.api.getReporteActividad(tallerId).subscribe({
      next: (r) => {
        const txt =
          `REPORTE FINAL — ACTIVIDAD: ${r.actividad.tipo}\n` +
          `Estado: ${r.actividad.estado}\n` +
          (r.periodoAcademico
            ? `Período: ${r.periodoAcademico.nombre} (${r.periodoAcademico.fechaApertura} a ${r.periodoAcademico.fechaCierre})\n`
            : '') +
          `Docente: ${r.docente?.nombre ?? '—'}\n` +
          `Inscripciones: ${r.inscripciones.total} (aceptados: ${r.inscripciones.aceptados}, pendientes: ${r.inscripciones.pendientes})\n` +
          (r.asistencia
            ? `Asistencia: ${r.asistencia.sesionesRealizadas} sesiones, ${r.asistencia.registrosPresentes} presentes, ${r.asistencia.registrosAusentes} ausentes\n`
            : '') +
          `\nALUMNOS:\n` +
          r.alumnos.map((a: any) => `- ${a.nombre} (${a.rut}): ${a.estado}`).join('\n');
        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `reporte-${r.actividad.tipo}.txt`;
        a.click();
      },
    });
  }
}
