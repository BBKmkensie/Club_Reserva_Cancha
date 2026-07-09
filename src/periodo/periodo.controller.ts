/**
 * Controlador HTTP de períodos académicos.
 * Consulta el período activo y permite configurar fechas de apertura y cierre.
 */
import { Body, Controller, Get, Put } from '@nestjs/common';
import { PeriodoService } from './periodo.service';
import { PeriodoAcademicoDto } from '../dto/periodo-academico.dto';

@Controller('periodo')
export class PeriodoController {
  constructor(private readonly periodoService: PeriodoService) {}

  @Get('activo')
  getActivo() {
    return this.periodoService.getActivo();
  }

  @Get()
  findAll() {
    return this.periodoService.findAll();
  }

  @Put()
  configurar(@Body() dto: PeriodoAcademicoDto) {
    return this.periodoService.configurar(dto);
  }
}
