/**
 * Controlador REST del portal de apoderados.
 * Requiere JWT; expone resumen y propuesta de inscripción a talleres.
 */
import { Controller, Get, Post, Req, UseGuards, ParseIntPipe, Param } from '@nestjs/common';
import { ApoderadoService } from './apoderado.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { InscripcionTallerService } from '../inscripcion-taller/inscripcion-taller.service';

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

  /** POST /apoderado/proponer-inscripcion/:tallerId — Propone inscripción del hijo/a a un taller. */
  @Post('proponer-inscripcion/:tallerId')
  proponerInscripcion(
    @Req() req: { user: JwtPayload },
    @Param('tallerId', ParseIntPipe) tallerId: number,
  ) {
    const alumnoId = this.apoderadoService.assertApoderado(req.user);
    return this.inscripcionTallerService.proponerDirectiva({ alumnoId, tallerId });
  }
}
