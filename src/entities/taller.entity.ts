import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Alumno } from './alumno.entity';
import { Profesor } from './profesor.entity';
import { Reserva } from './reserva.entity';
import { Salida } from './salida.entity';
import { InscripcionTaller } from './inscripcion-taller.entity';

@Entity('talleres')
export class Taller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'int', default: 20 })
  capacidad: number;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'imagen_url' })
  imagenUrl: string | null;

  @Column({ type: 'date', nullable: true, name: 'fecha_inicio' })
  fechaInicio: Date | null;

  @Column({ name: 'admin_id', nullable: true })
  adminId: number;

  @ManyToOne(() => Admin, (admin) => admin.talleres, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @OneToMany(() => Alumno, (alumno) => alumno.taller)
  alumnos: Alumno[];

  @OneToMany(() => Profesor, (profesor) => profesor.taller)
  profesores: Profesor[];

  @OneToMany(() => Reserva, (reserva) => reserva.taller)
  reservas: Reserva[];

  @OneToMany(() => Salida, (salida) => salida.taller)
  salidas: Salida[];

  @OneToMany(() => InscripcionTaller, (insc) => insc.taller)
  inscripciones: InscripcionTaller[];
}

