import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Profesor } from './profesor.entity';
import { Admin } from './admin.entity';

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'alumno_id', nullable: true })
  alumnoId: number | null;

  @ManyToOne(() => Alumno, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno | null;

  @Column({ name: 'profesor_id', nullable: true })
  profesorId: number | null;

  @ManyToOne(() => Profesor, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor | null;

  @Column({ name: 'admin_id', nullable: true })
  adminId: number | null;

  @ManyToOne(() => Admin, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin | null;

  @Column({ type: 'varchar', length: 100 })
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'varchar', length: 30, default: 'inscripcion_taller' })
  tipo: string;

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
