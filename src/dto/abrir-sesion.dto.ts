import { IsInt, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class AbrirSesionDto {
  @IsInt()
  @IsNotEmpty()
  tallerId: number;

  @IsInt()
  @IsNotEmpty()
  profesorId: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;
}
