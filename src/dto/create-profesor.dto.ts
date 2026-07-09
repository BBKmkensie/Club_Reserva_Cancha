/**
 * DTO para crear un profesor y asociarlo a un taller.
 */
import { IsString, IsEmail, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * Valida datos personales, contacto, taller y contraseña del profesor.
 */
export class CreateProfesorDto {
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
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  fotoPath?: string;

  @IsInt()
  @IsNotEmpty()
  tallerId: number;

  @IsString()
  @IsOptional()
  password?: string;
}

