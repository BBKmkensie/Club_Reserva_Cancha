import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from '../../shared/services/auth-role.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="space-y-8">
      <!-- Para estudiante: estado de solicitudes a talleres -->
      @if (auth.canInscribirseTalleres() && alumnoId) {
        <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
          <h2 class="text-xl font-bold text-gray-800 mb-2">Estado de tus solicitudes a talleres</h2>
          <p class="text-gray-600 text-sm mb-3">Revisa si fuiste aceptado o rechazado en cada taller.</p>
          @if (solicitudesTaller.length === 0) {
            <p class="text-gray-500 text-sm">Aún no tienes solicitudes. Ve a <a routerLink="/inscripcion-talleres" class="text-primary-600 font-medium hover:underline">Inscripción de Talleres</a> para inscribirte.</p>
          } @else {
            <ul class="space-y-2 mb-3">
              @for (s of solicitudesTaller; track s.id) {
                <li class="flex justify-between items-center py-1.5 px-2 rounded"
                    [class.bg-green-50]="s.estado === 'ACEPTADO'"
                    [class.bg-red-50]="s.estado === 'RECHAZADO'"
                    [class.bg-amber-50]="s.estado === 'PENDIENTE'">
                  <span class="font-medium">{{ s.taller?.tipo ?? 'Taller' }}</span>
                  <span class="text-sm font-bold"
                        [class.text-green-700]="s.estado === 'ACEPTADO'"
                        [class.text-red-700]="s.estado === 'RECHAZADO'"
                        [class.text-amber-700]="s.estado === 'PENDIENTE'">
                    {{ s.estado === 'ACEPTADO' ? '✓ Aceptado' : s.estado === 'RECHAZADO' ? '✗ Rechazado' : '⏳ Pendiente' }}
                  </span>
                </li>
              }
            </ul>
            <a routerLink="/inscripcion-talleres" class="text-primary-600 font-medium text-sm hover:underline">Ver todas y inscribirme a más talleres →</a>
          }
        </div>
      }

      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">Sistema de Gestión de Talleres</h1>
        <p class="text-gray-600">Selecciona una actividad para gestionar</p>
      </div>

      <!-- Actividades Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Fútbol -->
        <div (click)="navegarATaller('Futbol')" 
           class="group bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <div class="text-center">
            <div class="text-6xl mb-4">⚽</div>
            <h2 class="text-3xl font-bold mb-2">Fútbol</h2>
            <p class="text-green-100 text-sm">Gestiona el taller de fútbol</p>
            <div class="mt-4 text-green-200">
              <div class="text-2xl font-bold">{{ getTallerCount('Futbol') }}</div>
              <div class="text-sm">Alumnos inscritos</div>
            </div>
          </div>
        </div>

        <!-- Atletismo -->
        <div (click)="navegarATaller('Atletismo')" 
           class="group bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <div class="text-center">
            <div class="text-6xl mb-4">🏃</div>
            <h2 class="text-3xl font-bold mb-2">Atletismo</h2>
            <p class="text-orange-100 text-sm">Gestiona el taller de atletismo</p>
            <div class="mt-4 text-orange-200">
              <div class="text-2xl font-bold">{{ getTallerCount('Atletismo') }}</div>
              <div class="text-sm">Alumnos inscritos</div>
            </div>
          </div>
        </div>

        <!-- Voley -->
        <div (click)="navegarATaller('Voley')" 
           class="group bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <div class="text-center">
            <div class="text-6xl mb-4">🏐</div>
            <h2 class="text-3xl font-bold mb-2">Voley</h2>
            <p class="text-blue-100 text-sm">Gestiona el taller de voley</p>
            <div class="mt-4 text-blue-200">
              <div class="text-2xl font-bold">{{ getTallerCount('Voley') }}</div>
              <div class="text-sm">Alumnos inscritos</div>
            </div>
          </div>
        </div>

        <!-- Básquet -->
        <div (click)="navegarATaller('Basquet')" 
           class="group bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <div class="text-center">
            <div class="text-6xl mb-4">🏀</div>
            <h2 class="text-3xl font-bold mb-2">Básquet</h2>
            <p class="text-red-100 text-sm">Gestiona el taller de básquet</p>
            <div class="mt-4 text-red-200">
              <div class="text-2xl font-bold">{{ getTallerCount('Basquet') }}</div>
              <div class="text-sm">Alumnos inscritos</div>
            </div>
          </div>
        </div>

        <!-- Salidas -->
        <a routerLink="/salidas" 
           class="group bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <div class="text-center">
            <div class="text-6xl mb-4">🚌</div>
            <h2 class="text-3xl font-bold mb-2">Salidas</h2>
            <p class="text-purple-100 text-sm">Gestiona las salidas programadas</p>
            <div class="mt-4 text-purple-200">
              <div class="text-2xl font-bold">{{ stats.salidas }}</div>
              <div class="text-sm">Salidas programadas</div>
            </div>
          </div>
        </a>
      </div>

      <!-- Estadísticas Generales -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Estadísticas Generales</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-blue-600">{{ stats.talleres }}</div>
            <div class="text-sm text-gray-600 mt-1">Total Talleres</div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-green-600">{{ stats.alumnos }}</div>
            <div class="text-sm text-gray-600 mt-1">Total Alumnos</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-purple-600">{{ stats.profesores }}</div>
            <div class="text-sm text-gray-600 mt-1">Total Profesores</div>
          </div>
          <div class="bg-orange-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-orange-600">{{ stats.reservas }}</div>
            <div class="text-sm text-gray-600 mt-1">Total Reservas</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  auth = inject(AuthRoleService);

  stats = {
    talleres: 0,
    alumnos: 0,
    profesores: 0,
    reservas: 0,
    salidas: 0
  };
  
  talleres: any[] = [];
  alumnos: any[] = [];
  alumnoId: number | null = null;
  solicitudesTaller: any[] = [];

  ngOnInit() {
    this.loadData();
    this.alumnoId = this.auth.currentUserId();
    if (this.auth.canInscribirseTalleres() && this.alumnoId) {
      this.apiService.getInscripcionesTallerPorAlumno(this.alumnoId).subscribe({
        next: (data) => this.solicitudesTaller = data ?? [],
        error: () => this.solicitudesTaller = []
      });
    }
  }

  loadData() {
    const asList = (data: unknown): any[] => Array.isArray(data) ? data : [];

    this.apiService.getTalleres().subscribe({
      next: (data) => {
        this.talleres = asList(data);
        this.stats.talleres = this.talleres.length;
      },
      error: (err) => {
        console.error('Error cargando talleres:', err);
      }
    });

    this.apiService.getAlumnos().subscribe({
      next: (data) => {
        this.alumnos = asList(data);
        this.stats.alumnos = this.alumnos.length;
      },
      error: (err) => {
        console.error('Error cargando alumnos:', err);
      }
    });

    this.apiService.getProfesores().subscribe({
      next: (data) => {
        this.stats.profesores = asList(data).length;
      },
      error: (err) => {
        console.error('Error cargando profesores:', err);
      }
    });

    this.apiService.getReservas().subscribe({
      next: (data) => {
        this.stats.reservas = asList(data).length;
      },
      error: (err) => {
        console.error('Error cargando reservas:', err);
      }
    });

    this.apiService.getSalidas().subscribe({
      next: (data) => {
        this.stats.salidas = asList(data).length;
      },
      error: (err) => {
        console.error('Error cargando salidas:', err);
      }
    });
  }

  getTallerCount(tipo: string): number {
    const variaciones: Record<string, string[]> = {
      Futbol: ['Futbol', 'Fútbol', 'futbol', 'fútbol'],
      Atletismo: ['Atletismo', 'atletismo'],
      Voley: ['Voley', 'Voleibol', 'voley', 'voleibol'],
      Basquet: ['Basquet', 'Básquet', 'basquet', 'básquet']
    };
    const normalizar = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const opciones = variaciones[tipo] || [tipo];
    const taller = this.talleres.find(t => t?.tipo && opciones.some(v => normalizar(t.tipo) === normalizar(v)));
    if (!taller || taller.id == null) return 0;
    const id = Number(taller.id);
    return this.alumnos.filter(a => Number(a?.tallerId) === id).length;
  }

  navegarATaller(tipo: string) {
    console.log('Navegando a taller:', tipo);
    console.log('Talleres actuales:', this.talleres);
    
    // Buscar el taller por tipo (case insensitive, también buscar variaciones)
    const tiposVariaciones: { [key: string]: string[] } = {
      'Futbol': ['Futbol', 'Fútbol', 'futbol', 'fútbol', 'FUTBOL'],
      'Atletismo': ['Atletismo', 'atletismo', 'ATLETISMO'],
      'Voley': ['Voley', 'Voleibol', 'voley', 'voleibol', 'VOLEY'],
      'Basquet': ['Basquet', 'Básquet', 'Basketball', 'basquet', 'básquet', 'basketball', 'BASQUET']
    };
    
    const variaciones = tiposVariaciones[tipo] || [tipo];
    
    // Función para normalizar el tipo (quitar tildes y convertir a minúsculas)
    const normalizar = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Buscar en la lista local
    let taller = this.talleres.find(t => {
      if (!t.tipo) return false;
      const tipoNormalizado = normalizar(t.tipo);
      return variaciones.some(v => tipoNormalizado === normalizar(v));
    });
    
    if (taller && taller.id && typeof taller.id === 'number') {
      console.log('Taller encontrado localmente:', taller);
      console.log('ID del taller:', taller.id, 'Tipo:', typeof taller.id);
      this.router.navigate(['/taller', taller.id.toString()]);
      return;
    } else if (taller) {
      console.warn('Taller encontrado pero sin ID válido:', taller);
    }
    
    // Si no existe en la lista local, recargar desde la API
    console.log('Taller no encontrado en lista local, recargando desde API...');
    this.apiService.getTalleres().subscribe({
      next: (data) => {
        console.log('Talleres cargados desde API:', data);
        this.talleres = data;
        this.stats.talleres = data.length;
        
        // Buscar nuevamente con las variaciones
        const tallerEncontrado = data.find(t => {
          if (!t.tipo) return false;
          const tipoNormalizado = normalizar(t.tipo);
          return variaciones.some(v => tipoNormalizado === normalizar(v));
        });
        
        if (tallerEncontrado && tallerEncontrado.id && typeof tallerEncontrado.id === 'number') {
          console.log('Taller encontrado después de recargar:', tallerEncontrado);
          console.log('ID del taller:', tallerEncontrado.id, 'Tipo:', typeof tallerEncontrado.id);
          this.router.navigate(['/taller', tallerEncontrado.id.toString()]);
        } else {
          if (tallerEncontrado) {
            console.warn('Taller encontrado pero sin ID válido:', tallerEncontrado);
          }
          console.log('Taller no encontrado, navegando a lista filtrada');
          // Si aún no existe, navegar a la lista filtrada
          this.router.navigate(['/talleres'], { queryParams: { tipo } });
        }
      },
      error: (err) => {
        console.error('Error cargando talleres:', err);
        this.router.navigate(['/talleres'], { queryParams: { tipo } });
      }
    });
  }
}

