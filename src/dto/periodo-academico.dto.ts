import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
