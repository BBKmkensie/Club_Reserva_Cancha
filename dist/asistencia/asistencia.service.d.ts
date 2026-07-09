import { Repository } from 'typeorm';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { RegistroAsistencia } from '../entities/registro-asistencia.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Taller } from '../entities/taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
import { AlertaAusencia } from '../entities/alerta-ausencia.entity';
import { AbrirSesionDto } from '../dto/abrir-sesion.dto';
import { ActualizarAsistenciaDto } from '../dto/actualizar-asistencia.dto';
import { CerrarSesionDto } from '../dto/cerrar-sesion.dto';
import { GestionarAlertaDto } from '../dto/gestionar-alerta.dto';
import { NotificacionService } from '../notificacion/notificacion.service';
import { MailService } from '../mail/mail.service';
export declare class AsistenciaService {
    private sesionRepo;
    private registroRepo;
    private inscripcionRepo;
    private tallerRepo;
    private alumnoRepo;
    private profesorRepo;
    private alertaRepo;
    private notificacionService;
    private mailService;
    constructor(sesionRepo: Repository<SesionAsistencia>, registroRepo: Repository<RegistroAsistencia>, inscripcionRepo: Repository<InscripcionTaller>, tallerRepo: Repository<Taller>, alumnoRepo: Repository<Alumno>, profesorRepo: Repository<Profesor>, alertaRepo: Repository<AlertaAusencia>, notificacionService: NotificacionService, mailService: MailService);
    abrirSesion(dto: AbrirSesionDto): Promise<SesionAsistencia>;
    obtenerSesion(id: number): Promise<SesionAsistencia>;
    sesionActiva(tallerId: number): Promise<SesionAsistencia | null>;
    historialSesiones(tallerId: number): Promise<SesionAsistencia[]>;
    actualizarAsistencia(sesionId: number, dto: ActualizarAsistenciaDto): Promise<SesionAsistencia>;
    cerrarSesion(sesionId: number, dto: CerrarSesionDto): Promise<SesionAsistencia>;
    private notificarApoderadosSesionCerrada;
    private evaluarAusenciasRecurrentes;
    getAlertasGestion(tallerId?: number): Promise<{
        id: number;
        alumnoId: number;
        nombre: string;
        rut: string;
        tallerId: number;
        taller: string;
        cantidadAusencias: number;
        estado: import("../entities/alerta-ausencia.entity").EstadoAlertaAusencia;
        notas: string | null;
        createdAt: Date;
        apoderado: {
            nombre: string | null;
            telefono: string | null;
            email: string | null;
        };
    }[]>;
    contactarApoderado(id: number, dto: GestionarAlertaDto): Promise<AlertaAusencia>;
    resolverAlerta(id: number, dto: GestionarAlertaDto): Promise<AlertaAusencia>;
    actualizarUmbral(tallerId: number, umbralAusencias: number): Promise<Taller>;
    getReporte(tallerId: number): Promise<{
        taller: {
            id: number;
            tipo: string;
            capacidad: number;
            umbralAusencias: number;
        };
        resumen: {
            totalSesiones: number;
            totalAlumnos: number;
            alertasAusencia: number;
            alertasPendientes: number;
            umbralAusencias: number;
        };
        estadisticasAlumnos: {
            alumnoId: number;
            nombre: string;
            rut: string;
            apoderadoNombre: string | null;
            apoderadoTelefono: string | null;
            apoderadoEmail: string | null;
            presentes: number;
            ausentes: number;
            tardes: number;
            totalSesiones: number;
            porcentajeAsistencia: number;
            alertaAusencia: boolean;
        }[];
        alertas: {
            alumnoId: number;
            nombre: string;
            rut: string;
            apoderadoNombre: string | null;
            apoderadoTelefono: string | null;
            apoderadoEmail: string | null;
            presentes: number;
            ausentes: number;
            tardes: number;
            totalSesiones: number;
            porcentajeAsistencia: number;
            alertaAusencia: boolean;
        }[];
        alertasGestion: {
            id: number;
            alumnoId: number;
            nombre: string;
            rut: string;
            tallerId: number;
            taller: string;
            cantidadAusencias: number;
            estado: import("../entities/alerta-ausencia.entity").EstadoAlertaAusencia;
            notas: string | null;
            createdAt: Date;
            apoderado: {
                nombre: string | null;
                telefono: string | null;
                email: string | null;
            };
        }[];
        sesiones: {
            id: number;
            fecha: string;
            profesor: string;
            presentes: number;
            ausentes: number;
            tardes: number;
        }[];
    }>;
    getAlertasGlobales(): Promise<{
        id: number;
        alumnoId: number;
        nombre: string;
        rut: string;
        tallerId: number;
        taller: string;
        cantidadAusencias: number;
        estado: import("../entities/alerta-ausencia.entity").EstadoAlertaAusencia;
        notas: string | null;
        createdAt: Date;
        apoderado: {
            nombre: string | null;
            telefono: string | null;
            email: string | null;
        };
    }[]>;
}
