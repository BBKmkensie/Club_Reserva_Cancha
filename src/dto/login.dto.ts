import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { UserTipo } from '../auth/auth.types';

export class LoginDto {
  @IsOptional()
  @IsIn(['admin', 'directiva', 'profesor', 'alumno'])
  tipo?: UserTipo;

  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
