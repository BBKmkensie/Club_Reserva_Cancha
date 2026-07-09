import { Repository } from 'typeorm';
import { Taller } from '../entities/taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { Reserva } from '../entities/reserva.entity';
import { PeriodoAcademico } from '../entities/periodo-academico.entity';
import { FranjaCanchaService } from './franja-cancha.service';
export interface SeedReservasDeportesResult {
    periodo: {
        inicio: string;
        fin: string;
        nombre: string;
    };
    talleres: Array<{
        tipo: string;
        diaSemana: number;
        horario: string;
        reservasCreadas: number;
        reservasOmitidas: number;
    }>;
    totalCreadas: number;
    totalOmitidas: number;
}
export declare class ReservaCanchaSeedService {
    private tallerRepo;
    private profesorRepo;
    private reservaRepo;
    private periodoRepo;
    private franjaCanchaService;
    private readonly logger;
    constructor(tallerRepo: Repository<Taller>, profesorRepo: Repository<Profesor>, reservaRepo: Repository<Reserva>, periodoRepo: Repository<PeriodoAcademico>, franjaCanchaService: FranjaCanchaService);
    seedReservasDeportesSemestre(espacio?: string): Promise<SeedReservasDeportesResult>;
    private resolverPeriodo;
    private iterarFechas;
    private slotsDesdeBloque;
    private aliasDe;
}
