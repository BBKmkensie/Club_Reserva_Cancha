import { TallerService } from './taller.service';
import { CreateTallerDto } from '../dto/create-taller.dto';
import { AsignarDocenteDto } from '../dto/asignar-docente.dto';
import { ResponderAsignacionDto } from '../dto/responder-asignacion.dto';
import { DefinirHorarioDto } from '../dto/definir-horario.dto';
import { DefinirHorariosTallerDto } from '../dto/definir-horarios-taller.dto';
import { PublicarActividadDto } from '../dto/publicar-actividad.dto';
import { ActualizarPresentacionTallerDto } from '../dto/actualizar-presentacion-taller.dto';
export declare class TallerController {
    private readonly tallerService;
    constructor(tallerService: TallerService);
    findCatalogo(): Promise<import("../entities/taller.entity").Taller[]>;
    getAsignacionesPendientes(profesorId: number): Promise<import("../entities/asignacion-docente.entity").AsignacionDocente[]>;
    getComparacionSemestre(periodoId?: string, profesorId?: string): Promise<{
        periodo: {
            id: number;
            nombre: string;
            fechaApertura: string;
            fechaCierre: string;
            activo: boolean;
        } | null;
        periodoAnterior: {
            id: number;
            nombre: string;
            fechaApertura: string;
            fechaCierre: string;
        } | null;
        resumen: {
            totalTalleres: number;
            totalInscripciones: number;
            totalAceptados: number;
            totalPendientes: number;
            tallerMasOcupado: string;
            promedioOcupacion: number;
        };
        ranking: {
            posicion: number;
            ocupacionPct: number;
            demandaPct: number;
            tallerId: number;
            tipo: string;
            capacidad: number;
            estado: string;
            horario: {
                diaSemana: number | null;
                horaInicio: string | null;
                horaFin: string | null;
            };
            total: number;
            pendientes: number;
            aceptados: number;
            rechazados: number;
        }[];
        comparacionPorTipo: {
            tipo: string;
            periodoActual: number;
            periodoAnterior: number;
            variacion: number;
            variacionPct: number;
        }[];
        sugerencias: {
            tipo: string;
            prioridad: "alta" | "media" | "baja";
            mensaje: string;
            tallerId?: number;
            tallerTipo?: string;
        }[];
        miTaller: {
            posicion: number;
            ocupacionPct: number;
            demandaPct: number;
            tallerId: number;
            tipo: string;
            capacidad: number;
            estado: string;
            horario: {
                diaSemana: number | null;
                horaInicio: string | null;
                horaFin: string | null;
            };
            total: number;
            pendientes: number;
            aceptados: number;
            rechazados: number;
        } | null;
        periodosDisponibles: {
            id: number;
            nombre: string;
            fechaApertura: string;
            fechaCierre: string;
            activo: boolean;
        }[];
    }>;
    create(createTallerDto: CreateTallerDto): Promise<import("../entities/taller.entity").Taller>;
    findAll(): Promise<import("../entities/taller.entity").Taller[]>;
    asignarDocente(id: number, dto: AsignarDocenteDto): Promise<import("../entities/asignacion-docente.entity").AsignacionDocente>;
    responderAsignacion(id: number, profesorId: number, dto: ResponderAsignacionDto): Promise<import("../entities/asignacion-docente.entity").AsignacionDocente>;
    definirHorario(id: number, dto: DefinirHorarioDto | DefinirHorariosTallerDto): Promise<import("../entities/taller.entity").Taller>;
    getHorarios(id: number): Promise<import("../entities/taller-horario.entity").TallerHorario[]>;
    publicar(id: number, dto: PublicarActividadDto): Promise<import("../entities/taller.entity").Taller>;
    actualizarPresentacion(id: number, dto: ActualizarPresentacionTallerDto, esDirectiva?: string, profesorId?: string): Promise<{
        taller: import("../entities/taller.entity").Taller;
        profesor: import("../entities/profesor.entity").Profesor | null;
    }>;
    cerrarPeriodo(id: number): Promise<import("../entities/taller.entity").Taller>;
    getReporte(id: number): Promise<{
        actividad: {
            id: number;
            tipo: string;
            estado: import("../entities/taller.entity").EstadoTaller;
            capacidad: number;
            horario: {
                diaSemana: number | null;
                horaInicio: string | null;
                horaFin: string | null;
            };
            publicadoAt: Date | null;
            cerradoAt: Date | null;
        };
        docente: {
            id: number;
            nombre: string;
        } | null;
        periodoAcademico: {
            nombre: string;
            fechaApertura: string;
            fechaCierre: string;
        } | null;
        inscripciones: {
            total: number;
            pendientes: number;
            aceptados: number;
            rechazados: number;
        };
        asistencia: {
            sesionesRealizadas: number;
            registrosPresentes: number;
            registrosAusentes: number;
            registrosTardes: number;
            umbralAusencias: number;
        };
        utilizacionEspacios: {
            totalReservas: number;
            horasReservadas: number;
            porEspacio: {
                espacio: string;
                cantidad: number;
            }[];
        };
        alumnos: {
            presentes?: number | undefined;
            ausentes?: number | undefined;
            tardes?: number | undefined;
            totalSesiones?: number | undefined;
            porcentajeAsistencia?: number | undefined;
            alertaAusencia?: boolean | undefined;
            nombre: string;
            rut: string;
            estado: import("../entities/inscripcion-taller.entity").EstadoInscripcionTaller;
        }[];
    }>;
    findOne(id: number): Promise<import("../entities/taller.entity").Taller>;
    update(id: number, updateTallerDto: Partial<CreateTallerDto>): Promise<import("../entities/taller.entity").Taller>;
    remove(id: number): Promise<void>;
}
