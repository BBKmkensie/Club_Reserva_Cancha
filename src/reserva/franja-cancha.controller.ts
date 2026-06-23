import { Controller, Get, Put, Body, Query } from '@nestjs/common';
import { FranjaCanchaService } from './franja-cancha.service';
import { ActualizarFranjasCanchaDto } from '../dto/actualizar-franjas-cancha.dto';
import { CANCHA_ESPACIO_DEFAULT } from './cancha.constants';

@Controller('franja-cancha')
export class FranjaCanchaController {
  constructor(private readonly franjaService: FranjaCanchaService) {}

  @Get()
  async findAll(@Query('espacio') espacio?: string) {
    await this.franjaService.asegurarFranjasBase(espacio ?? CANCHA_ESPACIO_DEFAULT);
    return this.franjaService.findAll(espacio ?? CANCHA_ESPACIO_DEFAULT);
  }

  @Put()
  actualizar(@Body() dto: ActualizarFranjasCanchaDto) {
    return this.franjaService.actualizar(dto);
  }
}
