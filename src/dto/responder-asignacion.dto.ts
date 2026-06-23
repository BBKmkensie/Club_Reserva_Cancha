import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ResponderAsignacionDto {
  @IsBoolean()
  acepta: boolean;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;
}
