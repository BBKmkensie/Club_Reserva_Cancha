/**
 * =============================================================================
 * entities/inscripcion-taller.entity.ts — TABLA `inscripcion_taller`
 * =============================================================================
 * Solicitud de inscripción de un alumno a un taller extracurricular.
 * Relaciones clave:
 *   - ManyToOne → Alumno, Taller (ambos onDelete CASCADE).
 * @Unique(['alumnoId', 'tallerId']): una postulación por par alumno-taller.
 * Campo de estado: PENDIENTE | ACEPTADO | RECHAZADO.
 * =============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';

/** Ciclo de aprobación de la postulación al taller. */
export type EstadoInscripcionTaller = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';

/**
 * @Unique compuesto: evita que un alumno tenga más de una inscripción al mismo taller.
 */
@Entity('inscripcion_taller')
@Unique(['alumnoId', 'tallerId'])
export class InscripcionTaller {
  /** PK autoincremental de la inscripción. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK al alumno postulante. */
  @Column({ name: 'alumno_id' })
  alumnoId: number;

  /** Alumno postulante. onDelete CASCADE elimina la inscripción si se borra el alumno. */
  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `alumno_id`. */
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  /** FK al taller al que postula. */
  @Column({ name: 'taller_id' })
  tallerId: number;

  /** Taller al que postula. onDelete CASCADE borra inscripciones al eliminar el taller. */
  @ManyToOne(() => Taller, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /**
   * Estado de la postulación:
   * - PENDIENTE: en revisión por directiva/docente.
   * - ACEPTADO: alumno admitido al taller.
   * - RECHAZADO: postulación denegada.
   */
  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoInscripcionTaller;

  /** Altura (cm) capturada al momento de la postulación. */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  altura: number | null;

  /** Peso (kg) capturado al momento de la postulación. */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  peso: number | null;

  /** % de grasa corporal capturado al postular. */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'porcentaje_grasa' })
  porcentajeGrasa: number | null;

  /** Indica si el alumno se declaró sedentario al inscribirse. */
  @Column({ type: 'boolean', nullable: true })
  sedentario: boolean | null;

  /** Timestamp de creación de la postulación. */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
