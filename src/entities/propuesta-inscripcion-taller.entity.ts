import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';
import { TallerHorario } from './taller-horario.entity';

export type EstadoPropuestaInscripcion = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

@Entity('propuestas_inscripcion_taller')
@Unique(['alumnoId', 'tallerId'])
export class PropuestaInscripcionTaller {
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

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoPropuestaInscripcion;

  @Column({ type: 'text', nullable: true, name: 'motivo_rechazo' })
  motivoRechazo: string | null;

  @Column({ name: 'taller_horario_id', nullable: true })
  tallerHorarioId: number | null;

  @ManyToOne(() => TallerHorario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'taller_horario_id' })
  tallerHorario: TallerHorario | null;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'horario_propuesto_texto' })
  horarioPropuestoTexto: string | null;

  @Column({ name: 'horario_sugerido_id', nullable: true })
  horarioSugeridoId: number | null;

  @ManyToOne(() => TallerHorario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'horario_sugerido_id' })
  horarioSugerido: TallerHorario | null;

  @Column({ type: 'text', nullable: true, name: 'mensaje_apoderado' })
  mensajeApoderado: string | null;

  @Column({ type: 'text', nullable: true, name: 'mensaje_directiva' })
  mensajeDirectiva: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'responded_at' })
  respondedAt: Date | null;
}
