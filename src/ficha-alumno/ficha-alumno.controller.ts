/**
 * Controlador REST de fichas de alumnos.
 * Expone listado por taller, consulta individual y actualización de medidas.
 */
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
  constructor(private readonly fichaService: FichaAlumnoService) {}

  /** GET /ficha-alumno/taller/:tallerId — Lista fichas según rol y filtros de query. */
  @Get('taller/:tallerId')
  listarPorTaller(
    @Param('tallerId', ParseIntPipe) tallerId: number,
    @Query('soloInscritos') soloInscritos?: string,
    @Query('esCoordinacion') esCoordinacion?: string,
    @Query('profesorId') profesorId?: string,
  ) {
    return this.fichaService.listarPorTaller(tallerId, {
      soloInscritos: soloInscritos === 'true',
      esCoordinacion: esCoordinacion === 'true',
      profesorId: profesorId ? parseInt(profesorId, 10) : undefined,
    });
  }

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
