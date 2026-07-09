import { PeriodoService } from './periodo.service';
import { PeriodoAcademicoDto } from '../dto/periodo-academico.dto';
export declare class PeriodoController {
    private readonly periodoService;
    constructor(periodoService: PeriodoService);
    getActivo(): Promise<import("../entities/periodo-academico.entity").PeriodoAcademico | null>;
    findAll(): Promise<import("../entities/periodo-academico.entity").PeriodoAcademico[]>;
    configurar(dto: PeriodoAcademicoDto): Promise<import("../entities/periodo-academico.entity").PeriodoAcademico>;
}
