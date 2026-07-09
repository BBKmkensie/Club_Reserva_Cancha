import { InscripcionTallerService } from './inscripcion-taller.service';
import { CreateInscripcionTallerDto } from '../dto/create-inscripcion-taller.dto';
import { ResponderInscripcionTallerDto } from '../dto/responder-inscripcion-taller.dto';
import { ActualizarFichaAlumnoDto } from '../dto/ficha-alumno.dto';
import { ProponerInscripcionDirectivaDto } from '../dto/proponer-inscripcion-directiva.dto';
import { ResponderPropuestaInscripcionDto } from '../dto/responder-propuesta-inscripcion.dto';
import { RetirarInscripcionTallerDto } from '../dto/retirar-inscripcion-taller.dto';
export declare class InscripcionTallerController {
    private readonly inscripcionTallerService;
    constructor(inscripcionTallerService: InscripcionTallerService);
    solicitar(dto: CreateInscripcionTallerDto): Promise<import("../entities/inscripcion-taller.entity").InscripcionTaller>;
    validar(alumnoId: number, tallerId: number, notificar?: string): Promise<import("./inscripcion-taller.service").ValidacionInscripcion>;
    resumen(tallerId: number): Promise<{
        taller: {
            id: number;
            tipo: string;
            descripcion: string;
            capacidad: number;
            diaSemana: number | null;
            horaInicio: string | null;
            horaFin: string | null;
        };
        resumen: {
            total: number;
            pendientes: number;
            aceptados: number;
            rechazados: number;
            cuposOcupados: number;
            cuposDisponibles: number;
        };
        inscripciones: import("../entities/inscripcion-taller.entity").InscripcionTaller[];
    }>;
    findByTaller(tallerId: number): Promise<import("../entities/inscripcion-taller.entity").InscripcionTaller[]>;
    findByAlumno(alumnoId: number): Promise<import("../entities/inscripcion-taller.entity").InscripcionTaller[]>;
    responder(id: number, dto: ResponderInscripcionTallerDto): Promise<import("../entities/inscripcion-taller.entity").InscripcionTaller>;
    retirar(id: number, dto: RetirarInscripcionTallerDto): Promise<{
        ok: true;
    }>;
    actualizarFicha(id: number, dto: ActualizarFichaAlumnoDto): Promise<import("../entities/inscripcion-taller.entity").InscripcionTaller>;
    proponerDirectiva(dto: ProponerInscripcionDirectivaDto): Promise<import("../entities/propuesta-inscripcion-taller.entity").PropuestaInscripcionTaller>;
    getPropuestasPendientes(): Promise<{
        id: number;
        alumnoId: number;
        alumnoNombre: string;
        alumnoRut: string;
        tallerId: number | null;
        tallerNombre: string;
        esActividadLibre: boolean;
        actividadDescripcion: string | null;
        apoderadoNombre: string | null;
        apoderadoEmail: string | null;
        horarioPropuesto: string | null;
        mensajeApoderado: string | null;
        tallerHorarioId: number | null;
        horariosDisponibles: {
            id: number | null;
            etiqueta: string;
        }[];
        createdAt: Date;
    }[]>;
    responderPropuesta(id: number, dto: ResponderPropuestaInscripcionDto): Promise<import("../entities/propuesta-inscripcion-taller.entity").PropuestaInscripcionTaller>;
}
