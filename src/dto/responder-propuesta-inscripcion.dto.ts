import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ResponderPropuestaInscripcionDto {
  @IsBoolean()
  acepta: boolean;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;
}
