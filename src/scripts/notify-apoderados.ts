/**
 * Script CLI para notificar a apoderados sobre inscripciones y asistencia.
 * Ejecuta ApoderadoNotifyService y muestra el resultado en JSON.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ApoderadoNotifyService } from '../apoderado/apoderado-notify.service';

/** Punto de entrada: crea el contexto Nest y envía las notificaciones. */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const notify = app.get(ApoderadoNotifyService);
    const result = await notify.notifyInscripcionesYAsistencia();
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
