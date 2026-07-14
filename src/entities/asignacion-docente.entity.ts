/**
 * =============================================================================
 * entities/asignacion-docente.entity.ts — TABLA `asignaciones_docente`
 * =============================================================================
 * Propuestas de asignación de un profesor a un taller (flujo de aceptación/rechazo).
 * Relaciones clave:
 *   - ManyToOne → Taller, Profesor (ambos onDelete CASCADE).
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
import { Taller } from './taller.entity';
import { Profesor } from './profesor.entity';

/** Respuesta del profesor a la propuesta de asignación. */
export type EstadoAsignacionDocente = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

@Entity('asignaciones_docente')
export class AsignacionDocente {
  /** PK autoincremental de la asignación. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK al taller propuesto. */
  @Column({ name: 'taller_id' })
  tallerId: number;

  /** Taller al que se propone asignar al docente. onDelete CASCADE borra la asignación. */
  @ManyToOne(() => Taller, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /** FK al profesor invitado. */
  @Column({ name: 'profesor_id' })
  profesorId: number;

  /** Profesor invitado. onDelete CASCADE elimina propuestas si se borra el profesor. */
  @ManyToOne(() => Profesor, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `profesor_id`. */
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor;

  /**
   * Estado del flujo de asignación:
   * - PENDIENTE: esperando respuesta del profesor.
   * - ACEPTADA: el docente aceptó el taller.
   * - RECHAZADA: el docente declinó (ver motivoRechazo).
   */
  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoAsignacionDocente;

  /** Motivo escrito por el profesor al rechazar. */
  @Column({ type: 'text', nullable: true, name: 'motivo_rechazo' })
  motivoRechazo: string | null;

  /** Timestamp de creación de la propuesta. */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Momento en que el profesor respondió (aceptó o rechazó). */
  @Column({ type: 'timestamp', nullable: true, name: 'responded_at' })
  respondedAt: Date | null;
}
