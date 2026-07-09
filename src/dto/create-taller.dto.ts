/**
 * DTO para crear un nuevo taller extracurricular.
 */
import { IsString, IsInt, IsNotEmpty, IsDateString, IsOptional, Min } from 'class-validator';

/**
 * Valida tipo, descripción, capacidad y fechas del taller.
 */
export class CreateTallerDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacidad?: number;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsInt()
  @IsOptional()
  adminId?: number;

  @IsString()
  @IsOptional()
  imagenUrl?: string;
}

