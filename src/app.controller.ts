/**
 * =============================================================================
 * app.controller.ts — CONTROLADOR RAÍZ (ejemplo mínimo de NestJS)
 * =============================================================================
 * Un Controller = "puerta HTTP".
 * Recibe la petición (GET/POST/...) y llama a un Service.
 * NO debería hablar directo con la base de datos.
 *
 * Patrón:
 *   Browser/Cliente  →  @Get/@Post (Controller)  →  Service  →  (BD u otra lógica)
 * =============================================================================
 */

// Controller = marca la clase como rutas HTTP; Get = método HTTP GET.
import { Controller, Get } from '@nestjs/common';

// AppService = lógica asociada (aquí solo un string de salud).
import { AppService } from './app.service';

/**
 * AppController:
 *   @Controller() sin prefijo → las rutas quedan en la raíz del servidor.
 *   Ejemplo: @Get('health') → GET http://localhost:3000/health
 */
@Controller()
export class AppController {
  /**
   * Inyección de dependencias:
   * Nest crea AppService y lo pasa aquí automáticamente.
   * No haces "new AppService()" a mano.
   */
  constructor(private readonly appService: AppService) {}

  /**
   * GET /health — endpoint de salud (health check).
   * Azure / balanceadores / monitores llaman aquí para ver si la API está viva.
   *
   * getHello() solo delega al service (buena práctica: controller delgado).
   */
  @Get('health')
  getHello(): string {
    return this.appService.getHello();
  }
}
