import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';
export declare class FichaAlumnoTaller {
    id: number;
    alumnoId: number;
    alumno: Alumno;
    tallerId: number;
    taller: Taller;
    altura: number | null;
    peso: number | null;
    porcentajeGrasa: number | null;
    sedentario: boolean | null;
    createdAt: Date;
    updatedAt: Date;
}
