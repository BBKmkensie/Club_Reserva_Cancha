import { Taller } from './taller.entity';
import { Admin } from './admin.entity';
import { Profesor } from './profesor.entity';
export declare class Reserva {
    id: number;
    espacio: string;
    fecha: Date;
    horaInicio: string;
    horaFin: string;
    tallerId: number;
    taller: Taller;
    adminId: number | null;
    admin: Admin | null;
    profesorId: number | null;
    profesor: Profesor | null;
}
