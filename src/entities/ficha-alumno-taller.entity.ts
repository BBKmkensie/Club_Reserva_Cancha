import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';

@Entity('ficha_alumno_taller')
@Unique(['alumnoId', 'tallerId'])
export class FichaAlumnoTaller {
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

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  altura: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  peso: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'porcentaje_grasa' })
  porcentajeGrasa: number | null;

  @Column({ type: 'boolean', nullable: true })
  sedentario: boolean | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
