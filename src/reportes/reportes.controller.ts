import { Controller, Get } from '@nestjs/common';
import { ReportesService } from './reportes.service';

/**
 * Reportes consolidados para coordinación y administración.
 */
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /** Listas de alumnos, apoderados, profesores, directiva y admins. */
  @Get('personas-inscripciones')
  getPersonasInscripciones() {
    return this.reportesService.getPersonasInscripciones();
  }
}
