import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ResponderSalidaDto {
  @IsBoolean()
  acepta: boolean;

  @IsString()
  @IsOptional()
  motivo?: string;
}
