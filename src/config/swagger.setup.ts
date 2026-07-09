/**
 * Configuración de documentación OpenAPI (Swagger).
 * Expone la API en `/api/docs` con autenticación Bearer JWT.
 */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Monta Swagger UI y genera el documento OpenAPI de la aplicación. */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Reservas de Cancha API')
    .setDescription('API del sistema de reservas y talleres')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
