import { Routes } from '@angular/router';
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
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'talleres', component: TalleresComponent, canActivate: [authGuard] },
  { path: 'gestion-actividades', component: GestionActividadesComponent, canActivate: [authGuard] },
  { path: 'taller/:id', component: TallerDetailComponent },
  { path: 'alumnos', component: AlumnosComponent, canActivate: [authGuard] },
  { path: 'profesores', component: ProfesoresComponent, canActivate: [authGuard] },
  { path: 'reservas', component: ReservasComponent, canActivate: [authGuard] },
  { path: 'salidas', component: SalidasComponent, canActivate: [authGuard] },
  { path: 'admins', component: AdminsComponent, canActivate: [authGuard] },
  { path: 'inscripcion-talleres', component: InscripcionTalleresComponent, canActivate: [authGuard] },
  { path: 'gestion-inscripciones', component: GestionInscripcionesComponent, canActivate: [authGuard] },
  { path: 'control-asistencia', component: ControlAsistenciaComponent, canActivate: [authGuard] },
  { path: 'reportes-asistencia', component: ReportesAsistenciaComponent, canActivate: [authGuard] },
  { path: 'fichas-alumnos', component: FichasAlumnosComponent, canActivate: [authGuard] },
  { path: 'comparacion-semestre', component: ComparacionSemestreComponent, canActivate: [authGuard] },
  { path: 'inscripcion-salidas', component: InscripcionSalidasComponent, canActivate: [authGuard] },
  { path: 'mis-salidas', component: MisSalidasComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
