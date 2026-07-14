/**
 * =============================================================================
 * entities/registro-asistencia.entity.ts — TABLA `registros_asistencia`
 * =============================================================================
 * Registro individual de asistencia de un alumno en una sesión de lista.
 * Relaciones clave:
 *   - ManyToOne → SesionAsistencia (onDelete CASCADE).
 *   - ManyToOne → Alumno (onDelete CASCADE).
 * @Unique(['sesionId', 'alumnoId']): un solo registro por alumno por sesión.
 * Campo de estado: PRESENTE | AUSENTE | TARDE.
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
import { SesionAsistencia } from './sesion-asistencia.entity';
import { Alumno } from './alumno.entity';

/** Marca de asistencia del alumno en la sesión. */
export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDE';

/**
 * @Unique compuesto: garantiza un único registro de asistencia por alumno
 * en cada sesión de lista.
 */
@Entity('registros_asistencia')
@Unique(['sesionId', 'alumnoId'])
export class RegistroAsistencia {
  /** PK autoincremental del registro. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK a la sesión de lista. */
  @Column({ name: 'sesion_id' })
  sesionId: number;

  /**
   * Sesión de lista a la que pertenece este registro.
   * onDelete CASCADE: al cerrar/eliminar la sesión se borran sus registros.
   * Conecta con SesionAsistencia.registros (OneToMany).
   */
  @ManyToOne(() => SesionAsistencia, (s) => s.registros, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `sesion_id`. */
  @JoinColumn({ name: 'sesion_id' })
  sesion: SesionAsistencia;

  /** FK al alumno evaluado. */
  @Column({ name: 'alumno_id' })
  alumnoId: number;

  /** Alumno evaluado. onDelete CASCADE elimina registros si se borra el alumno. */
  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `alumno_id`. */
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno;

  /**
   * Estado de asistencia:
   * - PRESENTE: asistió a tiempo.
   * - AUSENTE: no asistió (cuenta para AlertaAusencia).
   * - TARDE: llegó fuera de horario.
   */
  @Column({ type: 'varchar', length: 20, default: 'PRESENTE' })
  estado: EstadoAsistencia;

  /** Nota libre del profesor sobre este alumno en la sesión. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  observacion: string | null;
}
