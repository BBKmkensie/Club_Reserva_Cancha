import { IsIn } from 'class-validator';

export class ResponderInscripcionTallerDto {
  @IsIn(['ACEPTADO', 'RECHAZADO'])
  estado: 'ACEPTADO' | 'RECHAZADO';
}
