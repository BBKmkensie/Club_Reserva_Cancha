import { AuthService } from './auth.service';
import { LoginDto } from '../dto/login.dto';
import { JwtPayload } from './auth.types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<import("./auth.types").LoginResponse>;
    me(req: {
        user: JwtPayload;
    }): {
        id: number;
        nombre: string;
        role: import("./auth.types").AppRole;
        tipo: import("./auth.types").UserTipo;
        tallerId: number | undefined;
    };
}
