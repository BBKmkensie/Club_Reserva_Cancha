/**
 * Script CLI para actualizar nombres de apoderados.
 * Ejecuta ApoderadoSeedService.actualizarNombresApoderados y muestra el resultado en JSON.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ApoderadoSeedService } from '../apoderado/apoderado-seed.service';

/** Punto de entrada: crea el contexto Nest y ejecuta la actualización de nombres. */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const seed = app.get(ApoderadoSeedService);
    const result = await seed.actualizarNombresApoderados();
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
