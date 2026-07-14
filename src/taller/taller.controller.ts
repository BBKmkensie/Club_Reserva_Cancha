/**
 * =============================================================================
 * taller/taller.controller.ts — RUTAS HTTP DE TALLERES
 * =============================================================================
 * Prefijo: /taller
 *
 * IMPORTANTE sobre el orden de rutas en Nest:
 * Las rutas ESTÁTICAS (catalogo, asignaciones/pendientes, estadisticas/...)
 * deben ir ANTES de las rutas con :id, si no Nest interpreta "catalogo" como id.
 *
 * Mapa de endpoints:
 *   GET    /taller/catalogo                      → talleres PUBLICADOS con inscripción abierta
 *   GET    /taller/asignaciones/pendientes?profesorId=
 *   GET    /taller/estadisticas/semestre?...
 *   POST   /taller                               → crear (BORRADOR)
 *   GET    /taller                               → listar todos
 *   POST   /taller/:id/asignar-docente           → directiva propone docente
 *   PATCH  /taller/asignacion/:id/responder      → docente acepta/rechaza
 *   PATCH  /taller/:id/horario                   → definir horarios
 *   GET    /taller/:id/horarios
 *   PATCH  /taller/:id/publicar                  → pasar a PUBLICADO
 *   PATCH  /taller/:id/presentacion              → descripción / foto
 *   PATCH  /taller/:id/cerrar                    → CERRADO
 *   GET    /taller/:id/reporte
 *   GET    /taller/:id
 *   PATCH  /taller/:id
 *   DELETE /taller/:id
 * =============================================================================
 */
// Controller = marca la clase como rutas HTTP; Get/Post/Patch/Delete = verbo HTTP;
// Body = JSON del body; Param = segmento :id de la URL; Query = ?clave=valor;
// ParseIntPipe = convierte string de URL/query a number (o 400 si no es número).
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
// TallerService = toda la lógica de negocio (el controller solo recibe HTTP y delega).
import { TallerService } from './taller.service';
import { CreateTallerDto } from '../dto/create-taller.dto';
import { AsignarDocenteDto } from '../dto/asignar-docente.dto';
import { ResponderAsignacionDto } from '../dto/responder-asignacion.dto';
import { DefinirHorarioDto } from '../dto/definir-horario.dto';
import { DefinirHorariosTallerDto } from '../dto/definir-horarios-taller.dto';
import { PublicarActividadDto } from '../dto/publicar-actividad.dto';
import { ActualizarPresentacionTallerDto } from '../dto/actualizar-presentacion-taller.dto';

/** @Controller('taller') → todas las rutas de esta clase empiezan con /taller */
@Controller('taller')
export class TallerController {
  /** Nest inyecta TallerService (está en providers de TallerModule). */
  constructor(private readonly tallerService: TallerService) {}

  /**
   * GET /taller/catalogo
   * @Get('catalogo') = ruta estática (debe ir ANTES de :id).
   * Catálogo público: solo PUBLICADOS con ventana de inscripción vigente.
   */
  @Get('catalogo')
  findCatalogo() {
    return this.tallerService.findCatalogo();
  }

  /**
   * GET /taller/asignaciones/pendientes?profesorId=
   * @Query + ParseIntPipe → lee y convierte el query param.
   */
  @Get('asignaciones/pendientes')
  getAsignacionesPendientes(
    @Query('profesorId', ParseIntPipe) profesorId: number,
  ) {
    return this.tallerService.getAsignacionesPendientes(profesorId);
  }

  /**
   * GET /taller/estadisticas/semestre?periodoId=&profesorId=
   * Query opcionales llegan como string; aquí los parseamos a number.
   */
  @Get('estadisticas/semestre')
  getComparacionSemestre(
    @Query('periodoId') periodoId?: string,
    @Query('profesorId') profesorId?: string,
  ) {
    const periodo = periodoId ? parseInt(periodoId, 10) : undefined;
    const profesor = profesorId ? parseInt(profesorId, 10) : undefined;
    return this.tallerService.getComparacionSemestre(periodo, profesor);
  }

  /**
   * POST /taller — crea actividad en estado BORRADOR.
   * @Body() → Nest toma el JSON y lo tipa/valida como CreateTallerDto.
   */
  @Post()
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.tallerService.create(createTallerDto);
  }

  /** GET /taller — lista todos (admin/directiva/gestión). */
  @Get()
  findAll() {
    return this.tallerService.findAll();
  }

  /**
   * POST /taller/:id/asignar-docente
   * @Param('id') = el :id de la URL; @Body() = AsignarDocenteDto.
   * Directiva asigna un docente → taller pasa a ESPERA_DOCENTE.
   */
  @Post(':id/asignar-docente')
  asignarDocente(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarDocenteDto,
  ) {
    return this.tallerService.asignarDocente(id, dto);
  }

  /**
   * PATCH /taller/asignacion/:id/responder?profesorId=
   * @Patch = actualización parcial. Docente acepta/rechaza la asignación.
   * profesorId va por query para saber quién responde.
   */
  @Patch('asignacion/:id/responder')
  responderAsignacion(
    @Param('id', ParseIntPipe) id: number,
    @Query('profesorId', ParseIntPipe) profesorId: number,
    @Body() dto: ResponderAsignacionDto,
  ) {
    return this.tallerService.responderAsignacion(id, profesorId, dto);
  }

  /**
   * PATCH /taller/:id/horario
   * Define horario(s). Acepta DTO simple o uno con varios bloques (unión de tipos).
   */
  @Patch(':id/horario')
  definirHorario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DefinirHorarioDto | DefinirHorariosTallerDto,
  ) {
    return this.tallerService.definirHorario(id, dto);
  }

  /** GET /taller/:id/horarios — lista filas de taller_horario. */
  @Get(':id/horarios')
  getHorarios(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.getHorarios(id);
  }

  /**
   * PATCH /taller/:id/publicar
   * Publica en catálogo (estado PUBLICADO) con fechas de inscripción.
   */
  @Patch(':id/publicar')
  publicar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PublicarActividadDto,
  ) {
    return this.tallerService.publicar(id, dto);
  }

  /**
   * PATCH /taller/:id/presentacion?esDirectiva=&profesorId=
   * Actualiza descripción / foto. Query esDirectiva=true → permisos de directiva;
   * si no, debe venir profesorId del docente del taller.
   */
  @Patch(':id/presentacion')
  actualizarPresentacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPresentacionTallerDto,
    @Query('esDirectiva') esDirectiva?: string,
    @Query('profesorId') profesorId?: string,
  ) {
    return this.tallerService.actualizarPresentacion(id, dto, {
      esDirectiva: esDirectiva === 'true',
      profesorId: profesorId ? parseInt(profesorId, 10) : undefined,
    });
  }

  /** PATCH /taller/:id/cerrar — cierra el período → estado CERRADO. */
  @Patch(':id/cerrar')
  cerrarPeriodo(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.cerrarPeriodo(id);
  }

  /** GET /taller/:id/reporte — inscritos, asistencia, etc. */
  @Get(':id/reporte')
  getReporte(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.getReporteActividad(id);
  }

  /**
   * GET /taller/:id — detalle con relaciones.
   * Va al final: si estuviera antes, Nest capturaría "catalogo" como :id.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.findOne(id);
  }

  /** PATCH /taller/:id — edición parcial (service bloquea si está CERRADO). */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTallerDto: Partial<CreateTallerDto>,
  ) {
    return this.tallerService.update(id, updateTallerDto);
  }

  /** DELETE /taller/:id — elimina el taller de la BD. */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.remove(id);
  }
}
