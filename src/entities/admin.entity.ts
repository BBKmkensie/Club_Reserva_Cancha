import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Taller } from './taller.entity';
import { Reserva } from './reserva.entity';
import { Salida } from './salida.entity';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 12, unique: true })
  rut: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'PasswordHash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, name: 'PasswordSalt' })
  passwordSalt: string;

  /** Rol: super_admin | directiva (mismos permisos de coordinador) */
  @Column({ type: 'varchar', length: 20, default: 'super_admin' })
  rol: string;

  @OneToMany(() => Taller, (taller) => taller.admin)
  talleres: Taller[];

  @OneToMany(() => Reserva, (reserva) => reserva.admin)
  reservas: Reserva[];

  @OneToMany(() => Salida, (salida) => salida.admin)
  salidas: Salida[];
}

