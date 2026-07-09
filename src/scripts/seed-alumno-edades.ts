/**
 * Script CLI para completar edades faltantes de alumnos.
 * Ejecuta AlumnoEdadSeedService y muestra el resultado en JSON.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AlumnoEdadSeedService } from '../alumno/alumno-edad-seed.service';

/** Punto de entrada: crea el contexto Nest y ejecuta el seed de edades. */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const seed = app.get(AlumnoEdadSeedService);
    const result = await seed.seedMissingEdades();
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
