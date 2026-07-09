import { FichaAlumnoService } from './ficha-alumno.service';
import { ActualizarFichaAlumnoDto } from '../dto/ficha-alumno.dto';
export declare class FichaAlumnoController {
    private readonly fichaService;
    constructor(fichaService: FichaAlumnoService);
    listarPorTaller(tallerId: number, soloInscritos?: string, esCoordinacion?: string, profesorId?: string): Promise<import("./ficha-alumno.service").FichaAlumnoListItem[]>;
    obtener(alumnoId: number, tallerId: number): Promise<import("./ficha-alumno.service").FichaAlumnoListItem>;
    guardar(alumnoId: number, tallerId: number, dto: ActualizarFichaAlumnoDto): Promise<import("../entities/ficha-alumno-taller.entity").FichaAlumnoTaller>;
}
