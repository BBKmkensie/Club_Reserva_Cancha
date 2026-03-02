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
import { InscripcionSalidasComponent } from './pages/inscripcion-salidas/inscripcion-salidas.component';
import { LoginComponent } from './pages/login/login.component';
import { MisSalidasComponent } from './pages/mis-salidas/mis-salidas.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'talleres', component: TalleresComponent },
  { path: 'taller/:id', component: TallerDetailComponent },
  { path: 'alumnos', component: AlumnosComponent },
  { path: 'profesores', component: ProfesoresComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: 'salidas', component: SalidasComponent },
  { path: 'admins', component: AdminsComponent },
  { path: 'inscripcion-talleres', component: InscripcionTalleresComponent },
  { path: 'inscripcion-salidas', component: InscripcionSalidasComponent },
  { path: 'mis-salidas', component: MisSalidasComponent },
  { path: '**', redirectTo: '/dashboard' }
];

