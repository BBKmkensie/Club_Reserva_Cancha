/**
 * DTO para configurar el período académico vigente.
 */
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Valida nombre opcional y fechas de apertura y cierre del período.
 */
export class PeriodoAcademicoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaApertura: string;

  @IsDateString()
  @IsNotEmpty()
  fechaCierre: string;
}
