import { InscripcionSalidaService } from './inscripcion-salida.service';
import { CreateInscripcionSalidaDto } from '../dto/create-inscripcion-salida.dto';
export declare class InscripcionSalidaController {
    private readonly inscripcionSalidaService;
    constructor(inscripcionSalidaService: InscripcionSalidaService);
    inscribir(dto: CreateInscripcionSalidaDto): Promise<import("../entities/inscripcion-salida.entity").InscripcionSalida>;
    findBySalida(salidaId: number): Promise<import("../entities/inscripcion-salida.entity").InscripcionSalida[]>;
    findByAlumno(alumnoId: number): Promise<import("../entities/inscripcion-salida.entity").InscripcionSalida[]>;
    remove(alumnoId: number, salidaId: number): Promise<void>;
}
