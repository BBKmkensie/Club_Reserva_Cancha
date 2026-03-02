import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Taller } from './taller.entity';
import { InscripcionSalida } from './inscripcion-salida.entity';
import { InscripcionTaller } from './inscripcion-taller.entity';

@Entity('alumnos')
export class Alumno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 12, unique: true })
  rut: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'int', nullable: true })
  edad: number;

  @Column({ name: 'taller_id', nullable: true })
  tallerId: number | null;

  @ManyToOne(() => Taller, (taller) => taller.alumnos, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'PasswordHash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'PasswordSalt' })
  passwordSalt: string;

  @OneToMany(() => InscripcionSalida, (insc) => insc.alumno)
  inscripcionesSalida: InscripcionSalida[];

  @OneToMany(() => InscripcionTaller, (insc) => insc.alumno)
  inscripcionesTaller: InscripcionTaller[];
}

