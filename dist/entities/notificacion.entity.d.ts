import { Alumno } from './alumno.entity';
import { Profesor } from './profesor.entity';
import { Admin } from './admin.entity';
export declare class Notificacion {
    id: number;
    alumnoId: number | null;
    alumno: Alumno | null;
    profesorId: number | null;
    profesor: Profesor | null;
    adminId: number | null;
    admin: Admin | null;
    titulo: string;
    mensaje: string;
    tipo: string;
    refId: number | null;
    leida: boolean;
    createdAt: Date;
}
