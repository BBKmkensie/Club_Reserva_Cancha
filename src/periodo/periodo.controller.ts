import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PeriodoService } from './periodo.service';
import { PeriodoAcademicoDto } from '../dto/periodo-academico.dto';

@ApiTags('Período')
@ApiBearerAuth('JWT')
@Controller('periodo')
export class PeriodoController {
  constructor(private readonly periodoService: PeriodoService) {}

  @Get()
  findAll() {
    return this.periodoService.findAll();
  }

  @Get('activo')
  getActivo() {
    return this.periodoService.getActivo();
  }

  @Put()
  configurar(@Body() dto: PeriodoAcademicoDto) {
    return this.periodoService.configurar(dto);
  }
}
