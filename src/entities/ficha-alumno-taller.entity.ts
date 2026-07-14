/**
 * =============================================================================
 * entities/ficha-alumno-taller.entity.ts — TABLA `ficha_alumno_taller`
 * =============================================================================
 * Ficha antropométrica de un alumno asociada a un taller específico.
 * Relaciones clave:
 *   - ManyToOne → Alumno, Taller (onDelete CASCADE).
 * @Unique(['alumnoId', 'tallerId']): una ficha por par alumno-taller.
 * Campos importantes: altura, peso, porcentajeGrasa, sedentario.
 * =============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';

/**
 * @Unique compuesto: un alumno tiene como máximo una ficha por taller.
 * Permite datos distintos si el alumno participa en varios talleres.
 */
@Entity('ficha_alumno_taller')
@Unique(['alumnoId', 'tallerId'])
export class FichaAlumnoTaller {
  /** PK autoincremental de la ficha. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK al alumno dueño de la ficha. */
  @Column({ name: 'alumno_id' })
  alumnoId: number;

  /** Alumno dueño de la ficha. onDelete CASCADE elimina fichas del alumno. */
  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `alumno_id`. */
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  /** FK al taller de esta ficha. */
  @Column({ name: 'taller_id' })
  tallerId: number;

  /** Taller al que corresponde esta ficha. onDelete CASCADE borra fichas del taller. */
  @ManyToOne(() => Taller, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /** Altura en cm (decimal con 2 decimales). */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  altura: number | null;

  /** Peso en kg (decimal con 2 decimales). */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  peso: number | null;

  /** Porcentaje de grasa corporal (opcional). */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'porcentaje_grasa' })
  porcentajeGrasa: number | null;

  /** true si el alumno se declara sedentario; false si es activo. */
  @Column({ type: 'boolean', nullable: true })
  sedentario: boolean | null;

  /** Timestamp de creación de la ficha. */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp de la última actualización de medidas. */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
