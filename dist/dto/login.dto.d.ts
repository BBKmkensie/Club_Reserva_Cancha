import type { UserTipo } from '../auth/auth.types';
export declare class LoginDto {
    tipo?: UserTipo;
    usuario: string;
    password: string;
}
