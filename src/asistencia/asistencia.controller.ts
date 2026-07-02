import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { AbrirSesionDto } from '../dto/abrir-sesion.dto';
import { ActualizarAsistenciaDto } from '../dto/actualizar-asistencia.dto';
import { CerrarSesionDto } from '../dto/cerrar-sesion.dto';

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Post('sesion/abrir')
  abrirSesion(@Body() dto: AbrirSesionDto) {
    return this.asistenciaService.abrirSesion(dto);
  }

  @Get('sesion/activa/:tallerId')
  sesionActiva(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.asistenciaService.sesionActiva(tallerId);
  }

  @Get('sesion/:id')
  obtenerSesion(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.obtenerSesion(id);
  }

  @Get('sesiones/:tallerId')
  historial(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.asistenciaService.historialSesiones(tallerId);
  }

  @Patch('sesion/:id/registros')
  actualizarAsistencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarAsistenciaDto,
  ) {
    return this.asistenciaService.actualizarAsistencia(id, dto);
  }

  @Patch('sesion/:id/cerrar')
  cerrarSesion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CerrarSesionDto,
  ) {
    return this.asistenciaService.cerrarSesion(id, dto);
  }

  @Get('reporte/:tallerId')
  getReporte(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.asistenciaService.getReporte(tallerId);
  }

  @Get('alertas')
  getAlertasGlobales() {
    return this.asistenciaService.getAlertasGlobales();
  }
}
