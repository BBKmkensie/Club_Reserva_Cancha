/**
 * DTO para crear una salida pedagógica.
 */
import { IsString, IsInt, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

/**
 * Valida destino, fecha, horario, taller y responsables de la salida.
 */
export class CreateSalidaDto {
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
  @IsNotEmpty()
  tallerId: number;

  @IsInt()
  @IsOptional()
  adminId?: number;

  @IsInt()
  @IsOptional()
  profesorId?: number;
}

