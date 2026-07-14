/**
 * =============================================================================
 * salida/salida.controller.ts — ENDPOINTS HTTP DE SALIDAS
 * =============================================================================
 * Prefijo: /salida
 *
 * Flujo de negocio expuesto:
 *   POST   /salida/asignar              → directiva asigna a un profesor
 *   POST   /salida/proponer             → profesor propone a directiva
 *   GET    /salida/publicadas           → visibles para estudiantes
 *   GET    /salida/pendientes/...       → bandejas de aprobación
 *   PATCH  /salida/:id/responder        → aceptar/rechazar
 *   PATCH  /salida/:id/abrir | /cerrar  → día del evento
 *   CRUD clásico: POST/GET/PATCH/DELETE /salida
 *
 * Orden de rutas: las estáticas (publicadas, pendientes, asignar) van ANTES
 * de :id para que Nest no interprete "publicadas" como un id numérico.
 * =============================================================================
 */
// Get/Post/Patch/Delete = verbos HTTP; Body = JSON; Param = :id; Query = ?clave=;
// ParseIntPipe convierte string de URL/query a number.
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SalidaService } from './salida.service';
import { CreateSalidaDto } from '../dto/create-salida.dto';
import { AsignarSalidaDto } from '../dto/asignar-salida.dto';
import { ProponerSalidaDto } from '../dto/proponer-salida.dto';
import { ResponderSalidaDto } from '../dto/responder-salida.dto';
import { AbrirSalidaDto } from '../dto/abrir-salida.dto';
import { CerrarSalidaDto } from '../dto/cerrar-salida.dto';

/** @Controller('salida') → todas las rutas empiezan con /salida */
@Controller('salida')
export class SalidaController {
  constructor(private readonly salidaService: SalidaService) {}

  /**
   * POST /salida/asignar — @Body() AsignarSalidaDto.
   * Directiva crea salida en estado PENDIENTE_PROFESOR.
   */
  @Post('asignar')
  asignarDirectiva(@Body() dto: AsignarSalidaDto) {
    return this.salidaService.asignarDirectiva(dto);
  }

  /**
   * POST /salida/proponer — @Body() ProponerSalidaDto.
   * Profesor crea salida en estado PENDIENTE_DIRECTIVA.
   */
  @Post('proponer')
  proponerProfesor(@Body() dto: ProponerSalidaDto) {
    return this.salidaService.proponerProfesor(dto);
  }

  /**
   * GET /salida/publicadas?tallerId=&alumnoId=
   * @Query opcionales. Si viene alumnoId → solo talleres donde está inscrito (ACEPTADO).
   */
  @Get('publicadas')
  findPublicadas(
    @Query('tallerId') tallerId?: string,
    @Query('alumnoId') alumnoId?: string,
  ) {
    if (alumnoId) {
      return this.salidaService.findPublicadasParaAlumno(parseInt(alumnoId, 10));
    }
    return this.salidaService.findPublicadas(
      tallerId ? parseInt(tallerId, 10) : undefined,
    );
  }

  /**
   * GET /salida/pendientes/profesor/:profesorId
   * @Param + ParseIntPipe → bandeja del profesor.
   */
  @Get('pendientes/profesor/:profesorId')
  findPendientesProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.salidaService.findPendientesProfesor(profesorId);
  }

  /** GET /salida/pendientes/directiva — bandeja de la directiva. */
  @Get('pendientes/directiva')
  findPendientesDirectiva() {
    return this.salidaService.findPendientesDirectiva();
  }

  /** GET /salida/por-profesor/:profesorId — historial del profesor. */
  @Get('por-profesor/:profesorId')
  findByProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.salidaService.findByProfesor(profesorId);
  }

  /** POST /salida — creación directa ya PUBLICADA (atajo/admin). */
  @Post()
  create(@Body() createSalidaDto: CreateSalidaDto) {
    return this.salidaService.create(createSalidaDto);
  }

  /**
   * GET /salida?tallerId=&alumnoId=
   * Listado completo, por taller o filtrado para alumno.
   */
  @Get()
  findAll(
    @Query('tallerId') tallerId?: string,
    @Query('alumnoId') alumnoId?: string,
  ) {
    if (alumnoId) {
      return this.salidaService.findPublicadasParaAlumno(parseInt(alumnoId, 10));
    }
    if (tallerId) {
      return this.salidaService.findByTaller(parseInt(tallerId, 10));
    }
    return this.salidaService.findAll();
  }

  /** GET /salida/:id — detalle. Va después de rutas estáticas. */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salidaService.findOne(id);
  }

  /**
   * PATCH /salida/:id/responder?actor=profesor|directiva&actorId=
   * @Patch = actualización parcial. Body: { acepta: boolean, motivo?: string }
   */
  @Patch(':id/responder')
  responder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderSalidaDto,
    @Query('actor') actor: 'profesor' | 'directiva',
    @Query('actorId') actorId?: string,
  ) {
    return this.salidaService.responder(
      id,
      dto,
      actor,
      actorId ? parseInt(actorId, 10) : undefined,
    );
  }

  /** PATCH /salida/:id/abrir?profesorId= — pasa a EN_CURSO. */
  @Patch(':id/abrir')
  abrir(
    @Param('id', ParseIntPipe) id: number,
    @Query('profesorId', ParseIntPipe) profesorId: number,
    @Body() dto: AbrirSalidaDto,
  ) {
    return this.salidaService.abrir(id, profesorId, dto);
  }

  /** PATCH /salida/:id/cerrar?profesorId= — pasa a CERRADA con resultado. */
  @Patch(':id/cerrar')
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Query('profesorId', ParseIntPipe) profesorId: number,
    @Body() dto: CerrarSalidaDto,
  ) {
    return this.salidaService.cerrar(id, profesorId, dto);
  }

  /** PATCH /salida/:id — edición de campos básicos (destino, fecha, etc.). */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalidaDto: Partial<CreateSalidaDto>,
  ) {
    return this.salidaService.update(id, updateSalidaDto);
  }

  /** DELETE /salida/:id */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salidaService.remove(id);
  }
}
