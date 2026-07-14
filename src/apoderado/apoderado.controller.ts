/**
 * =============================================================================
 * apoderado/apoderado.controller.ts — ENDPOINTS DEL PORTAL (JWT)
 * =============================================================================
 * Prefijo: /apoderado
 * @UseGuards(JwtAuthGuard) en toda la clase → requiere Bearer token.
 *
 * Tras el login, el JWT del apoderado tiene tipo='apoderado' y sub=alumnoId
 * (el hijo asociado). assertApoderado() valida eso y extrae el id.
 *
 * Endpoints:
 *   GET  /apoderado/resumen
 *   POST /apoderado/proponer-inscripcion/:tallerId
 *   GET  /apoderado/mis-propuestas
 *   POST /apoderado/proponer-actividad-libre
 * =============================================================================
 */
// Req = request HTTP (trae req.user del JWT); UseGuards = exige autenticación
import { Controller, Get, Post, Req, UseGuards, ParseIntPipe, Param, Body } from '@nestjs/common';
import { ApoderadoService } from './apoderado.service';
// JwtAuthGuard = valida Bearer token antes de entrar al método
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
// Propuestas de inscripción delegan en InscripcionTallerService
import { InscripcionTallerService } from '../inscripcion-taller/inscripcion-taller.service';
import { ProponerInscripcionApoderadoDto } from '../dto/proponer-inscripcion-apoderado.dto';
import { ProponerActividadLibreDto } from '../dto/proponer-actividad-libre.dto';

/** Endpoints protegidos para apoderados autenticados. */
@Controller('apoderado')
@UseGuards(JwtAuthGuard)
export class ApoderadoController {
  constructor(
    private readonly apoderadoService: ApoderadoService,
    private readonly inscripcionTallerService: InscripcionTallerService,
  ) {}

  /** GET /apoderado/resumen — Panel con datos del hijo/a, taller e inscripciones. */
  @Get('resumen')
  getResumen(@Req() req: { user: JwtPayload }) {
    // req.user lo pone JwtStrategy después de validar el token
    const alumnoId = this.apoderadoService.assertApoderado(req.user);
    return this.apoderadoService.getResumen(alumnoId);
  }

  /** POST /apoderado/proponer-inscripcion/:tallerId — Propone inscripción del hijo/a con horario. */
  @Post('proponer-inscripcion/:tallerId')
  proponerInscripcion(
    @Req() req: { user: JwtPayload },
    @Param('tallerId', ParseIntPipe) tallerId: number,
    @Body() body: ProponerInscripcionApoderadoDto,
  ) {
    const alumnoId = this.apoderadoService.assertApoderado(req.user);
    // Delega en InscripcionTallerService (flujo propuesta → directiva)
    return this.inscripcionTallerService.proponerDirectiva({
      alumnoId,
      tallerId,
      tallerHorarioId: body.tallerHorarioId,
      horarioPropuestoTexto: body.horarioPropuestoTexto,
      mensajeApoderado: body.mensajeApoderado,
    });
  }

  /** GET /apoderado/mis-propuestas — Historial de propuestas enviadas a la directiva. */
  @Get('mis-propuestas')
  misPropuestas(@Req() req: { user: JwtPayload }) {
    const alumnoId = this.apoderadoService.assertApoderado(req.user);
    return this.inscripcionTallerService.getPropuestasPorAlumno(alumnoId);
  }

  /** POST /apoderado/proponer-actividad-libre — Propone actividad nueva fuera del catálogo. */
  @Post('proponer-actividad-libre')
  proponerActividadLibre(
    @Req() req: { user: JwtPayload },
    @Body() body: ProponerActividadLibreDto,
  ) {
    const alumnoId = this.apoderadoService.assertApoderado(req.user);
    return this.inscripcionTallerService.proponerActividadLibre(alumnoId, body, 'APODERADO');
  }
}
