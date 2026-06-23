import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AsistenciaService } from './asistencia.service';
import { AbrirSesionDto } from '../dto/abrir-sesion.dto';
import { ActualizarAsistenciaDto } from '../dto/actualizar-asistencia.dto';
import { CerrarSesionDto } from '../dto/cerrar-sesion.dto';
import { GestionarAlertaDto } from '../dto/gestionar-alerta.dto';
import { ActualizarUmbralDto } from '../dto/actualizar-umbral.dto';

@ApiTags('Asistencia')
@ApiBearerAuth('JWT')
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

  @Get('alertas/gestion')
  getAlertasGestion(@Query('tallerId') tallerId?: string) {
    const id = tallerId ? parseInt(tallerId, 10) : undefined;
    return this.asistenciaService.getAlertasGestion(id);
  }

  @Patch('alertas/:id/contactar')
  contactarApoderado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GestionarAlertaDto,
  ) {
    return this.asistenciaService.contactarApoderado(id, dto);
  }

  @Patch('alertas/:id/resolver')
  resolverAlerta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GestionarAlertaDto,
  ) {
    return this.asistenciaService.resolverAlerta(id, dto);
  }

  @Patch('umbral/:tallerId')
  actualizarUmbral(
    @Param('tallerId', ParseIntPipe) tallerId: number,
    @Body() dto: ActualizarUmbralDto,
  ) {
    return this.asistenciaService.actualizarUmbral(tallerId, dto.umbralAusencias);
  }

  @Get('alertas')
  getAlertasGlobales() {
    return this.asistenciaService.getAlertasGlobales();
  }
}
