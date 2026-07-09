/**
 * Servicio raíz de la aplicación.
 * Provee utilidades básicas del bootstrap de NestJS.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /** Mensaje de bienvenida por defecto de la API. */
  getHello(): string {
    return 'Hello World!';
  }
}
