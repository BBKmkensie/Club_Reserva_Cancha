import { Taller } from './taller.entity';
import { Salida } from './salida.entity';
import { Reserva } from './reserva.entity';
export declare class Profesor {
    id: number;
    nombre: string;
    rut: string;
    email: string;
    telefono: string;
    fotoPath: string | null;
    tallerId: number;
    taller: Taller;
    passwordHash: string;
    passwordSalt: string;
    salidas: Salida[];
    reservas: Reserva[];
}
