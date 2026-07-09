import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ReportesService } from '../reportes/reportes.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const reportes = app.get(ReportesService);
    const data = await reportes.getPersonasInscripciones();
    console.log(JSON.stringify(data, null, 2));
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
