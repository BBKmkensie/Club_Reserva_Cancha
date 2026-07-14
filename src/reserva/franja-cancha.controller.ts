/**
 * =============================================================================
 * reserva/franja-cancha.controller.ts — ENDPOINTS DE FRANJAS HORARIAS
 * =============================================================================
 * Prefijo: /franja-cancha
 *
 * Las "franjas" son los bloques que la directiva habilita para reservar
 * (ej. lunes 09:00–09:30 activo, martes 15:00–16:00 activo, etc.).
 *
 * Endpoints:
 *   GET /franja-cancha?espacio=  → lista franjas (crea la grilla base si falta)
 *   PUT /franja-cancha           → actualiza qué franjas están activas / duración
 * =============================================================================
 */
// Get/Put = verbos HTTP; Body = JSON; Query = ?espacio=
import { Controller, Get, Put, Body, Query } from '@nestjs/common';
import { FranjaCanchaService } from './franja-cancha.service';
import { ActualizarFranjasCanchaDto } from '../dto/actualizar-franjas-cancha.dto';
import { CANCHA_ESPACIO_DEFAULT } from './cancha.constants';

/** @Controller('franja-cancha') → rutas bajo /franja-cancha */
@Controller('franja-cancha')
export class FranjaCanchaController {
  constructor(private readonly franjaService: FranjaCanchaService) {}

  /**
   * GET /franja-cancha?espacio=
   * @Get() = listar. Antes de listar, asegura grilla base de 30 minutos
   * (asegurarFranjasBase) para no devolver array vacío en instalaciones nuevas.
   */
  @Get()
  async findAll(@Query('espacio') espacio?: string) {
    await this.franjaService.asegurarFranjasBase(espacio ?? CANCHA_ESPACIO_DEFAULT);
    return this.franjaService.findAll(espacio ?? CANCHA_ESPACIO_DEFAULT);
  }

  /**
   * PUT /franja-cancha
   * @Body() ActualizarFranjasCanchaDto: lista de franjas a activar/desactivar
   * y opcionalmente ampliar duración (ej. de 30 min a 60 min).
   */
  @Put()
  actualizar(@Body() dto: ActualizarFranjasCanchaDto) {
    return this.franjaService.actualizar(dto);
  }
}
