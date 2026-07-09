/**
 * Script CLI para sembrar reservas deportivas del semestre en cancha.
 * Ejecuta ReservaCanchaSeedService y muestra el resultado en JSON.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ReservaCanchaSeedService } from '../reserva/reserva-cancha-seed.service';

/** Punto de entrada: crea el contexto Nest y ejecuta el seed de reservas deportivas. */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const seed = app.get(ReservaCanchaSeedService);
    const result = await seed.seedReservasDeportesSemestre();
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
