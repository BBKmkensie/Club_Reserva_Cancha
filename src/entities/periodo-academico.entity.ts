/**
 * =============================================================================
 * entities/periodo-academico.entity.ts — TABLA `periodo_academico`
 * =============================================================================
 * Períodos académicos con ventanas de inscripción y vigencia del ciclo escolar.
 * Sin relaciones FK; es configuración global del sistema.
 * Campos importantes: fechaApertura/fechaCierre, activo (período vigente).
 * =============================================================================
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('periodo_academico')
export class PeriodoAcademico {
  /** PK autoincremental del período. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre descriptivo (ej. "Primer semestre 2026"). */
  @Column({ type: 'varchar', length: 100, default: 'Período actual' })
  nombre: string;

  /** Fecha de inicio del período (apertura de inscripciones y operaciones). */
  @Column({ type: 'date', name: 'fecha_apertura' })
  fechaApertura: Date;

  /** Fecha de término del período (cierre de inscripciones y operaciones). */
  @Column({ type: 'date', name: 'fecha_cierre' })
  fechaCierre: Date;

  /**
   * Indica si este es el período académico vigente.
   * Solo uno debería estar activo; controla validaciones de fechas en inscripciones.
   */
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  /** Timestamp de creación del registro. */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
