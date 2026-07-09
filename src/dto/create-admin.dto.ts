/**
 * DTO para crear una cuenta de administrador o directiva.
 */
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsIn } from 'class-validator';

/**
 * Valida nombre, RUT, email, contraseña y rol del administrador.
 */
export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['super_admin', 'directiva'])
  rol?: 'super_admin' | 'directiva';
}

