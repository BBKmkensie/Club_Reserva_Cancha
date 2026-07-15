/**
 * =============================================================================
 * main.ts — PUNTO DE ENTRADA DEL BACKEND (NestJS)
 * =============================================================================
 * Este archivo es lo PRIMERO que se ejecuta cuando corres:
 *   npm run start:dev
 *
 * Flujo resumido:
 *   1. Importa librerías
 *   2. Define qué rutas son de la API (no del frontend Angular)
 *   3. Función bootstrap() crea el servidor, configura validación/CORS,
 *      sirve el frontend si existe, monta Swagger y escucha un puerto
 *   4. Al final se llama bootstrap() para arrancar todo
 * =============================================================================
 */

// Express = motor HTTP que NestJS usa por debajo (servir archivos estáticos, etc.).
import * as express from 'express';

// join = une rutas de carpetas (ej. ".../frontend/dist/...").
import { join } from 'path';

// existsSync = pregunta si una carpeta/archivo existe en el disco.
import { existsSync, mkdirSync } from 'fs';

// NestFactory = fábrica que CREA la aplicación NestJS.
import { NestFactory } from '@nestjs/core';

// NestExpressApplication = tipo de app Nest que usa Express por dentro.
import { NestExpressApplication } from '@nestjs/platform-express';

// ValidationPipe = valida automáticamente el body de las peticiones (DTOs).
import { ValidationPipe } from '@nestjs/common';

// AppModule = módulo raíz que conecta BD, JWT, auth, talleres, etc.
import { AppModule } from './app.module';

// setupSwagger = monta la documentación interactiva en /api/docs.
import { setupSwagger } from './config/swagger.setup';

/**
 * API_ROUTE_PREFIXES = prefijos de rutas que pertenecen a la API (backend).
 *
 * ¿Para qué sirve?
 * Cuando el backend también sirve el frontend Angular (SPA), cualquier URL
 * "desconocida" se reescribe a index.html (para que Angular maneje el router).
 * Pero /auth, /taller, /alumno, etc. NO deben devolver HTML: deben ir a Nest.
 */
const API_ROUTE_PREFIXES = [
  '/auth', // login y /auth/me
  '/admin', // CRUD administradores
  '/taller', // talleres y ciclo de publicación
  '/alumno', // CRUD alumnos
  '/profesor', // CRUD profesores
  '/reserva', // reservas de cancha
  '/salida', // salidas pedagógicas
  '/inscripcion-salida', // inscripciones a salidas
  '/inscripcion-taller', // inscripciones a talleres
  '/periodo', // período académico
  '/asistencia', // sesiones y listas
  '/ficha-alumno', // ficha antropométrica
  '/notificacion', // notificaciones in-app
  '/apoderado', // portal apoderado
  '/reportes', // reportes
  '/franja-cancha', // franjas horarias de cancha
  '/health', // health check (Azure / monitoreo)
  '/api', // Swagger y rutas bajo /api
];

/**
 * bootstrap() = "arrancar el servidor".
 * Es async porque crear la app y escuchar el puerto son operaciones asíncronas.
 */
async function bootstrap() {
  // Crea la aplicación NestJS usando AppModule como raíz.
  // A partir de aquí Nest conoce todos los controllers, services y la BD.
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ---------- Validación global de todas las peticiones ----------
  // ValidationPipe revisa el body contra class-validator en los DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true → elimina del body los campos que NO están en el DTO
      // (evita que manden campos basura o peligrosos)
      whitelist: true,
      // forbidNonWhitelisted: true → si mandan un campo extra, responde error 400
      forbidNonWhitelisted: true,
      // transform: true → convierte tipos (ej. "1" string → 1 number) según el DTO
      transform: true,
    }),
  );

  // ---------- CORS ----------
  // Permite que el frontend (ej. http://localhost:4200) llame a la API
  // (ej. http://localhost:3000) aunque sean orígenes distintos.
  app.enableCors();

  // ---------- Servir uploads (evidencias de asistencia en salidas) ----------
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // ---------- Servir el frontend Angular (opcional) ----------
  // Ruta donde queda el build de Angular tras "ng build".
  // __dirname = carpeta del archivo compilado (dist/), por eso sube un nivel (..)
  const frontendDist = join(
    __dirname,
    '..',
    'frontend',
    'dist',
    'reservas-frontend',
    'browser',
  );

  // Solo si existe el build del frontend, lo servimos desde el mismo puerto que la API.
  if (existsSync(frontendDist)) {
  // Sirve CSS, JS, imágenes, etc. como archivos estáticos
    app.use(express.static(frontendDist));

    // Obtiene la instancia Express "cruda" para agregar un middleware custom
    const expressApp = app.getHttpAdapter().getInstance();

    /**
     * Middleware SPA (Single Page Application):
     * Si el navegador pide una ruta como /dashboard o /talleres (GET),
     * y NO es una ruta de API ni un archivo (tiene punto, ej. .js),
     * devolvemos index.html para que Angular decida qué pantalla mostrar.
     */
    expressApp.use((req, res, next) => {
      // Solo aplicamos el fallback SPA a GET/HEAD (navegación del browser)
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next(); // deja pasar POST/PATCH/DELETE a los controllers Nest
      }
      // Si la URL empieza con un prefijo de API → no tocar, que Nest responda JSON
      if (API_ROUTE_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
        return next();
      }
      // Si la URL parece un archivo (tiene extensión) → que Express lo sirva o 404
      if (req.path.includes('.')) {
        return next();
      }
      // Caso típico: /dashboard → devolver index.html (Angular router)
      res.sendFile(join(frontendDist, 'index.html'), (err) => {
        if (err) next(err);
      });
    });
  } else {
    // En desarrollo suele no existir el dist: solo corre la API
    console.warn(
      `Frontend no encontrado en ${frontendDist}; solo API disponible.`,
    );
  }

  // Monta Swagger UI (documentación de endpoints) en /api/docs
  setupSwagger(app);

  // ---------- Puerto ----------
  // Lee PORT del .env (ej. PORT=3000). Si no existe o no es número → error.
  const port = parseInt(process.env.PORT ?? '', 10);
  if (!Number.isFinite(port)) {
    throw new Error('La variable de entorno PORT no está definida.');
  }

  // Escucha en todas las interfaces (0.0.0.0) = útil en Docker/Azure, no solo localhost
  await app.listen(port, '0.0.0.0');
  console.log(`Aplicación corriendo en el puerto ${port}`);
  console.log('Swagger UI: /api/docs');
}

// Ejecuta el arranque (sin esta línea, el archivo no haría nada)
bootstrap();
