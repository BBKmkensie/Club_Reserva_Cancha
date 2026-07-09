import { ApoderadoService } from './apoderado.service';
import { JwtPayload } from '../auth/auth.types';
import { InscripcionTallerService } from '../inscripcion-taller/inscripcion-taller.service';
import { ProponerInscripcionApoderadoDto } from '../dto/proponer-inscripcion-apoderado.dto';
import { ProponerActividadLibreDto } from '../dto/proponer-actividad-libre.dto';
export declare class ApoderadoController {
    private readonly apoderadoService;
    private readonly inscripcionTallerService;
    constructor(apoderadoService: ApoderadoService, inscripcionTallerService: InscripcionTallerService);
    getResumen(req: {
        user: JwtPayload;
    }): Promise<{
        apoderado: {
            nombre: string | null;
            rut: string | null;
            email: string | null;
            telefono: string | null;
        };
        hijo: {
            id: number;
            nombre: string;
            rut: string;
        };
        tallerInscrito: {
            id: number;
            nombre: string;
            horario: string | null;
        } | null;
        inscripciones: {
            tallerId: number;
            taller: string;
            estado: import("../entities/inscripcion-taller.entity").EstadoInscripcionTaller;
        }[];
        asistencia: {
            tallerId: number;
            resumen: {
                presentes: number;
                ausentes: number;
                tardes: number;
                totalSesiones: number;
                porcentaje: number;
            };
            registros: {
                fecha: string;
                estado: string;
                observacion: string | null;
                taller: string;
            }[];
        } | null;
    }>;
    proponerInscripcion(req: {
        user: JwtPayload;
    }, tallerId: number, body: ProponerInscripcionApoderadoDto): Promise<import("../entities/propuesta-inscripcion-taller.entity").PropuestaInscripcionTaller>;
    misPropuestas(req: {
        user: JwtPayload;
    }): Promise<{
        id: number;
        tallerId: number | null;
        tallerNombre: string;
        esActividadLibre: boolean;
        actividadDescripcion: string | null;
        estado: import("../entities/propuesta-inscripcion-taller.entity").EstadoPropuestaInscripcion;
        horarioPropuesto: string | null;
        horarioSugerido: string | null;
        motivoRechazo: string | null;
        mensajeApoderado: string | null;
        mensajeDirectiva: string | null;
        createdAt: Date;
        respondedAt: Date | null;
    }[]>;
    proponerActividadLibre(req: {
        user: JwtPayload;
    }, body: ProponerActividadLibreDto): Promise<import("../entities/propuesta-inscripcion-taller.entity").PropuestaInscripcionTaller>;
}
