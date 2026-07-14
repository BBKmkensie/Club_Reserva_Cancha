/**
 * =============================================================================
 * inscripcion-salida/inscripcion-salida.controller.ts — ENDPOINTS
 * =============================================================================
 * Prefijo: /inscripcion-salida
 *
 *   POST   /inscripcion-salida                      → inscribir alumno
 *   GET    /inscripcion-salida/por-salida/:salidaId → lista de inscritos
 *   GET    /inscripcion-salida/por-alumno/:alumnoId → salidas del alumno
 *   DELETE /inscripcion-salida?alumnoId=&salidaId=  → cancelar inscripción
 * =============================================================================
 */
// Get/Post/Delete = verbos HTTP; Body = JSON; Param = :id; Query = ?clave=;
// ParseIntPipe convierte string de URL/query a number.
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  ParseIntPipe,
  Query,
  Param,
} from '@nestjs/common';
import { InscripcionSalidaService } from './inscripcion-salida.service';
import { CreateInscripcionSalidaDto } from '../dto/create-inscripcion-salida.dto';

/** @Controller('inscripcion-salida') → rutas bajo /inscripcion-salida */
@Controller('inscripcion-salida')
export class InscripcionSalidaController {
  constructor(private readonly inscripcionSalidaService: InscripcionSalidaService) {}

  /**
   * POST /inscripcion-salida
   * @Body() { alumnoId, salidaId } — el service valida taller/estado antes de save().
   */
  @Post()
  inscribir(@Body() dto: CreateInscripcionSalidaDto) {
    return this.inscripcionSalidaService.inscribir(dto);
  }

  /**
   * GET /inscripcion-salida/por-salida/:salidaId
   * @Param + ParseIntPipe → lista de alumnos inscritos en esa salida.
   */
  @Get('por-salida/:salidaId')
  findBySalida(@Param('salidaId', ParseIntPipe) salidaId: number) {
    return this.inscripcionSalidaService.findBySalida(salidaId);
  }

  /**
   * GET /inscripcion-salida/por-alumno/:alumnoId
   * Salidas en las que el alumno ya está inscrito.
   */
  @Get('por-alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.inscripcionSalidaService.findByAlumno(alumnoId);
  }

  /**
   * DELETE /inscripcion-salida?alumnoId=&salidaId=
   * Usa @Query (no path) porque la clave es compuesta alumno+salida.
   */
  @Delete()
  remove(
    @Query('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('salidaId', ParseIntPipe) salidaId: number,
  ) {
    return this.inscripcionSalidaService.remove(alumnoId, salidaId);
  }
}
