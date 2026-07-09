import { Repository } from 'typeorm';
import { FranjaCancha } from '../entities/franja-cancha.entity';
import { ActualizarFranjasCanchaDto } from '../dto/actualizar-franjas-cancha.dto';
export declare class FranjaCanchaService {
    private repo;
    constructor(repo: Repository<FranjaCancha>);
    findAll(espacio?: string): Promise<FranjaCancha[]>;
    findActivasPorDia(diaSemana: number, espacio?: string): Promise<FranjaCancha[]>;
    private buscarFranja;
    actualizar(dto: ActualizarFranjasCanchaDto): Promise<FranjaCancha[]>;
    private ocultarFranjasCubiertas;
    private necesitaMigracionMediaHora;
    private migrarFranjasMediaHora;
    private crearFranjasBase30Min;
    asegurarFranjasBase(espacio?: string): Promise<void>;
}
