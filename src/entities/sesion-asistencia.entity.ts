/**
 * =============================================================================
 * entities/sesion-asistencia.entity.ts — TABLA `sesiones_asistencia`
 * =============================================================================
 * Sesión de toma de lista de asistencia para un taller en una fecha concreta.
 * Relaciones clave:
 *   - ManyToOne → Taller, Profesor (onDelete CASCADE).
 *   - OneToMany → RegistroAsistencia (un registro por alumno).
 * Campo de estado: ABIERTA | CERRADA.
 * =============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Taller } from './taller.entity';
import { Profesor } from './profesor.entity';
import { RegistroAsistencia } from './registro-asistencia.entity';

/** Ciclo de la sesión de lista: abierta (editable) o cerrada (definitiva). */
export type EstadoSesion = 'ABIERTA' | 'CERRADA';

@Entity('sesiones_asistencia')
export class SesionAsistencia {
  /** PK autoincremental de la sesión. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK al taller cuya asistencia se registra. */
  @Column({ name: 'taller_id' })
  tallerId: number;

  /** Taller cuya asistencia se registra. onDelete CASCADE elimina sesiones del taller. */
  @ManyToOne(() => Taller, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /** FK al profesor que abre/cierra la lista. */
  @Column({ name: 'profesor_id' })
  profesorId: number;

  /** Profesor que abre y cierra la lista. onDelete CASCADE borra sesiones del docente. */
  @ManyToOne(() => Profesor, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `profesor_id`. */
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor;

  /** Fecha de la sesión (YYYY-MM-DD). */
  @Column({ type: 'date' })
  fecha: string;

  /**
   * Estado de la sesión:
   * - ABIERTA: el profesor puede marcar/modificar asistencia.
   * - CERRADA: lista finalizada, no editable.
   */
  @Column({ type: 'varchar', length: 20, default: 'ABIERTA' })
  estado: EstadoSesion;

  /** Observaciones generales al cerrar la sesión. */
  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  /** true cuando el profesor confirmó la lista antes de cerrar la sesión. */
  @Column({ type: 'boolean', default: false, name: 'lista_guardada' })
  listaGuardada: boolean;

  /** Timestamp de apertura de la sesión. */
  @CreateDateColumn({ name: 'opened_at' })
  openedAt: Date;

  /** Timestamp de cierre (null mientras esté ABIERTA). */
  @Column({ type: 'timestamp', nullable: true, name: 'closed_at' })
  closedAt: Date | null;

  /** Registros individuales de asistencia por alumno en esta sesión. */
  @OneToMany(() => RegistroAsistencia, (r) => r.sesion)
  registros: RegistroAsistencia[];
}
