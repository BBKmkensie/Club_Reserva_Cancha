import { IsString, IsInt, IsNotEmpty, IsDateString, IsOptional, Min } from 'class-validator';

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

