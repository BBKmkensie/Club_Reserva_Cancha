/**
 * =============================================================================
 * config/swagger.setup.ts — DOCUMENTACIÓN OPENAPI (SWAGGER UI)
 * =============================================================================
 * Monta la interfaz interactiva de la API en:
 *   http://localhost:<puerto>/api/docs
 *
 * Desde ahí puedes probar endpoints, ver DTOs y autenticarte con Bearer JWT
 * (botón "Authorize" → pegas el accessToken del login).
 *
 * Se llama desde main.ts después de crear la app Nest.
 * =============================================================================
 */

// INestApplication = tipo genérico de la app Nest (lo que crea NestFactory).
import { INestApplication } from '@nestjs/common';

// DocumentBuilder = arma metadatos OpenAPI; SwaggerModule = genera UI + documento.
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * setupSwagger(app):
 *   - Arma el documento OpenAPI escaneando controllers/DTOs
 *   - Sirve la UI en /api/docs
 */
export function setupSwagger(app: INestApplication): void {
  // DocumentBuilder: metadatos del documento (título, descripción, auth)
  const config = new DocumentBuilder()
    .setTitle('Reservas de Cancha API')
    .setDescription('API del sistema de reservas y talleres')
    .setVersion('1.0')
    // 'JWT' es el nombre del esquema; coincide con @ApiBearerAuth('JWT') en controllers
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();

  // createDocument: escanea controllers/DTOs y arma el JSON OpenAPI
  const document = SwaggerModule.createDocument(app, config);

  // setup: sirve la UI en la ruta 'api/docs'
  SwaggerModule.setup('api/docs', app, document);
}
