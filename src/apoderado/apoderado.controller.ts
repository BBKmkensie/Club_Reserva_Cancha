/**
 * Controlador REST del portal de apoderados.
 * Requiere JWT; expone resumen y propuesta de inscripción a talleres.
 */
import { Controller, Get, Post, Req, UseGuards, ParseIntPipe, Param, Body } from '@nestjs/common';
import { ApoderadoService } from './apoderado.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
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
    return this.inscripcionTallerService.proponerActividadLibre(alumnoId, body);
  }
}
