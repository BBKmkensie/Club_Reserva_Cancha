/**
 * Controlador raíz de la aplicación.
 * Expone el endpoint de bienvenida y estado básico de la API.
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Devuelve el mensaje de bienvenida de la API. */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
