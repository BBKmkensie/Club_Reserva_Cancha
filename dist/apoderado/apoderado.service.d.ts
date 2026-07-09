import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { JwtPayload } from '../auth/auth.types';
export declare class ApoderadoService {
    private alumnoRepo;
    private inscripcionRepo;
    private sesionRepo;
    constructor(alumnoRepo: Repository<Alumno>, inscripcionRepo: Repository<InscripcionTaller>, sesionRepo: Repository<SesionAsistencia>);
    assertApoderado(user: JwtPayload): number;
    getResumen(alumnoId: number): Promise<{
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
    getAsistenciaPorTaller(alumnoId: number, tallerId: number): Promise<{
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
    }>;
    private formatHorarioTaller;
}
