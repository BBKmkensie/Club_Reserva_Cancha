import * as express from 'express';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.setup';

/**
 * Punto de entrada de la aplicación NestJS.
 * Configura validación global, CORS, frontend estático y arranca el servidor HTTP.
 */
/** Inicializa y levanta el servidor de la API. */
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

  const frontendDist = join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));

  setupSwagger(app);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('*', (req, res) => {
    res.sendFile(join(frontendDist, 'index.html'));
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
}
bootstrap();
