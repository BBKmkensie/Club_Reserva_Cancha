import { IsOptional, IsString } from 'class-validator';

export class GestionarAlertaDto {
  @IsString()
  @IsOptional()
  notas?: string;
}
