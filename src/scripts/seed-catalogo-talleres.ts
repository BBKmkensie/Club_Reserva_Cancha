import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TallerSeedService } from '../taller/taller-seed.service';

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
