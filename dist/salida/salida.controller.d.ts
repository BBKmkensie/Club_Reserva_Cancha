import { SalidaService } from './salida.service';
import { CreateSalidaDto } from '../dto/create-salida.dto';
import { AsignarSalidaDto } from '../dto/asignar-salida.dto';
import { ProponerSalidaDto } from '../dto/proponer-salida.dto';
import { ResponderSalidaDto } from '../dto/responder-salida.dto';
import { AbrirSalidaDto } from '../dto/abrir-salida.dto';
import { CerrarSalidaDto } from '../dto/cerrar-salida.dto';
export declare class SalidaController {
    private readonly salidaService;
    constructor(salidaService: SalidaService);
    asignarDirectiva(dto: AsignarSalidaDto): Promise<import("../entities/salida.entity").Salida>;
    proponerProfesor(dto: ProponerSalidaDto): Promise<import("../entities/salida.entity").Salida>;
    findPublicadas(tallerId?: string, alumnoId?: string): Promise<import("../entities/salida.entity").Salida[]>;
    findPendientesProfesor(profesorId: number): Promise<import("../entities/salida.entity").Salida[]>;
    findPendientesDirectiva(): Promise<import("../entities/salida.entity").Salida[]>;
    findByProfesor(profesorId: number): Promise<import("../entities/salida.entity").Salida[]>;
    create(createSalidaDto: CreateSalidaDto): Promise<import("../entities/salida.entity").Salida>;
    findAll(tallerId?: string): Promise<import("../entities/salida.entity").Salida[]>;
    findOne(id: number): Promise<import("../entities/salida.entity").Salida>;
    responder(id: number, dto: ResponderSalidaDto, actor: 'profesor' | 'directiva', actorId?: string): Promise<import("../entities/salida.entity").Salida>;
    abrir(id: number, profesorId: number, dto: AbrirSalidaDto): Promise<import("../entities/salida.entity").Salida>;
    cerrar(id: number, profesorId: number, dto: CerrarSalidaDto): Promise<import("../entities/salida.entity").Salida>;
    update(id: number, updateSalidaDto: Partial<CreateSalidaDto>): Promise<import("../entities/salida.entity").Salida>;
    remove(id: number): Promise<void>;
}
