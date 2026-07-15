/**
 * Registro de asistencia de un alumno inscrito en una salida pedagógica.
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Salida } from './salida.entity';
import { Alumno } from './alumno.entity';

export type EstadoAsistenciaSalida = 'PRESENTE' | 'AUSENTE';

@Entity('registros_asistencia_salida')
@Unique(['salidaId', 'alumnoId'])
export class RegistroAsistenciaSalida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'salida_id' })
  salidaId: number;

  @ManyToOne(() => Salida, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salida_id' })
  salida: Salida;

  @Column({ name: 'alumno_id' })
  alumnoId: number;

  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  @Column({ type: 'varchar', length: 20, default: 'PRESENTE' })
  estado: EstadoAsistenciaSalida;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacion: string | null;
}
