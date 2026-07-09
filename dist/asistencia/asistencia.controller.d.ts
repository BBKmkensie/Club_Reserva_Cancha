import { AsistenciaService } from './asistencia.service';
import { AbrirSesionDto } from '../dto/abrir-sesion.dto';
import { ActualizarAsistenciaDto } from '../dto/actualizar-asistencia.dto';
import { CerrarSesionDto } from '../dto/cerrar-sesion.dto';
import { GestionarAlertaDto } from '../dto/gestionar-alerta.dto';
import { ActualizarUmbralDto } from '../dto/actualizar-umbral.dto';
export declare class AsistenciaController {
    private readonly asistenciaService;
    constructor(asistenciaService: AsistenciaService);
    abrirSesion(dto: AbrirSesionDto): Promise<import("../entities/sesion-asistencia.entity").SesionAsistencia>;
    sesionActiva(tallerId: number): Promise<import("../entities/sesion-asistencia.entity").SesionAsistencia | null>;
    obtenerSesion(id: number): Promise<import("../entities/sesion-asistencia.entity").SesionAsistencia>;
    historial(tallerId: number): Promise<import("../entities/sesion-asistencia.entity").SesionAsistencia[]>;
    actualizarAsistencia(id: number, dto: ActualizarAsistenciaDto): Promise<import("../entities/sesion-asistencia.entity").SesionAsistencia>;
    cerrarSesion(id: number, dto: CerrarSesionDto): Promise<import("../entities/sesion-asistencia.entity").SesionAsistencia>;
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
    getAlertasGestion(tallerId?: string): Promise<{
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
    contactarApoderado(id: number, dto: GestionarAlertaDto): Promise<import("../entities/alerta-ausencia.entity").AlertaAusencia>;
    resolverAlerta(id: number, dto: GestionarAlertaDto): Promise<import("../entities/alerta-ausencia.entity").AlertaAusencia>;
    actualizarUmbral(tallerId: number, dto: ActualizarUmbralDto): Promise<import("../entities/taller.entity").Taller>;
}
