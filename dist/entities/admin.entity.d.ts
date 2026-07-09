import { Taller } from './taller.entity';
import { Reserva } from './reserva.entity';
import { Salida } from './salida.entity';
export declare class Admin {
    id: number;
    nombre: string;
    rut: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    rol: string;
    talleres: Taller[];
    reservas: Reserva[];
    salidas: Salida[];
}
