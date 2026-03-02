import { IsString, IsInt, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservaDto {
  @IsString()
  @IsNotEmpty()
  espacio: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsOptional()
  horaInicio?: string;

  @IsString()
  @IsOptional()
  horaFin?: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  tallerId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  adminId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  profesorId?: number;
}

