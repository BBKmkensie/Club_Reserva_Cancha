/**
 * =============================================================================
 * entities/propuesta-inscripcion-taller.entity.ts — TABLA `propuestas_inscripcion_taller`
 * =============================================================================
 * Propuestas de inscripción iniciadas por apoderado o directiva (flujo externo).
 * Relaciones clave:
 *   - ManyToOne → Alumno (onDelete CASCADE).
 *   - ManyToOne → Taller (nullable; onDelete CASCADE).
 *   - ManyToOne → TallerHorario ×2 (horario propuesto y sugerido; onDelete SET NULL).
 * Campo de estado: PENDIENTE | ACEPTADA | RECHAZADA.
 * =============================================================================
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

/** Quién envió la propuesta a la directiva. */
export type OrigenPropuestaInscripcion = 'APODERADO' | 'ALUMNO';

/** Respuesta de la directiva a la propuesta del apoderado. */
export type EstadoPropuestaInscripcion = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

@Entity('propuestas_inscripcion_taller')
export class PropuestaInscripcionTaller {
  /** PK autoincremental de la propuesta. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK al alumno al que se propone inscribir. */
  @Column({ name: 'alumno_id' })
  alumnoId: number;

  /** Alumno al que se propone inscribir. onDelete CASCADE borra propuestas del alumno. */
  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `alumno_id`. */
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  /** FK al taller del catálogo (null si es actividad libre). */
  @Column({ name: 'taller_id', nullable: true })
  tallerId: number | null;

  /**
   * Taller del catálogo (null si es actividad libre no registrada).
   * onDelete CASCADE: eliminar el taller borra propuestas asociadas.
   */
  @ManyToOne(() => Taller, { onDelete: 'CASCADE', nullable: true })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller | null;

  /** Nombre de actividad cuando no apunta a un taller existente en el catálogo. */
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'actividad_libre_nombre' })
  actividadLibreNombre: string | null;

  /** Descripción de la actividad libre propuesta. */
  @Column({ type: 'text', nullable: true, name: 'actividad_libre_descripcion' })
  actividadLibreDescripcion: string | null;

  /**
   * Origen de la propuesta:
   * - APODERADO: portal del apoderado
   * - ALUMNO: el propio estudiante desde inscripción de talleres
   */
  @Column({ type: 'varchar', length: 20, default: 'APODERADO' })
  origen: OrigenPropuestaInscripcion;

  /**
   * Estado del flujo de propuesta:
   * - PENDIENTE: en evaluación por directiva.
   * - ACEPTADA: se crea InscripcionTaller u otra acción de admisión.
   * - RECHAZADA: propuesta denegada (ver motivoRechazo).
   */
  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoPropuestaInscripcion;

  /** Motivo escrito por la directiva al rechazar. */
  @Column({ type: 'text', nullable: true, name: 'motivo_rechazo' })
  motivoRechazo: string | null;

  /** FK al horario elegido por el apoderado. */
  @Column({ name: 'taller_horario_id', nullable: true })
  tallerHorarioId: number | null;

  /**
   * Horario elegido por el apoderado al postular.
   * onDelete SET NULL: si se elimina el horario, la propuesta conserva horarioPropuestoTexto.
   */
  @ManyToOne(() => TallerHorario, { onDelete: 'SET NULL', nullable: true })
  /** Une la relación con la columna física `taller_horario_id`. */
  @JoinColumn({ name: 'taller_horario_id' })
  tallerHorario: TallerHorario | null;

  /** Texto libre del horario cuando no hay TallerHorario asociado. */
  @Column({ type: 'varchar', length: 200, nullable: true, name: 'horario_propuesto_texto' })
  horarioPropuestoTexto: string | null;

  /** FK al horario alternativo sugerido por la directiva. */
  @Column({ name: 'horario_sugerido_id', nullable: true })
  horarioSugeridoId: number | null;

  /**
   * Horario alternativo sugerido por la directiva en la respuesta.
   * onDelete SET NULL: conserva horarioSugeridoTexto como respaldo.
   */
  @ManyToOne(() => TallerHorario, { onDelete: 'SET NULL', nullable: true })
  /** Une la relación con la columna física `horario_sugerido_id`. */
  @JoinColumn({ name: 'horario_sugerido_id' })
  horarioSugerido: TallerHorario | null;

  /** Texto del horario sugerido (respaldo si no hay TallerHorario). */
  @Column({ type: 'varchar', length: 200, nullable: true, name: 'horario_sugerido_texto' })
  horarioSugeridoTexto: string | null;

  /** Mensaje libre del apoderado al proponer. */
  @Column({ type: 'text', nullable: true, name: 'mensaje_apoderado' })
  mensajeApoderado: string | null;

  /** Mensaje libre de la directiva al responder. */
  @Column({ type: 'text', nullable: true, name: 'mensaje_directiva' })
  mensajeDirectiva: string | null;

  /** Timestamp de creación de la propuesta. */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp de respuesta de la directiva (aceptar/rechazar). */
  @Column({ type: 'timestamp', nullable: true, name: 'responded_at' })
  respondedAt: Date | null;
}
