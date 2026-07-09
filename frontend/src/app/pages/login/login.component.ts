/**
 * Pantalla de inicio de sesión unificada.
 * Permite autenticarse con RUT, correo o nombre de profesor; redirige según el tipo de cuenta.
 */
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthRoleService, AppRole, UserTipo } from '../../shared/services/auth-role.service';
import { ApiService } from '../../services/api.service';
import { LogoNautaComponent } from '../../shared/components/logo-nauta/logo-nauta.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

/**
 * Componente de login: formulario de credenciales y redirección post-autenticación.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LogoNautaComponent, ThemeToggleComponent],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-page px-3 sm:px-4 py-6 sm:py-8">
      <div class="absolute top-4 right-4">
        <app-theme-toggle />
      </div>
      <div class="bg-surface rounded-xl shadow-lg p-5 sm:p-8 w-full max-w-md border border-line">
        <div class="mb-5 sm:mb-6">
          <app-logo-nauta variant="login" [linkTo]="null" />
        </div>

        <div class="space-y-4">
          <label class="block">
            <span class="text-sm font-medium text-ink-secondary">Usuario</span>
            <input [(ngModel)]="usuario" type="text"
                   placeholder="RUT, correo o nombre del profesor"
                   autocomplete="username"
                   class="mt-1 w-full py-2.5 px-3 app-input bg-surface">
          </label>
          <label class="block">
            <span class="text-sm font-medium text-ink-secondary">Contraseña</span>
            <input [(ngModel)]="password" type="password" placeholder="Contraseña"
                   autocomplete="current-password"
                   class="mt-1 w-full py-2.5 px-3 app-input bg-surface"
                   (keyup.enter)="entrar()">
          </label>
          @if (error) {
            <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{{ error }}</p>
          }
          <button (click)="entrar()"
                  [disabled]="!usuario.trim() || !password || cargando"
                  class="w-full py-2.5 px-4 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50">
            {{ cargando ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>

        <a routerLink="/dashboard" class="block text-center text-sm text-ink-muted mt-6 hover:text-primary-600">
          ← Volver al inicio
        </a>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthRoleService);
  private api = inject(ApiService);
  private router = inject(Router);

  usuario = '';
  password = '';
  error = '';
  cargando = false;

  /** Redirige al dashboard o portal si ya hay sesión activa. */
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.isApoderado() ? '/portal-apoderado' : '/dashboard']);
    }
  }

  /** Valida credenciales contra la API y guarda la sesión en AuthRoleService. */
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
        if (res.user.tipo === 'apoderado') {
          this.router.navigate(['/portal-apoderado']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.cargando = false;
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : (msg || 'Usuario o contraseña incorrectos');
      },
    });
  }
}
