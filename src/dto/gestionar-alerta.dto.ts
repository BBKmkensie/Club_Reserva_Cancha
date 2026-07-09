/**
 * DTO para gestionar una alerta de ausencia.
 */
import { IsOptional, IsString } from 'class-validator';

/**
 * Valida las notas opcionales al resolver la alerta.
 */
export class GestionarAlertaDto {
  @IsString()
  @IsOptional()
  notas?: string;
}
