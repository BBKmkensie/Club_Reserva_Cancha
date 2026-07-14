/**
 * =============================================================================
 * entities/alerta-ausencia.entity.ts — TABLA `alertas_ausencia`
 * =============================================================================
 * Alertas generadas cuando un alumno supera el umbral de ausencias en un taller.
 * Relaciones clave:
 *   - ManyToOne → Alumno, Taller (onDelete CASCADE).
 * Campo de estado: PENDIENTE → APODERADO_CONTACTADO → RESUELTO.
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

/**
 * Ciclo de seguimiento de la alerta:
 * - PENDIENTE: recién generada, sin acción.
 * - APODERADO_CONTACTADO: se notificó al apoderado.
 * - RESUELTO: caso cerrado (asistencia regularizada u otra resolución).
 */
export type EstadoAlertaAusencia = 'PENDIENTE' | 'APODERADO_CONTACTADO' | 'RESUELTO';

@Entity('alertas_ausencia')
export class AlertaAusencia {
  /** PK autoincremental de la alerta. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK al alumno con ausencias acumuladas. */
  @Column({ name: 'alumno_id' })
  alumnoId: number;

  /** Alumno con ausencias acumuladas. onDelete CASCADE borra alertas del alumno. */
  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `alumno_id`. */
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  /** FK al taller donde se acumularon las ausencias. */
  @Column({ name: 'taller_id' })
  tallerId: number;

  /** Taller donde se acumularon las ausencias. onDelete CASCADE elimina alertas del taller. */
  @ManyToOne(() => Taller, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /** Cantidad de ausencias que disparó la alerta (comparada con Taller.umbralAusencias). */
  @Column({ name: 'cantidad_ausencias', type: 'int' })
  cantidadAusencias: number;

  /** Estado del ciclo: PENDIENTE | APODERADO_CONTACTADO | RESUELTO. */
  @Column({ type: 'varchar', length: 30, default: 'PENDIENTE' })
  estado: EstadoAlertaAusencia;

  /** Notas del coordinador al contactar o resolver. */
  @Column({ type: 'text', nullable: true })
  notas: string | null;

  /** Timestamp de creación de la alerta. */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Marca de tiempo cuando se contactó al apoderado (estado → APODERADO_CONTACTADO). */
  @Column({ type: 'timestamp', nullable: true, name: 'contactado_at' })
  contactadoAt: Date | null;

  /** Marca de tiempo cuando se resolvió la alerta (estado → RESUELTO). */
  @Column({ type: 'timestamp', nullable: true, name: 'resuelto_at' })
  resueltoAt: Date | null;
}
