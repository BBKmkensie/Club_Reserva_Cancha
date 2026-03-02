import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthRoleService } from '../../shared/services/auth-role.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 class="text-2xl font-bold text-gray-800 mb-2 text-center">Reservas de Cancha</h1>
        <p class="text-gray-600 text-center mb-6">Elige tu rol para continuar</p>

        <div class="space-y-3">
          <button (click)="entrar('super_admin')"
                  class="w-full py-3 px-4 rounded-lg border-2 border-amber-500 text-amber-700 font-medium hover:bg-amber-50 transition">
            Super Admin
          </button>

          <div class="border-2 border-blue-200 rounded-lg p-3 bg-blue-50/50">
            <input [(ngModel)]="profesorUsuario" type="text" placeholder="Ej: Juan Pérez o Futbol"
                   class="w-full py-2 px-3 border border-gray-300 rounded-lg mb-2">
            <input [(ngModel)]="profesorPassword" type="password" placeholder="Contraseña (12345)"
                   class="w-full py-2 px-3 border border-gray-300 rounded-lg mb-2">
            @if (profesorError) {
              <p class="text-sm text-red-600 mb-2">{{ profesorError }}</p>
            }
            <button (click)="entrarComoProfesor()"
                    [disabled]="!profesorUsuario?.trim() || !profesorPassword"
                    class="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Entrar como profesor
            </button>
          </div>

          <select [(ngModel)]="alumnoIdSeleccionado" (ngModelChange)="onAlumnoChange()"
                  class="w-full py-2 px-3 border border-gray-300 rounded-lg mb-1">
            <option [ngValue]="null">Seleccionar alumno (estudiante)</option>
            <option *ngFor="let a of alumnos" [ngValue]="a.id">{{ a.nombre }} ({{ a.rut }})</option>
          </select>
          <button (click)="entrarComoAlumno()"
                  [disabled]="!alumnoIdSeleccionado"
                  class="w-full py-3 px-4 rounded-lg border-2 border-green-500 text-green-700 font-medium hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Estudiante (Usuario)
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private auth = inject(AuthRoleService);
  private api = inject(ApiService);
  private router = inject(Router);

  alumnos: { id: number; nombre: string; rut: string }[] = [];
  alumnoIdSeleccionado: number | null = null;
  profesorUsuario = '';
  profesorPassword = '12345';
  profesorError = '';

  ngOnInit(): void {
    this.api.getAlumnos().subscribe({
      next: (data) => this.alumnos = data.map((a: any) => ({ id: a.id, nombre: a.nombre, rut: a.rut })),
      error: () => this.alumnos = []
    });
  }

  onAlumnoChange(): void {}

  entrar(role: 'super_admin'): void {
    this.auth.setRole(role);
    this.router.navigate(['/dashboard']);
  }

  entrarComoProfesor(): void {
    this.profesorError = '';
    const usuario = this.profesorUsuario?.trim();
    const password = this.profesorPassword || '';
    if (!usuario) return;
    this.api.loginProfesor(usuario, password).subscribe({
      next: (profesor) => {
        this.auth.setRole('admin', profesor.id, profesor.tallerId ?? profesor.taller?.id);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.profesorError = err?.error?.message || 'Usuario o contraseña incorrectos';
      }
    });
  }

  entrarComoAlumno(): void {
    if (this.alumnoIdSeleccionado != null) {
      this.auth.setRole('usuario', this.alumnoIdSeleccionado);
      this.router.navigate(['/dashboard']);
    }
  }
}
