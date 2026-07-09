export interface ProfesorCatalogoSeed {
    nombre: string;
    rut: string;
    email: string;
}
export interface TallerCatalogoSeed {
    tipo: string;
    alias?: string[];
    descripcion: string;
    imagenUrl: string;
    conProfesor: boolean;
    profesor?: ProfesorCatalogoSeed;
}
export declare const CATALOGO_TALLERES_SEED: TallerCatalogoSeed[];
export declare function normalizarNombreTaller(nombre: string): string;
