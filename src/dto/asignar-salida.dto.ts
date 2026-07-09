/**
 * DTO para asignar una salida pedagógica desde administración.
 */
import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Valida destino, fecha, horario y responsables de la salida.
 */
export class AsignarSalidaDto {
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

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  adminId?: number;
}
