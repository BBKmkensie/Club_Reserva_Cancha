/**
 * DTO para responder a una asignación docente.
 */
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * Valida aceptación o rechazo con motivo opcional.
 */
export class ResponderAsignacionDto {
  @IsBoolean()
  acepta: boolean;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;
}
