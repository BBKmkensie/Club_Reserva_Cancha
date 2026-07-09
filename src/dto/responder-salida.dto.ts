/**
 * DTO para responder a una propuesta de salida pedagógica.
 */
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * Valida aceptación o rechazo con motivo opcional.
 */
export class ResponderSalidaDto {
  @IsBoolean()
  acepta: boolean;

  @IsString()
  @IsOptional()
  motivo?: string;
}
