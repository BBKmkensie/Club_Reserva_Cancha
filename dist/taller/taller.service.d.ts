import { Repository } from 'typeorm';
import { Taller } from '../entities/taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { AsignacionDocente } from '../entities/asignacion-docente.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { Reserva } from '../entities/reserva.entity';
import { CreateTallerDto } from '../dto/create-taller.dto';
import { AsignarDocenteDto } from '../dto/asignar-docente.dto';
import { ResponderAsignacionDto } from '../dto/responder-asignacion.dto';
import { TallerHorario } from '../entities/taller-horario.entity';
import { DefinirHorarioDto } from '../dto/definir-horario.dto';
import { DefinirHorariosTallerDto } from '../dto/definir-horarios-taller.dto';
import { PublicarActividadDto } from '../dto/publicar-actividad.dto';
import { ActualizarPresentacionTallerDto } from '../dto/actualizar-presentacion-taller.dto';
import { NotificacionService } from '../notificacion/notificacion.service';
import { PeriodoService } from '../periodo/periodo.service';
export declare class TallerService {
    private tallerRepository;
    private profesorRepository;
    private asignacionRepository;
    private inscripcionRepository;
    private sesionAsistenciaRepository;
    private reservaRepository;
    private tallerHorarioRepository;
    private notificacionService;
    private periodoService;
    constructor(tallerRepository: Repository<Taller>, profesorRepository: Repository<Profesor>, asignacionRepository: Repository<AsignacionDocente>, inscripcionRepository: Repository<InscripcionTaller>, sesionAsistenciaRepository: Repository<SesionAsistencia>, reservaRepository: Repository<Reserva>, tallerHorarioRepository: Repository<TallerHorario>, notificacionService: NotificacionService, periodoService: PeriodoService);
    create(createTallerDto: CreateTallerDto): Promise<Taller>;
    findAll(): Promise<Taller[]>;
    findCatalogo(): Promise<Taller[]>;
    findOne(id: number): Promise<Taller>;
    update(id: number, updateTallerDto: Partial<CreateTallerDto>): Promise<Taller>;
    actualizarPresentacion(tallerId: number, dto: ActualizarPresentacionTallerDto, opts: {
        esDirectiva?: boolean;
        profesorId?: number;
    }): Promise<{
        taller: Taller;
        profesor: Profesor | null;
    }>;
    remove(id: number): Promise<void>;
    asignarDocente(tallerId: number, dto: AsignarDocenteDto): Promise<AsignacionDocente>;
    responderAsignacion(asignacionId: number, profesorId: number, dto: ResponderAsignacionDto): Promise<AsignacionDocente>;
    definirHorario(tallerId: number, dto: DefinirHorarioDto | DefinirHorariosTallerDto): Promise<Taller>;
    definirHorarios(tallerId: number, dto: DefinirHorariosTallerDto): Promise<Taller>;
    getHorarios(tallerId: number): Promise<TallerHorario[]>;
    private tieneHorarioDefinido;
    publicar(tallerId: number, dto: PublicarActividadDto): Promise<Taller>;
    cerrarPeriodo(tallerId: number): Promise<Taller>;
    getAsignacionesPendientes(profesorId: number): Promise<AsignacionDocente[]>;
    getReporteActividad(tallerId: number): Promise<{
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
    private minutosDesdeHora;
    private inscripcionesAbiertas;
    private validarDisponibilidadDocente;
    private validarConflictoHorarioDocente;
    private horariosSeSolapan;
    private normalizarHora;
    getComparacionSemestre(periodoId?: number, profesorId?: number): Promise<{
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
    private fechaIso;
    private filtrarInscripcionesPorFechas;
    private agruparAceptadosPorTipo;
    private generarSugerenciasTalleres;
}
