/**
 * Propuestas de inscripción iniciadas por apoderado o directiva. Tabla `propuestas_inscripcion_taller`.
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';
import { TallerHorario } from './taller-horario.entity';

export type EstadoPropuestaInscripcion = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

/**
 * Solicitud externa a un taller o actividad libre con horario propuesto.
 */
@Entity('propuestas_inscripcion_taller')
export class PropuestaInscripcionTaller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'alumno_id' })
  alumnoId: number;

  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  @Column({ name: 'taller_id', nullable: true })
  tallerId: number | null;

  @ManyToOne(() => Taller, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller | null;

  /** Nombre cuando la propuesta no apunta a un taller del catálogo. */
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'actividad_libre_nombre' })
  actividadLibreNombre: string | null;

  @Column({ type: 'text', nullable: true, name: 'actividad_libre_descripcion' })
  actividadLibreDescripcion: string | null;

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

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'horario_sugerido_texto' })
  horarioSugeridoTexto: string | null;

  @Column({ type: 'text', nullable: true, name: 'mensaje_apoderado' })
  mensajeApoderado: string | null;

  @Column({ type: 'text', nullable: true, name: 'mensaje_directiva' })
  mensajeDirectiva: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'responded_at' })
  respondedAt: Date | null;
}
