import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthRoleService, AppRole, UserTipo } from '../../shared/services/auth-role.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 class="text-2xl font-bold text-gray-800 mb-2 text-center">Reservas de Cancha</h1>
        <p class="text-gray-600 text-center mb-6">Iniciar sesión</p>
        <p class="text-sm text-gray-500 text-center mb-4">Ingresa tu usuario y contraseña</p>

        <div class="space-y-4">
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Usuario</span>
            <input [(ngModel)]="usuario" type="text"
                   placeholder="Email, RUT o nombre de profesor"
                   class="mt-1 w-full py-2 px-3 border border-gray-300 rounded-lg">
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Contraseña</span>
            <input [(ngModel)]="password" type="password" placeholder="Contraseña"
                   class="mt-1 w-full py-2 px-3 border border-gray-300 rounded-lg"
                   (keyup.enter)="entrar()">
          </label>
          @if (error) {
            <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{{ error }}</p>
          }
          <button (click)="entrar()"
                  [disabled]="!usuario.trim() || !password || cargando"
                  class="w-full py-2.5 px-4 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50">
            {{ cargando ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>

        <p class="text-xs text-gray-400 mt-6 text-center leading-relaxed">
          Super admin: admin&#64;reservas.local · Directiva: directiva&#64;reservas.local ·
          Profesor: nombre completo · Alumno: RUT
        </p>
        <a routerLink="/dashboard" class="block text-center text-sm text-gray-500 mt-3 hover:text-primary-600">
          ← Volver al inicio
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthRoleService);
  private api = inject(ApiService);
  private router = inject(Router);

  usuario = '';
  password = '12345';
  error = '';
  cargando = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  entrar(): void {
    this.error = '';
    this.cargando = true;
    this.api.loginUnified(this.usuario.trim(), this.password).subscribe({
      next: (res) => {
        this.cargando = false;
        this.auth.setSession(
          res.accessToken,
          res.user.role as AppRole,
          res.user.id,
          res.user.tallerId,
          res.user.nombre,
          res.user.tipo as UserTipo,
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : (msg || 'Usuario o contraseña incorrectos');
      },
    });
  }
}
