import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Taller } from './taller.entity';
import { Profesor } from './profesor.entity';

export type EstadoAsignacionDocente = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

@Entity('asignaciones_docente')
export class AsignacionDocente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'taller_id' })
  tallerId: number;

  @ManyToOne(() => Taller, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  @Column({ name: 'profesor_id' })
  profesorId: number;

  @ManyToOne(() => Profesor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor;

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoAsignacionDocente;

  @Column({ type: 'text', nullable: true, name: 'motivo_rechazo' })
  motivoRechazo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'responded_at' })
  respondedAt: Date | null;
}
