import { Taller } from './taller.entity';
import { Admin } from './admin.entity';
import { Profesor } from './profesor.entity';
import { InscripcionSalida } from './inscripcion-salida.entity';
export declare class Salida {
    id: number;
    destino: string;
    fecha: Date;
    hora: string;
    descripcion: string;
    tallerId: number;
    taller: Taller;
    adminId: number | null;
    admin: Admin | null;
    profesorId: number | null;
    profesor: Profesor | null;
    origen: string;
    estado: string;
    resultado: string | null;
    comentarioCierre: string | null;
    comentarioApertura: string | null;
    motivoRechazo: string | null;
    fechaApertura: Date | null;
    fechaCierre: Date | null;
    fechaRespuesta: Date | null;
    inscripciones: InscripcionSalida[];
}
