/**
 * DTO para autenticación de profesores.
 */
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Valida usuario y contraseña del profesor.
 */
export class LoginProfesorDto {
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
