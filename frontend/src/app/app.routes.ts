/**
 * =============================================================================
 * app/app.routes.ts — Mapa de rutas de la aplicación
 * =============================================================================
 * Define qué URL carga qué componente de página.
 *
 * Rutas públicas (sin authGuard): /login, /dashboard, /taller/:id
 * Rutas protegidas: canActivate: [authGuard] — si no hay JWT, va a /login
 *
 * path: ''  → redirige a /dashboard
 * path: '**' → cualquier URL desconocida también va a /dashboard
 * =============================================================================
 */

// Routes = tipo TypeScript del array de rutas de Angular.
import { Routes } from '@angular/router';

// --- Páginas (cada una es un componente standalone) ---
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TalleresComponent } from './pages/talleres/talleres.component';
import { TallerDetailComponent } from './pages/taller-detail/taller-detail.component';
import { AlumnosComponent } from './pages/alumnos/alumnos.component';
import { ProfesoresComponent } from './pages/profesores/profesores.component';
import { ReservasComponent } from './pages/reservas/reservas.component';
import { SalidasComponent } from './pages/salidas/salidas.component';
import { AdminsComponent } from './pages/admins/admins.component';
import { InscripcionTalleresComponent } from './pages/inscripcion-talleres/inscripcion-talleres.component';
import { GestionInscripcionesComponent } from './pages/gestion-inscripciones/gestion-inscripciones.component';
import { ControlAsistenciaComponent } from './pages/control-asistencia/control-asistencia.component';
import { ReportesAsistenciaComponent } from './pages/reportes-asistencia/reportes-asistencia.component';
import { GestionActividadesComponent } from './pages/gestion-actividades/gestion-actividades.component';
import { InscripcionSalidasComponent } from './pages/inscripcion-salidas/inscripcion-salidas.component';
import { LoginComponent } from './pages/login/login.component';
import { MisSalidasComponent } from './pages/mis-salidas/mis-salidas.component';
import { FichasAlumnosComponent } from './pages/fichas-alumnos/fichas-alumnos.component';
import { ComparacionSemestreComponent } from './pages/comparacion-semestre/comparacion-semestre.component';
import { PortalApoderadoComponent } from './pages/portal-apoderado/portal-apoderado.component';
import { PropuestasActividadComponent } from './pages/propuestas-actividad/propuestas-actividad.component';

// Guard: bloquea la ruta si no hay sesión (token + rol).
import { authGuard } from './shared/guards/auth.guard';

/**
 * Orden importa: Angular prueba de arriba a abajo.
 * Las rutas específicas van antes del comodín '**'.
 */
export const routes: Routes = [
  // /login — pantalla de inicio de sesión (pública; sin JWT).
  { path: 'login', component: LoginComponent },

  // / (raíz) — redirige al dashboard; pathMatch: 'full' = solo si la URL es exactamente ''.
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // /dashboard — inicio / resumen (pública; el contenido se adapta al rol).
  { path: 'dashboard', component: DashboardComponent },

  // /talleres — listado CRUD de talleres (requiere login).
  { path: 'talleres', component: TalleresComponent, canActivate: [authGuard] },

  // /gestion-actividades — flujo de publicación de actividades (directiva/profesor).
  { path: 'gestion-actividades', component: GestionActividadesComponent, canActivate: [authGuard] },

  // /taller/:id — detalle de un taller; :id es el parámetro numérico (pública).
  { path: 'taller/:id', component: TallerDetailComponent },

  // /alumnos — gestión de estudiantes (coordinación).
  { path: 'alumnos', component: AlumnosComponent, canActivate: [authGuard] },

  // /profesores — gestión de docentes (coordinación).
  { path: 'profesores', component: ProfesoresComponent, canActivate: [authGuard] },

  // /reservas — reservas de cancha deportiva.
  { path: 'reservas', component: ReservasComponent, canActivate: [authGuard] },

  // /salidas — gestión de salidas pedagógicas (crear, aprobar, cerrar).
  { path: 'salidas', component: SalidasComponent, canActivate: [authGuard] },

  // /admins — cuentas de administradores / directiva.
  { path: 'admins', component: AdminsComponent, canActivate: [authGuard] },

  // /inscripcion-talleres — el alumno solicita inscripción a talleres.
  { path: 'inscripcion-talleres', component: InscripcionTalleresComponent, canActivate: [authGuard] },

  // /gestion-inscripciones — aceptar/rechazar solicitudes y propuestas.
  { path: 'gestion-inscripciones', component: GestionInscripcionesComponent, canActivate: [authGuard] },

  // /control-asistencia — abrir/cerrar sesión y marcar presentes/ausentes.
  { path: 'control-asistencia', component: ControlAsistenciaComponent, canActivate: [authGuard] },

  // /reportes-asistencia — reportes y alertas de ausencias.
  { path: 'reportes-asistencia', component: ReportesAsistenciaComponent, canActivate: [authGuard] },

  // /fichas-alumnos — fichas físicas (altura, peso, etc.) por taller.
  { path: 'fichas-alumnos', component: FichasAlumnosComponent, canActivate: [authGuard] },

  // /comparacion-semestre — estadísticas comparativas del período.
  { path: 'comparacion-semestre', component: ComparacionSemestreComponent, canActivate: [authGuard] },

  // /inscripcion-salidas — el alumno se inscribe a salidas publicadas.
  { path: 'inscripcion-salidas', component: InscripcionSalidasComponent, canActivate: [authGuard] },

  // /mis-salidas — salidas del alumno autenticado.
  { path: 'mis-salidas', component: MisSalidasComponent, canActivate: [authGuard] },

  // /portal-apoderado — vista del apoderado (hijo, propuestas, resumen).
  { path: 'portal-apoderado', component: PortalApoderadoComponent, canActivate: [authGuard] },

  // /propuestas-actividad — proponer / gestionar actividades libres.
  { path: 'propuestas-actividad', component: PropuestasActividadComponent, canActivate: [authGuard] },

  // Cualquier otra URL → dashboard (evita pantallas en blanco).
  { path: '**', redirectTo: '/dashboard' },
];
