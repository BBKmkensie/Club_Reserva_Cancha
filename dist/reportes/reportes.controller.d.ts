import { ReportesService } from './reportes.service';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    getPersonasInscripciones(): Promise<import("./reportes.service").ReportePersonasInscripciones>;
}
