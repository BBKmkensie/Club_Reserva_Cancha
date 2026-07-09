import { FranjaCanchaService } from './franja-cancha.service';
import { ActualizarFranjasCanchaDto } from '../dto/actualizar-franjas-cancha.dto';
export declare class FranjaCanchaController {
    private readonly franjaService;
    constructor(franjaService: FranjaCanchaService);
    findAll(espacio?: string): Promise<import("../entities/franja-cancha.entity").FranjaCancha[]>;
    actualizar(dto: ActualizarFranjasCanchaDto): Promise<import("../entities/franja-cancha.entity").FranjaCancha[]>;
}
