/**
 * Script CLI para sembrar el catálogo de talleres.
 * Ejecuta TallerSeedService.seedCatalogoTalleres y muestra el resultado en JSON.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TallerSeedService } from '../taller/taller-seed.service';

/** Punto de entrada: crea el contexto Nest y ejecuta el seed del catálogo. */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const seed = app.get(TallerSeedService);
    const result = await seed.seedCatalogoTalleres();
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
