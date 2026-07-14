/**
 * =============================================================================
 * periodo/periodo.controller.ts — ENDPOINTS DEL PERÍODO ACADÉMICO
 * =============================================================================
 * Prefijo: /periodo
 *
 *   GET /periodo/activo  → el período marcado activo:true
 *   GET /periodo         → historial de períodos
 *   PUT /periodo         → configura uno nuevo (desactiva los anteriores)
 *
 * El período define la ventana de fechas en que se permiten inscripciones.
 * =============================================================================
 */
// Put = reemplaza/configura el período activo; Body = JSON validado
import { Body, Controller, Get, Put } from '@nestjs/common';
import { PeriodoService } from './periodo.service';
import { PeriodoAcademicoDto } from '../dto/periodo-academico.dto';

/** Prefijo HTTP /periodo — ventana de fechas del ciclo escolar. */
@Controller('periodo')
export class PeriodoController {
  /** Nest inyecta PeriodoService (exportado globalmente). */
  constructor(private readonly periodoService: PeriodoService) {}

  /** GET /periodo/activo — el período con activo=true (o null). */
  @Get('activo')
  getActivo() {
    return this.periodoService.getActivo();
  }

  /** GET /periodo — historial de períodos, más recientes primero. */
  @Get()
  findAll() {
    return this.periodoService.findAll();
  }

  /** PUT /periodo — body: PeriodoAcademicoDto (nombre, fechas); desactiva los anteriores. */
  @Put()
  configurar(@Body() dto: PeriodoAcademicoDto) {
    return this.periodoService.configurar(dto);
  }
}
