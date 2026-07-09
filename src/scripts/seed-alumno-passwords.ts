/**
 * Script CLI para completar contraseñas faltantes de alumnos.
 * Ejecuta AlumnoPasswordSeedService y muestra el resultado en JSON.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AlumnoPasswordSeedService } from '../alumno/alumno-password-seed.service';

/** Punto de entrada: crea el contexto Nest y ejecuta el seed de contraseñas. */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const seed = app.get(AlumnoPasswordSeedService);
    const result = await seed.seedMissingPasswords();
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
