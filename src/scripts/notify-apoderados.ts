import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ApoderadoNotifyService } from '../apoderado/apoderado-notify.service';

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
