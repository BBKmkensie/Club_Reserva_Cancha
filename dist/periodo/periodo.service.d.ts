import { Repository } from 'typeorm';
import { PeriodoAcademico } from '../entities/periodo-academico.entity';
import { PeriodoAcademicoDto } from '../dto/periodo-academico.dto';
export declare class PeriodoService {
    private repo;
    constructor(repo: Repository<PeriodoAcademico>);
    getActivo(): Promise<PeriodoAcademico | null>;
    findAll(): Promise<PeriodoAcademico[]>;
    configurar(dto: PeriodoAcademicoDto): Promise<PeriodoAcademico>;
    inscripcionesAbiertasEnPeriodo(periodo: PeriodoAcademico | null, hoy: string): boolean;
    mensajePeriodoCerrado(periodo: PeriodoAcademico | null, hoy: string): string | null;
}
