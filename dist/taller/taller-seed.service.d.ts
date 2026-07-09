import { Repository } from 'typeorm';
import { Taller } from '../entities/taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { TallerHorario } from '../entities/taller-horario.entity';
export interface SeedCatalogoTalleresResult {
    creados: number;
    actualizados: number;
    profesoresAsignados: number;
    profesoresCreados: number;
    detalle: Array<{
        tipo: string;
        accion: 'creado' | 'actualizado';
        profesor?: string;
    }>;
}
export interface SeedHorariosOficialesResult {
    actualizados: string[];
    bloquesCargados: number;
    noEncontrados: string[];
}
export declare class TallerSeedService {
    private tallerRepo;
    private profesorRepo;
    private horarioRepo;
    constructor(tallerRepo: Repository<Taller>, profesorRepo: Repository<Profesor>, horarioRepo: Repository<TallerHorario>);
    seedCatalogoTalleres(): Promise<SeedCatalogoTalleresResult>;
    seedHorariosOficiales(): Promise<SeedHorariosOficialesResult>;
    private aliasDe;
    private resolverProfesor;
}
