/**
 * Controlador raíz de la aplicación.
 * Expone el endpoint de bienvenida y estado básico de la API.
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Endpoint de salud para monitoreo y Azure App Service. */
  @Get('health')
  getHello(): string {
    return this.appService.getHello();
  }
}
