import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';

export type EstadoAlertaAusencia = 'PENDIENTE' | 'APODERADO_CONTACTADO' | 'RESUELTO';

@Entity('alertas_ausencia')
export class AlertaAusencia {
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

  @Column({ name: 'cantidad_ausencias', type: 'int' })
  cantidadAusencias: number;

  @Column({ type: 'varchar', length: 30, default: 'PENDIENTE' })
  estado: EstadoAlertaAusencia;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'contactado_at' })
  contactadoAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'resuelto_at' })
  resueltoAt: Date | null;
}
