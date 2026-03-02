import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Taller } from './taller.entity';
import { Admin } from './admin.entity';
import { Profesor } from './profesor.entity';
import { InscripcionSalida } from './inscripcion-salida.entity';

@Entity('salidas')
export class Salida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  destino: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time', nullable: true })
  hora: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'taller_id' })
  tallerId: number;

  @ManyToOne(() => Taller, (taller) => taller.salidas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  @Column({ name: 'admin_id', nullable: true })
  adminId: number;

  @ManyToOne(() => Admin, (admin) => admin.salidas, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @Column({ name: 'profesor_id', nullable: true })
  profesorId: number;

  @ManyToOne(() => Profesor, (profesor) => profesor.salidas, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor;

  @OneToMany(() => InscripcionSalida, (insc) => insc.salida)
  inscripciones: InscripcionSalida[];
}

