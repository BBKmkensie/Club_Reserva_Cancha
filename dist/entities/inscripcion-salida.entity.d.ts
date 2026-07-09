import { Alumno } from './alumno.entity';
import { Salida } from './salida.entity';
export declare class InscripcionSalida {
    id: number;
    alumnoId: number;
    alumno: Alumno;
    salidaId: number;
    salida: Salida;
}
