import { IsOptional, IsString } from 'class-validator';

export class CerrarSesionDto {
  @IsString()
  @IsOptional()
  observaciones?: string;
}
