/**
 * =============================================================================
 * inscripcion-taller/inscripcion-taller.controller.ts — ENDPOINTS
 * =============================================================================
 * Prefijo: /inscripcion-taller
 *
 * Flujo alumno:
 *   GET  /validar/:alumnoId/:tallerId  → ¿puede? (cupos, horario, período)
 *   POST /                             → solicita (estado PENDIENTE)
 *   PATCH /:id/responder               → profesor acepta/rechaza
 *   PATCH /:id/retirar                 → alumno se retira
 *
 * Flujo propuestas (apoderado → directiva):
 *   POST  /proponer-directiva
 *   GET   /propuestas/pendientes
 *   PATCH /propuestas/:id/responder
 * =============================================================================
 */
// Get/Post/Patch = verbos HTTP; Body = JSON; Param = :id; Query = ?clave=;
// ParseIntPipe convierte string de URL/query a number.
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { InscripcionTallerService } from './inscripcion-taller.service';
import { CreateInscripcionTallerDto } from '../dto/create-inscripcion-taller.dto';
import { ResponderInscripcionTallerDto } from '../dto/responder-inscripcion-taller.dto';
import { ActualizarFichaAlumnoDto } from '../dto/ficha-alumno.dto';
import { ProponerInscripcionDirectivaDto } from '../dto/proponer-inscripcion-directiva.dto';
import { ProponerInscripcionApoderadoDto } from '../dto/proponer-inscripcion-apoderado.dto';
import { ProponerActividadLibreDto } from '../dto/proponer-actividad-libre.dto';
import { ResponderPropuestaInscripcionDto } from '../dto/responder-propuesta-inscripcion.dto';
import { RetirarInscripcionTallerDto } from '../dto/retirar-inscripcion-taller.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';

/** @Controller('inscripcion-taller') → rutas bajo /inscripcion-taller */
@Controller('inscripcion-taller')
export class InscripcionTallerController {
  constructor(private readonly inscripcionTallerService: InscripcionTallerService) {}

  /**
   * POST /inscripcion-taller
   * @Body() CreateInscripcionTallerDto → crea solicitud PENDIENTE.
   */
  @Post()
  solicitar(@Body() dto: CreateInscripcionTallerDto) {
    return this.inscripcionTallerService.solicitar(dto);
  }

  /**
   * GET /inscripcion-taller/validar/:alumnoId/:tallerId?notificar=
   * @Param x2 + @Query opcional. Pre-valida sin crear solicitud.
   */
  @Get('validar/:alumnoId/:tallerId')
  validar(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('tallerId', ParseIntPipe) tallerId: number,
    @Query('notificar') notificar?: string,
  ) {
    return this.inscripcionTallerService.validar(
      alumnoId,
      tallerId,
      notificar === 'true',
    );
  }

  /** GET /inscripcion-taller/resumen/:tallerId — cupos y conteos por estado. */
  @Get('resumen/:tallerId')
  resumen(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.inscripcionTallerService.getResumen(tallerId);
  }

  /** GET /inscripcion-taller/por-taller/:tallerId — listado de inscripciones. */
  @Get('por-taller/:tallerId')
  findByTaller(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.inscripcionTallerService.findByTaller(tallerId);
  }

  /** GET /inscripcion-taller/por-alumno/:alumnoId — talleres del alumno. */
  @Get('por-alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.inscripcionTallerService.findByAlumno(alumnoId);
  }

  /**
   * PATCH /inscripcion-taller/:id/responder
   * @Body() { acepta, motivo? } — profesor acepta (ACEPTADO) o rechaza (RECHAZADO).
   */
  @Patch(':id/responder')
  responder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderInscripcionTallerDto,
  ) {
    return this.inscripcionTallerService.responder(id, dto);
  }

  /**
   * PATCH /inscripcion-taller/:id/retirar
   * Alumno cancela pendiente o se retira si ya estaba aceptado.
   */
  @Patch(':id/retirar')
  retirar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RetirarInscripcionTallerDto,
  ) {
    return this.inscripcionTallerService.retirarse(id, dto.alumnoId);
  }

  /** PATCH /inscripcion-taller/:id/ficha — medidas antropométricas. */
  @Patch(':id/ficha')
  actualizarFicha(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarFichaAlumnoDto,
  ) {
    return this.inscripcionTallerService.actualizarFicha(id, dto);
  }

  /**
   * POST /inscripcion-taller/proponer-directiva
   * Apoderado propone actividad; queda pendiente de revisión de coordinación.
   */
  @Post('proponer-directiva')
  proponerDirectiva(@Body() dto: ProponerInscripcionDirectivaDto) {
    return this.inscripcionTallerService.proponerDirectiva(dto);
  }

  /**
   * POST /inscripcion-taller/proponer-inscripcion/:tallerId
   * El alumno autenticado propone inscripción en un taller del catálogo (llega a directiva).
   */
  @Post('proponer-inscripcion/:tallerId')
  @UseGuards(JwtAuthGuard)
  proponerInscripcionAlumno(
    @Req() req: { user: JwtPayload },
    @Param('tallerId', ParseIntPipe) tallerId: number,
    @Body() body: ProponerInscripcionApoderadoDto,
  ) {
    if (req.user.tipo !== 'alumno') {
      throw new ForbiddenException('Solo alumnos pueden usar este endpoint');
    }
    return this.inscripcionTallerService.proponerDirectiva(
      {
        alumnoId: req.user.sub,
        tallerId,
        tallerHorarioId: body.tallerHorarioId,
        horarioPropuestoTexto: body.horarioPropuestoTexto,
        mensajeApoderado: body.mensajeApoderado,
      },
      'ALUMNO',
    );
  }

  /**
   * POST /inscripcion-taller/proponer-actividad-libre
   * El alumno autenticado propone una actividad fuera del catálogo (llega a directiva).
   */
  @Post('proponer-actividad-libre')
  @UseGuards(JwtAuthGuard)
  proponerActividadLibreAlumno(
    @Req() req: { user: JwtPayload },
    @Body() body: ProponerActividadLibreDto,
  ) {
    if (req.user.tipo !== 'alumno') {
      throw new ForbiddenException('Solo alumnos pueden usar este endpoint');
    }
    return this.inscripcionTallerService.proponerActividadLibre(req.user.sub, body, 'ALUMNO');
  }

  /**
   * GET /inscripcion-taller/mis-propuestas
   * Historial de propuestas del alumno autenticado.
   */
  @Get('mis-propuestas')
  @UseGuards(JwtAuthGuard)
  misPropuestasAlumno(@Req() req: { user: JwtPayload }) {
    if (req.user.tipo !== 'alumno') {
      throw new ForbiddenException('Solo alumnos pueden usar este endpoint');
    }
    return this.inscripcionTallerService.getPropuestasPorAlumno(req.user.sub);
  }

  /** GET /inscripcion-taller/propuestas/pendientes — bandeja de la directiva. */
  @Get('propuestas/pendientes')
  getPropuestasPendientes() {
    return this.inscripcionTallerService.getPropuestasPendientes();
  }

  /**
   * PATCH /inscripcion-taller/propuestas/:id/responder
   * Directiva acepta/rechaza la propuesta.
   */
  @Patch('propuestas/:id/responder')
  responderPropuesta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderPropuestaInscripcionDto,
  ) {
    return this.inscripcionTallerService.responderPropuesta(id, dto);
  }
}
