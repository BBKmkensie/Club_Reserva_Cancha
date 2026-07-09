/**
 * DTO para crear una reserva de cancha o espacio deportivo.
 */
import { IsString, IsInt, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Valida espacio, fecha, horario y responsables de la reserva.
 */
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

