/**
 * =============================================================================
 * main.ts — Punto de entrada de la aplicación Angular
 * =============================================================================
 * Este archivo es lo PRIMERO que se ejecuta al cargar el frontend.
 * Arranca la app en modo "standalone" (sin NgModule raíz) y registra:
 *   1. El enrutador (qué URL muestra qué página)
 *   2. El cliente HTTP + interceptor JWT (todas las llamadas a la API)
 *
 * Si bootstrapApplication falla, el error se registra en consola.
 * =============================================================================
 */

// bootstrapApplication = función de Angular que monta el componente raíz
// en el <app-root> del index.html y arranca la app.
import { bootstrapApplication } from '@angular/platform-browser';

// provideRouter = registra el sistema de rutas (navegación entre pantallas).
import { provideRouter } from '@angular/router';

// provideHttpClient = habilita HttpClient para llamar al backend NestJS.
// withInterceptors = encadena interceptores HTTP (aquí: authInterceptor).
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// authInterceptor = agrega el JWT a cada petición y redirige a /login si hay 401.
import { authInterceptor } from './app/shared/interceptors/auth.interceptor';

// AppComponent = shell visual (navbar + sidebar + router-outlet).
import { AppComponent } from './app/app.component';

// routes = mapa path → componente (definido en app.routes.ts).
import { routes } from './app/app.routes';

/**
 * Arranca la aplicación con AppComponent como raíz.
 * El segundo argumento (providers) inyecta servicios globales.
 */
bootstrapApplication(AppComponent, {
  providers: [
    // Conecta las rutas de app.routes.ts al Router de Angular.
    provideRouter(routes),

    // Todas las peticiones HttpClient pasan por authInterceptor
    // (Authorization: Bearer <token> + manejo de 401).
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  // Si algo falla al arrancar (import circular, error de DI…), lo vemos en consola.
}).catch((err) => console.error(err));
