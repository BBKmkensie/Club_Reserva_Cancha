/**
 * =============================================================================
 * asistencia/asistencia.controller.ts — ENDPOINTS DE ASISTENCIA
 * =============================================================================
 * Prefijo: /asistencia
 *
 * Flujo típico del profesor:
 *   1. POST  /asistencia/sesion/abrir
 *   2. PATCH /asistencia/sesion/:id/registros  (marcar ausentes/tardes)
 *   3. PATCH /asistencia/sesion/:id/cerrar     (dispara alertas + mails)
 *
 * También: historial, reporte, alertas de ausencias y umbral del taller.
 * =============================================================================
 */
// Decoradores HTTP de Nest + ParseIntPipe (string → number) + Query (?tallerId=)
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
// Lógica de negocio (abrir/cerrar sesión, alertas, reportes)
import { AsistenciaService } from './asistencia.service';
// DTOs: validan el body JSON con class-validator + ValidationPipe global
import { AbrirSesionDto } from '../dto/abrir-sesion.dto';
import { ActualizarAsistenciaDto } from '../dto/actualizar-asistencia.dto';
import { CerrarSesionDto } from '../dto/cerrar-sesion.dto';
import { GestionarAlertaDto } from '../dto/gestionar-alerta.dto';
import { ActualizarUmbralDto } from '../dto/actualizar-umbral.dto';

/** Endpoints HTTP para el flujo de asistencia en talleres. */
@Controller('asistencia')
export class AsistenciaController {
  /** Nest inyecta AsistenciaService (registrado en AsistenciaModule). */
  constructor(private readonly asistenciaService: AsistenciaService) {}

  /** POST /asistencia/sesion/abrir — Inicia una nueva sesión de asistencia. */
  @Post('sesion/abrir')
  abrirSesion(@Body() dto: AbrirSesionDto) {
    return this.asistenciaService.abrirSesion(dto);
  }

  /** GET /asistencia/sesion/activa/:tallerId — Sesión ABIERTA del día para el taller. */
  @Get('sesion/activa/:tallerId')
  sesionActiva(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.asistenciaService.sesionActiva(tallerId);
  }

  /** GET /asistencia/sesion/:id — detalle con registros. */
  @Get('sesion/:id')
  obtenerSesion(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.obtenerSesion(id);
  }

  /** GET /asistencia/sesiones/:tallerId — historial del taller. */
  @Get('sesiones/:tallerId')
  historial(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.asistenciaService.historialSesiones(tallerId);
  }

  /** PATCH /asistencia/sesion/:id/registros — Guarda estados PRESENTE/AUSENTE/TARDE. */
  @Patch('sesion/:id/registros')
  actualizarAsistencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarAsistenciaDto,
  ) {
    return this.asistenciaService.actualizarAsistencia(id, dto);
  }

  /** PATCH /asistencia/sesion/:id/cerrar — Cierra la sesión y dispara notificaciones. */
  @Patch('sesion/:id/cerrar')
  cerrarSesion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CerrarSesionDto,
  ) {
    return this.asistenciaService.cerrarSesion(id, dto);
  }

  /** GET /asistencia/reporte/:tallerId — estadísticas + alertas del taller. */
  @Get('reporte/:tallerId')
  getReporte(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.asistenciaService.getReporte(tallerId);
  }

  /** GET /asistencia/alertas — alertas de todos los talleres. */
  @Get('alertas')
  getAlertasGlobales() {
    return this.asistenciaService.getAlertasGlobales();
  }

  /** GET /asistencia/alertas/gestion?tallerId= — bandeja de gestión (opc. filtrada). */
  @Get('alertas/gestion')
  getAlertasGestion(@Query('tallerId') tallerId?: string) {
    const id = tallerId ? parseInt(tallerId, 10) : undefined;
    return this.asistenciaService.getAlertasGestion(
      id && !Number.isNaN(id) ? id : undefined,
    );
  }

  /** PATCH /asistencia/alertas/:id/contactar — Registra contacto con apoderado. */
  @Patch('alertas/:id/contactar')
  contactarApoderado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GestionarAlertaDto,
  ) {
    return this.asistenciaService.contactarApoderado(id, dto);
  }

  /** PATCH /asistencia/alertas/:id/resolver — cierra la alerta. */
  @Patch('alertas/:id/resolver')
  resolverAlerta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GestionarAlertaDto,
  ) {
    return this.asistenciaService.resolverAlerta(id, dto);
  }

  /**
   * PATCH /asistencia/umbral/:tallerId
   * Body acepta umbralAusencias o umbral (alias del DTO).
   */
  @Patch('umbral/:tallerId')
  actualizarUmbral(
    @Param('tallerId', ParseIntPipe) tallerId: number,
    @Body() dto: ActualizarUmbralDto,
  ) {
    const umbral = dto.umbralAusencias ?? dto.umbral;
    if (umbral == null) {
      throw new BadRequestException('Debe indicar el umbral de ausencias');
    }
    return this.asistenciaService.actualizarUmbral(tallerId, umbral);
  }
}
