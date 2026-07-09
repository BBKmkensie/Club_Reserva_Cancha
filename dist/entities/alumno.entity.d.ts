import { Taller } from './taller.entity';
import { InscripcionSalida } from './inscripcion-salida.entity';
import { InscripcionTaller } from './inscripcion-taller.entity';
export declare class Alumno {
    id: number;
    nombre: string;
    rut: string;
    email: string;
    telefono: string;
    edad: number;
    tallerId: number | null;
    taller: Taller | null;
    passwordHash: string;
    passwordSalt: string;
    apoderadoNombre: string | null;
    apoderadoTelefono: string | null;
    apoderadoEmail: string | null;
    apoderadoRut: string | null;
    apoderadoPasswordHash: string | null;
    apoderadoPasswordSalt: string | null;
    inscripcionesSalida: InscripcionSalida[];
    inscripcionesTaller: InscripcionTaller[];
}
