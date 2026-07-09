/**
 * DTO para que un profesor proponga una salida pedagógica.
 */
import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Valida destino, fecha, horario, taller y profesor de la propuesta.
 */
export class ProponerSalidaDto {
  @IsString()
  @IsNotEmpty()
  destino: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsOptional()
  hora?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Type(() => Number)
  tallerId: number;

  @IsInt()
  @Type(() => Number)
  profesorId: number;
}
