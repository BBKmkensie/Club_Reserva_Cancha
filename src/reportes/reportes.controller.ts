/**
 * Controlador HTTP de reportes consolidados.
 * Expone listados de personas e inscripciones para coordinación y administración.
 */
import { Controller, Get } from '@nestjs/common';
import { ReportesService } from './reportes.service';

/** Endpoints de reportes para directiva y administración. */
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * Consolida listas de alumnos, apoderados, profesores, directiva y admins
   * con su estado de inscripción en talleres.
   */
  @Get('personas-inscripciones')
  getPersonasInscripciones() {
    return this.reportesService.getPersonasInscripciones();
  }
}
