import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Taller } from './taller.entity';
import { Admin } from './admin.entity';
import { Profesor } from './profesor.entity';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  espacio: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time', nullable: true, name: 'hora_inicio' })
  horaInicio: string;

  @Column({ type: 'time', nullable: true, name: 'hora_fin' })
  horaFin: string;

  @Column({ name: 'taller_id' })
  tallerId: number;

  @ManyToOne(() => Taller, (taller) => taller.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  @Column({ name: 'admin_id', nullable: true })
  adminId: number | null;

  @ManyToOne(() => Admin, (admin) => admin.reservas, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin | null;

  /** Profesor (admin) que reserva la cancha */
  @Column({ name: 'profesor_id', nullable: true })
  profesorId: number | null;

  @ManyToOne(() => Profesor, (profesor) => profesor.reservas, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor | null;
}

