import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { AlumnoPrivacidadService } from '../../shared/services/alumno-privacidad.service';
import { Taller, EstadoActividad } from '../../models/taller.model';
import {
  CURSOS_TALLER,
  SECCIONES_TALLER_DEFAULT,
  textoHorarioTaller,
  horariosOrdenados,
  crearBorradorHorariosPorCurso,
  crearBorradorHorariosPorSeccion,
  ModoHorarioTaller,
} from '../../shared/utils/horario-taller.util';

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
              @if (horariosGuardados(t).length) {
                · {{ tituloHorariosResumen(t) }} ({{ horariosGuardados(t).length }})
              } @else if (t.diaSemana && t.horaInicio) {
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
              <div class="bg-blue-50 p-3 rounded-lg space-y-3">
                <p class="text-sm text-blue-800 font-medium">Docente confirmó. Define horarios por curso o por sección y publica el catálogo.</p>
                <div class="flex flex-col sm:flex-row gap-3 text-sm">
                  <label class="inline-flex items-center gap-2">
                    <input type="radio" name="modo-{{ t.id }}" [ngModel]="modoHorarioDraft[t.id]" (ngModelChange)="cambiarModoHorario(t.id, 'POR_CURSO')" value="POR_CURSO">
                    Por curso
                  </label>
                  <label class="inline-flex items-center gap-2">
                    <input type="radio" name="modo-{{ t.id }}" [ngModel]="modoHorarioDraft[t.id]" (ngModelChange)="cambiarModoHorario(t.id, 'POR_SECCION')" value="POR_SECCION">
                    Por sección
                  </label>
                </div>

                <!-- Móvil: tarjetas editables -->
                <div class="md:hidden space-y-2 max-h-80 overflow-y-auto pr-1">
                  @if (modoHorarioDraft[t.id] === 'POR_SECCION') {
                    @for (s of secciones; track s) {
                      <div class="bg-white border border-blue-200 rounded-lg p-3 space-y-2">
                        <p class="font-semibold text-gray-800">Sección {{ s }}</p>
                        <select [(ngModel)]="horariosSeccionDraft[t.id][s].diaSemana" class="w-full border rounded px-2 py-2 text-sm">
                          @for (d of dias; track d.v) { <option [ngValue]="d.v">{{ d.l }}</option> }
                        </select>
                        <div class="grid grid-cols-2 gap-2">
                          <input type="time" [(ngModel)]="horariosSeccionDraft[t.id][s].horaInicio" class="w-full border rounded px-2 py-2 text-sm">
                          <input type="time" [(ngModel)]="horariosSeccionDraft[t.id][s].horaFin" class="w-full border rounded px-2 py-2 text-sm">
                        </div>
                      </div>
                    }
                  } @else {
                    @for (c of cursos; track c.code) {
                      <div class="bg-white border border-blue-200 rounded-lg p-3 space-y-2">
                        <p class="font-semibold text-gray-800 text-sm">{{ c.label }}</p>
                        <select [(ngModel)]="horariosCursoDraft[t.id][c.code].diaSemana" class="w-full border rounded px-2 py-2 text-sm">
                          @for (d of dias; track d.v) { <option [ngValue]="d.v">{{ d.l }}</option> }
                        </select>
                        <div class="grid grid-cols-2 gap-2">
                          <input type="time" [(ngModel)]="horariosCursoDraft[t.id][c.code].horaInicio" class="w-full border rounded px-2 py-2 text-sm">
                          <input type="time" [(ngModel)]="horariosCursoDraft[t.id][c.code].horaFin" class="w-full border rounded px-2 py-2 text-sm">
                        </div>
                      </div>
                    }
                  }
                </div>

                <!-- Escritorio: tabla -->
                <div class="hidden md:block overflow-x-auto border border-blue-200 rounded-lg bg-white">
                  <table class="min-w-full text-sm">
                    <thead class="bg-gray-50 text-gray-600">
                      <tr>
                        <th class="text-left px-2 py-2">{{ modoHorarioDraft[t.id] === 'POR_SECCION' ? 'Sección' : 'Curso' }}</th>
                        <th class="text-left px-2 py-2">Día</th>
                        <th class="text-left px-2 py-2">Inicio</th>
                        <th class="text-left px-2 py-2">Fin</th>
                      </tr>
                    </thead>
                    <tbody>
                      @if (modoHorarioDraft[t.id] === 'POR_SECCION') {
                        @for (s of secciones; track s) {
                          <tr class="border-t">
                            <td class="px-2 py-1 font-medium">{{ s }}</td>
                            <td class="px-2 py-1">
                              <select [(ngModel)]="horariosSeccionDraft[t.id][s].diaSemana" class="border rounded px-1 py-1">
                                @for (d of dias; track d.v) { <option [ngValue]="d.v">{{ d.l }}</option> }
                              </select>
                            </td>
                            <td class="px-2 py-1"><input type="time" [(ngModel)]="horariosSeccionDraft[t.id][s].horaInicio" class="border rounded px-1 py-1"></td>
                            <td class="px-2 py-1"><input type="time" [(ngModel)]="horariosSeccionDraft[t.id][s].horaFin" class="border rounded px-1 py-1"></td>
                          </tr>
                        }
                      } @else {
                        @for (c of cursos; track c.code) {
                          <tr class="border-t">
                            <td class="px-2 py-1 font-medium whitespace-nowrap">{{ c.label }}</td>
                            <td class="px-2 py-1">
                              <select [(ngModel)]="horariosCursoDraft[t.id][c.code].diaSemana" class="border rounded px-1 py-1">
                                @for (d of dias; track d.v) { <option [ngValue]="d.v">{{ d.l }}</option> }
                              </select>
                            </td>
                            <td class="px-2 py-1"><input type="time" [(ngModel)]="horariosCursoDraft[t.id][c.code].horaInicio" class="border rounded px-1 py-1"></td>
                            <td class="px-2 py-1"><input type="time" [(ngModel)]="horariosCursoDraft[t.id][c.code].horaFin" class="border rounded px-1 py-1"></td>
                          </tr>
                        }
                      }
                    </tbody>
                  </table>
                </div>
                <button (click)="guardarHorario(t.id)" class="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg">
                  Guardar horarios
                </button>
                @if (tieneHorarioGuardado(t)) {
                  <div class="flex flex-wrap gap-2 items-end pt-2 border-t border-blue-200">
                    <input type="date" [(ngModel)]="publicarDraft[t.id].apertura" class="border rounded px-2 py-1.5 text-sm" title="Apertura inscripciones">
                    <input type="date" [(ngModel)]="publicarDraft[t.id].cierre" class="border rounded px-2 py-1.5 text-sm" title="Cierre inscripciones">
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
  priv = inject(AlumnoPrivacidadService);
  private fb = inject(FormBuilder);

  actividades: Taller[] = [];
  profesores: any[] = [];
  profesorPorActividad: Record<number, number | null> = {};
  modoHorarioDraft: Record<number, ModoHorarioTaller> = {};
  horariosCursoDraft: Record<number, Record<string, { diaSemana: number; horaInicio: string; horaFin: string }>> = {};
  horariosSeccionDraft: Record<number, Record<string, { diaSemana: number; horaInicio: string; horaFin: string }>> = {};
  publicarDraft: Record<number, { apertura: string; cierre: string }> = {};
  dias = DIAS;
  cursos = CURSOS_TALLER;
  secciones = SECCIONES_TALLER_DEFAULT;
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
          this.inicializarBorradoresHorario(t);
          this.publicarDraft[t.id] = { apertura: '', cierre: '' };
        }
      },
    });
  }

  etiquetaEstado(e?: string) {
    return ESTADO_LABEL[(e as EstadoActividad) ?? 'BORRADOR'] ?? e;
  }

  textoHorario(t: Taller) {
    return textoHorarioTaller(t);
  }

  horariosGuardados(t: Taller) {
    return horariosOrdenados(t);
  }

  tituloHorariosResumen(t: Taller) {
    return t.modoHorario === 'POR_SECCION' ? 'Horarios por sección' : 'Horarios por curso';
  }

  tieneHorarioGuardado(t: Taller): boolean {
    return this.horariosGuardados(t).length > 0 || !!(t.diaSemana && t.horaInicio && t.horaFin);
  }

  cambiarModoHorario(tallerId: number, modo: ModoHorarioTaller) {
    this.modoHorarioDraft[tallerId] = modo;
  }

  private inicializarBorradoresHorario(t: Taller) {
    const modo: ModoHorarioTaller = t.modoHorario ?? 'POR_CURSO';
    this.modoHorarioDraft[t.id] = modo;
    this.horariosCursoDraft[t.id] = crearBorradorHorariosPorCurso();
    this.horariosSeccionDraft[t.id] = crearBorradorHorariosPorSeccion();

    const base = {
      diaSemana: t.diaSemana ?? 2,
      horaInicio: t.horaInicio?.slice(0, 5) ?? '16:00',
      horaFin: t.horaFin?.slice(0, 5) ?? '18:00',
    };

    if (t.horarios?.length) {
      for (const h of t.horarios) {
        const fila = {
          diaSemana: h.diaSemana,
          horaInicio: h.horaInicio?.slice(0, 5) ?? base.horaInicio,
          horaFin: h.horaFin?.slice(0, 5) ?? base.horaFin,
        };
        if (h.curso) this.horariosCursoDraft[t.id][h.curso] = fila;
        if (h.seccion) this.horariosSeccionDraft[t.id][h.seccion] = fila;
      }
    } else if (t.diaSemana) {
      for (const c of CURSOS_TALLER) {
        this.horariosCursoDraft[t.id][c.code] = { ...base };
      }
      for (const s of SECCIONES_TALLER_DEFAULT) {
        this.horariosSeccionDraft[t.id][s] = { ...base };
      }
    }
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
    const modo = this.modoHorarioDraft[tallerId] ?? 'POR_CURSO';
    const horarios =
      modo === 'POR_SECCION'
        ? this.secciones.map((s) => ({
            seccion: s,
            ...this.horariosSeccionDraft[tallerId][s],
          }))
        : this.cursos.map((c) => ({
            curso: c.code,
            ...this.horariosCursoDraft[tallerId][c.code],
          }));

    this.api.definirHorarioActividad(tallerId, { modo, horarios }).subscribe({
      next: () => {
        alert('Horarios guardados. Ya puedes publicar el catálogo.');
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
          r.alumnos.map((al: any) => {
            const d = this.priv.alumno(al);
            return `- ${d.nombre} (${d.rut}): ${al.estado}`;
          }).join('\n');
        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `reporte-${r.actividad.tipo}.txt`;
        a.click();
      },
    });
  }
}
