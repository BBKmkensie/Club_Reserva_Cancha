import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Salida } from './salida.entity';

@Entity('inscripcion_salida')
@Unique(['alumnoId', 'salidaId'])
export class InscripcionSalida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'alumno_id' })
  alumnoId: number;

  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  @Column({ name: 'salida_id' })
  salidaId: number;

  @ManyToOne(() => Salida, (salida) => salida.inscripciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salida_id' })
  salida: Salida;
}
