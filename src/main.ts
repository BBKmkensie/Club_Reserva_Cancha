import * as express from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.setup';

/** Prefijos de rutas API que no deben devolver index.html del SPA. */
const API_ROUTE_PREFIXES = [
  '/auth',
  '/admin',
  '/taller',
  '/alumno',
  '/profesor',
  '/reserva',
  '/salida',
  '/inscripcion-salida',
  '/inscripcion-taller',
  '/periodo',
  '/asistencia',
  '/ficha-alumno',
  '/notificacion',
  '/apoderado',
  '/reportes',
  '/franja-cancha',
  '/health',
  '/api',
];

/**
 * Punto de entrada de la aplicación NestJS.
 * Configura validación global, CORS, frontend estático y arranca el servidor HTTP.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const frontendDist = join(__dirname, '..', 'frontend', 'dist', 'reservas-frontend', 'browser');
  if (existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }
      if (API_ROUTE_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
        return next();
      }
      if (req.path.includes('.')) {
        return next();
      }
      res.sendFile(join(frontendDist, 'index.html'), (err) => {
        if (err) next(err);
      });
    });
  } else {
    console.warn(`Frontend no encontrado en ${frontendDist}; solo API disponible.`);
  }

  setupSwagger(app);

  const port = parseInt(process.env.PORT ?? '', 10);
  if (!Number.isFinite(port)) {
    throw new Error('La variable de entorno PORT no está definida.');
  }
  await app.listen(port, '0.0.0.0');
  console.log(`Aplicación corriendo en el puerto ${port}`);
  console.log('Swagger UI: /api/docs');
}
bootstrap();
