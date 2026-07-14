/**
 * =============================================================================
 * entities/inscripcion-salida.entity.ts — TABLA `inscripcion_salida`
 * =============================================================================
 * Tabla intermedia que vincula un alumno con una salida pedagógica.
 * Relaciones clave:
 *   - ManyToOne → Alumno (onDelete CASCADE).
 *   - ManyToOne → Salida (onDelete CASCADE).
 * @Unique(['alumnoId', 'salidaId']): un alumno solo puede inscribirse una vez por salida.
 * =============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Salida } from './salida.entity';

/**
 * @Unique compuesto: impide inscripciones duplicadas del mismo alumno
 * a la misma salida.
 */
@Entity('inscripcion_salida')
@Unique(['alumnoId', 'salidaId'])
export class InscripcionSalida {
  /** PK autoincremental de la inscripción. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK al alumno inscrito. */
  @Column({ name: 'alumno_id' })
  alumnoId: number;

  /**
   * Alumno inscrito. onDelete CASCADE: si se elimina el alumno, se borran sus inscripciones.
   */
  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `alumno_id`. */
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  /** FK a la salida pedagógica. */
  @Column({ name: 'salida_id' })
  salidaId: number;

  /**
   * Salida a la que se inscribe. onDelete CASCADE: eliminar la salida borra las inscripciones.
   * El segundo argumento conecta con Salida.inscripciones (lado OneToMany).
   */
  @ManyToOne(() => Salida, (salida) => salida.inscripciones, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `salida_id`. */
  @JoinColumn({ name: 'salida_id' })
  salida: Salida;
}
