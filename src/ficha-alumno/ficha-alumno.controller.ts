/**
 * =============================================================================
 * ficha-alumno/ficha-alumno.controller.ts — ENDPOINTS DE FICHAS
 * =============================================================================
 * Prefijo: /ficha-alumno
 *
 *   GET /ficha-alumno/taller/:tallerId  → listado (filtros por rol)
 *   GET /ficha-alumno/:alumnoId/:tallerId → una ficha
 *   PUT /ficha-alumno/:alumnoId/:tallerId → crear/actualizar medidas
 *
 * Query flags en el listado:
 *   soloInscritos=true  → solo ACEPTADOS
 *   esCoordinacion=true → directiva ve todos
 *   profesorId=         → valida que el profe sea del taller
 * =============================================================================
 */
// Put = upsert HTTP; Query = flags ?soloInscritos=&esCoordinacion=&profesorId=
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FichaAlumnoService } from './ficha-alumno.service';
import { ActualizarFichaAlumnoDto } from '../dto/ficha-alumno.dto';

/** Endpoints HTTP para gestionar fichas de alumnos por taller. */
@Controller('ficha-alumno')
export class FichaAlumnoController {
  /** Nest inyecta FichaAlumnoService. */
  constructor(private readonly fichaService: FichaAlumnoService) {}

  /** GET /ficha-alumno/taller/:tallerId — Lista fichas según rol y filtros de query. */
  @Get('taller/:tallerId')
  listarPorTaller(
    @Param('tallerId', ParseIntPipe) tallerId: number,
    @Query('soloInscritos') soloInscritos?: string,
    @Query('esCoordinacion') esCoordinacion?: string,
    @Query('profesorId') profesorId?: string,
  ) {
    // Query strings llegan como string → comparamos con 'true'
    return this.fichaService.listarPorTaller(tallerId, {
      soloInscritos: soloInscritos === 'true',
      esCoordinacion: esCoordinacion === 'true',
      profesorId: profesorId ? parseInt(profesorId, 10) : undefined,
    });
  }

  /**
   * GET /ficha-alumno/alumno/:alumnoId/ultima
   * Última ficha conocida del alumno (cualquier taller) para reutilizar en otro deporte.
   * Debe ir ANTES de :alumnoId/:tallerId.
   */
  @Get('alumno/:alumnoId/ultima')
  obtenerUltima(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.fichaService.obtenerUltimaDelAlumno(alumnoId);
  }

  /** GET /ficha-alumno/:alumnoId/:tallerId */
  @Get(':alumnoId/:tallerId')
  obtener(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('tallerId', ParseIntPipe) tallerId: number,
  ) {
    return this.fichaService.obtener(alumnoId, tallerId);
  }

  /** PUT /ficha-alumno/:alumnoId/:tallerId — Guarda o actualiza la ficha del alumno. */
  @Put(':alumnoId/:tallerId')
  guardar(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('tallerId', ParseIntPipe) tallerId: number,
    @Body() dto: ActualizarFichaAlumnoDto,
  ) {
    return this.fichaService.guardar(alumnoId, tallerId, dto);
  }
}
