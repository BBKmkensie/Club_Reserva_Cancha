import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SesionAsistencia } from './sesion-asistencia.entity';
import { Alumno } from './alumno.entity';

export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDE';

@Entity('registros_asistencia')
@Unique(['sesionId', 'alumnoId'])
export class RegistroAsistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sesion_id' })
  sesionId: number;

  @ManyToOne(() => SesionAsistencia, (s) => s.registros, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sesion_id' })
  sesion: SesionAsistencia;

  @Column({ name: 'alumno_id' })
  alumnoId: number;

  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  @Column({ type: 'varchar', length: 20, default: 'AUSENTE' })
  estado: EstadoAsistencia;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacion: string | null;
}
