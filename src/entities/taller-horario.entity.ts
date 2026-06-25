import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Taller } from './taller.entity';

@Entity('taller_horario')
export class TallerHorario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'taller_id' })
  tallerId: number;

  @ManyToOne(() => Taller, (taller) => taller.horarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /** Código: 1B-8B (básico), 1M-4M (medio) */
  @Column({ type: 'varchar', length: 4, nullable: true })
  curso: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  seccion: string | null;

  @Column({ type: 'smallint', name: 'dia_semana' })
  diaSemana: number;

  @Column({ type: 'time', name: 'hora_inicio' })
  horaInicio: string;

  @Column({ type: 'time', name: 'hora_fin' })
  horaFin: string;
}
