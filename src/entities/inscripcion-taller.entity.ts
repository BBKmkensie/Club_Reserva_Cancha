import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';

export type EstadoInscripcionTaller = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';

@Entity('inscripcion_taller')
@Unique(['alumnoId', 'tallerId'])
export class InscripcionTaller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'alumno_id' })
  alumnoId: number;

  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  @Column({ name: 'taller_id' })
  tallerId: number;

  @ManyToOne(() => Taller, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoInscripcionTaller;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
