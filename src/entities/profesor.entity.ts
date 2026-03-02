import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Taller } from './taller.entity';
import { Salida } from './salida.entity';
import { Reserva } from './reserva.entity';

@Entity('profesores')
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 12, unique: true })
  rut: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'foto_path' })
  fotoPath: string;

  @Column({ name: 'taller_id' })
  tallerId: number;

  @ManyToOne(() => Taller, (taller) => taller.profesores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'PasswordHash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'PasswordSalt' })
  passwordSalt: string;

  @OneToMany(() => Salida, (salida) => salida.profesor)
  salidas: Salida[];

  @OneToMany(() => Reserva, (reserva) => reserva.profesor)
  reservas: Reserva[];
}

