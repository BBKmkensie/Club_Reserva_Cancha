import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { enmascararNombreCompleto } from '../../utils/alumno-privacidad.util';

export interface InscripcionConFicha {
  id?: number;
  altura?: number | null;
  peso?: number | null;
  porcentajeGrasa?: number | null;
  sedentario?: boolean | null;
  alumno?: { nombre?: string; rut?: string };
}

interface BarraAlumno {
  etiqueta: string;
  nombreCompleto: string;
  valor: number;
  anchoPct: number;
}

@Component({
  selector: 'app-ficha-grafico-taller',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!inscripciones.length) {
      <p class="text-gray-500 py-4 text-center text-sm">No hay alumnos inscritos para mostrar estadísticas.</p>
    } @else if (!tieneDatos) {
      <p class="text-gray-500 py-4 text-center text-sm">Los alumnos aún no tienen ficha física registrada.</p>
    } @else {
      <div class="space-y-6">
        <!-- Promedios -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
            <p class="text-xs text-gray-600">Altura prom.</p>
            <p class="text-lg font-bold text-blue-800">{{ fmt(promedios.altura) }}<span class="text-sm font-normal"> cm</span></p>
          </div>
          <div class="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-center">
            <p class="text-xs text-gray-600">Peso prom.</p>
            <p class="text-lg font-bold text-emerald-800">{{ fmt(promedios.peso) }}<span class="text-sm font-normal"> kg</span></p>
          </div>
          <div class="rounded-lg bg-amber-50 border border-amber-100 p-3 text-center">
            <p class="text-xs text-gray-600">% grasa prom.</p>
            <p class="text-lg font-bold text-amber-800">{{ fmt(promedios.grasa) }}%</p>
          </div>
          <div class="rounded-lg bg-purple-50 border border-purple-100 p-3 text-center col-span-2 sm:col-span-1">
            <p class="text-xs text-gray-600">Estilo de vida</p>
            <p class="text-sm font-semibold text-purple-800 mt-1">
              {{ sedentarioStats.activos }} activos · {{ sedentarioStats.sedentarios }} sedentarios
            </p>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- % grasa -->
          @if (barrasGrasa.length) {
            <div>
              <h3 class="text-sm font-semibold text-gray-800 mb-3">% grasa corporal por alumno</h3>
              <ul class="space-y-2.5">
                @for (b of barrasGrasa; track b.nombreCompleto) {
                  <li>
                    <div class="flex items-center justify-between gap-2 text-xs text-gray-600 mb-0.5">
                      <span class="truncate font-medium text-gray-800" [title]="b.nombreCompleto">{{ b.etiqueta }}</span>
                      <span class="shrink-0 font-semibold">{{ fmt(b.valor) }}%</span>
                    </div>
                    <div class="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500"
                           [style.width.%]="b.anchoPct"
                           [class]="colorGrasa(b.valor)"></div>
                    </div>
                  </li>
                }
              </ul>
              <p class="text-[11px] text-gray-400 mt-2">Escala 0–60%</p>
            </div>
          }

          <!-- Peso -->
          @if (barrasPeso.length) {
            <div>
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Peso por alumno (kg)</h3>
              <ul class="space-y-2.5">
                @for (b of barrasPeso; track b.nombreCompleto) {
                  <li>
                    <div class="flex items-center justify-between gap-2 text-xs text-gray-600 mb-0.5">
                      <span class="truncate font-medium text-gray-800" [title]="b.nombreCompleto">{{ b.etiqueta }}</span>
                      <span class="shrink-0 font-semibold">{{ fmt(b.valor) }} kg</span>
                    </div>
                    <div class="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div class="h-full rounded-full bg-primary-500 transition-all duration-500"
                           [style.width.%]="b.anchoPct"></div>
                    </div>
                  </li>
                }
              </ul>
              <p class="text-[11px] text-gray-400 mt-2">Escala 0–{{ maxPesoEscala }} kg</p>
            </div>
          }
        </div>

        <!-- Distribución sedentario / activo -->
        @if (sedentarioStats.total > 0) {
          <div class="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-gray-100">
            <div class="relative w-28 h-28 mx-auto sm:mx-0 shrink-0 rounded-full"
                 [style.background]="conicSedentario()"
                 aria-hidden="true">
              <div class="absolute inset-3 rounded-full bg-white flex items-center justify-center">
                <span class="text-xs font-bold text-gray-700 text-center leading-tight">
                  {{ sedentarioStats.total }}<br>alumnos
                </span>
              </div>
            </div>
            <div class="text-sm space-y-1.5 flex-1">
              <p class="font-semibold text-gray-800">Distribución sedentarismo</p>
              <p class="flex items-center gap-2 text-gray-600">
                <span class="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
                Activos: {{ sedentarioStats.activos }} ({{ pct(sedentarioStats.activos, sedentarioStats.total) }}%)
              </p>
              <p class="flex items-center gap-2 text-gray-600">
                <span class="inline-block w-3 h-3 rounded-full bg-rose-400"></span>
                Sedentarios: {{ sedentarioStats.sedentarios }} ({{ pct(sedentarioStats.sedentarios, sedentarioStats.total) }}%)
              </p>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class FichaGraficoTallerComponent {
  @Input() inscripciones: InscripcionConFicha[] = [];
  @Input() enmascararNombres = false;

  private readonly escalaGrasaMax = 60;

  get tieneDatos(): boolean {
    return this.inscripciones.some(
      (i) => i.altura != null || i.peso != null || i.porcentajeGrasa != null || i.sedentario != null,
    );
  }

  get promedios(): { altura: number | null; peso: number | null; grasa: number | null } {
    const alturas = this.numeros('altura');
    const pesos = this.numeros('peso');
    const grasas = this.numeros('porcentajeGrasa');
    return {
      altura: alturas.length ? this.prom(alturas) : null,
      peso: pesos.length ? this.prom(pesos) : null,
      grasa: grasas.length ? this.prom(grasas) : null,
    };
  }

  get maxPesoEscala(): number {
    const pesos = this.numeros('peso');
    if (!pesos.length) return 100;
    const max = Math.max(...pesos);
    return Math.ceil(max / 10) * 10 || 100;
  }

  get barrasGrasa(): BarraAlumno[] {
    return this.inscripciones
      .filter((i) => i.porcentajeGrasa != null)
      .map((i) => this.toBarra(i, 'porcentajeGrasa', this.escalaGrasaMax))
      .sort((a, b) => b.valor - a.valor);
  }

  get barrasPeso(): BarraAlumno[] {
    const max = this.maxPesoEscala;
    return this.inscripciones
      .filter((i) => i.peso != null)
      .map((i) => this.toBarra(i, 'peso', max))
      .sort((a, b) => b.valor - a.valor);
  }

  get sedentarioStats(): { activos: number; sedentarios: number; total: number } {
    const conDato = this.inscripciones.filter((i) => i.sedentario != null);
    const sedentarios = conDato.filter((i) => i.sedentario === true).length;
    return {
      sedentarios,
      activos: conDato.length - sedentarios,
      total: conDato.length,
    };
  }

  fmt(n: number | null): string {
    if (n == null) return '—';
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }

  pct(parte: number, total: number): string {
    if (!total) return '0';
    return Math.round((parte / total) * 100).toString();
  }

  colorGrasa(valor: number): string {
    if (valor < 15) return 'bg-emerald-500';
    if (valor <= 25) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  conicSedentario(): string {
    const { activos, sedentarios, total } = this.sedentarioStats;
    if (!total) return '#e5e7eb';
    const pctActivos = (activos / total) * 100;
    return `conic-gradient(#10b981 0% ${pctActivos}%, #fb7185 ${pctActivos}% 100%)`;
  }

  private numeros(campo: 'altura' | 'peso' | 'porcentajeGrasa'): number[] {
    return this.inscripciones
      .map((i) => i[campo])
      .filter((v): v is number => v != null && !Number.isNaN(Number(v)))
      .map(Number);
  }

  private prom(vals: number[]): number {
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  private toBarra(
    insc: InscripcionConFicha,
    campo: 'porcentajeGrasa' | 'peso',
    max: number,
  ): BarraAlumno {
    const valor = Number(insc[campo]);
    const nombreCompleto = insc.alumno?.nombre?.trim() || 'Alumno';
    const visible = this.enmascararNombres ? enmascararNombreCompleto(nombreCompleto) : nombreCompleto;
    const partes = visible.split(/\s+/);
    const etiqueta = partes.length > 1 ? visible : partes[0];
    return {
      etiqueta,
      nombreCompleto: visible,
      valor,
      anchoPct: Math.min(100, Math.max(4, (valor / max) * 100)),
    };
  }
}
