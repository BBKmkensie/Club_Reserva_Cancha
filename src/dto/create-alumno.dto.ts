/**
 * DTO para registrar un nuevo alumno.
 */
import { IsString, IsEmail, IsInt, IsNotEmpty, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { EDAD_ALUMNO_MAX, EDAD_ALUMNO_MIN } from '../common/alumno-edad.constants';

/**
 * Valida datos personales, edad, taller y contraseña del alumno.
 */
export class CreateAlumnoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(EDAD_ALUMNO_MIN)
  @Max(EDAD_ALUMNO_MAX)
  edad?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tallerId?: number | null;

  @IsString()
  @IsOptional()
  password?: string;
}

