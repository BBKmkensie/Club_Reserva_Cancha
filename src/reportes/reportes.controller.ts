/**
 * =============================================================================
 * reportes/reportes.controller.ts — ENDPOINTS DE REPORTES
 * =============================================================================
 * Prefijo: /reportes
 *
 *   GET /reportes/personas-inscripciones
 *     → JSON con alumnos sin taller, inscritos, apoderados, directiva, admins, profes
 * =============================================================================
 */
// Get = endpoint de solo lectura (JSON, sin PDF)
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
